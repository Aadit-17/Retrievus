from pinecone import Pinecone
from typing import List, Dict, Any
from config import Config
import re
from collections import Counter
import math

class PineconeService:
    def __init__(self):
        self.pc = Pinecone(api_key=Config.PINECONE_API_KEY)
        self.index_name = Config.PINECONE_INDEX_NAME
        self.namespace = Config.PINECONE_NAMESPACE
    
    def get_index(self):
        """Get the index instance using the regular Pinecone client for search functionality."""
        try:
            return self.pc.Index(self.index_name)
        except Exception as e:
            raise Exception(f"Could not connect to index '{self.index_name}': {str(e)}")
    
    def _tokenize_text(self, text: str) -> List[str]:
        """Simple tokenization for BM25 scoring."""
        # Convert to lowercase and split on non-alphanumeric characters
        tokens = re.findall(r'\b\w+\b', text.lower())
        return tokens
    
    def _bm25_score(self, query_tokens: List[str], doc_tokens: List[str], 
                   avg_doc_length: float, total_docs: int, term_frequencies: Dict[str, int]) -> float:
        """Calculate BM25 score for a document given query tokens."""
        k1, b = 1.5, 0.75  # BM25 parameters
        doc_length = len(doc_tokens)
        doc_term_freq = Counter(doc_tokens)
        score = 0.0
        
        for term in query_tokens:
            if term in doc_term_freq:
                tf = doc_term_freq[term]
                df = term_frequencies.get(term, 1)  # document frequency
                idf = math.log((total_docs - df + 0.5) / (df + 0.5))
                score += idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (doc_length / avg_doc_length)))
        
        return score
    
    def _bm25_rerank(self, chunks: List[Dict], query: str, top_n: int) -> List[Dict]:
        """Apply BM25 reranking to retrieved chunks."""
        if not chunks:
            return chunks
        
        query_tokens = self._tokenize_text(query)
        if not query_tokens:
            return chunks[:top_n]
        
        # Tokenize all documents and calculate statistics
        doc_tokens_list = []
        term_frequencies = Counter()
        
        for chunk in chunks:
            doc_tokens = self._tokenize_text(chunk["text"])
            doc_tokens_list.append(doc_tokens)
            # Count unique terms for document frequency
            unique_terms = set(doc_tokens)
            for term in unique_terms:
                term_frequencies[term] += 1
        
        avg_doc_length = sum(len(tokens) for tokens in doc_tokens_list) / len(doc_tokens_list)
        total_docs = len(chunks)
        
        # Calculate BM25 scores
        for i, chunk in enumerate(chunks):
            bm25_score = self._bm25_score(
                query_tokens, doc_tokens_list[i], 
                avg_doc_length, total_docs, term_frequencies
            )
            chunk["score"] = round(bm25_score, 4)
        
        # Sort by BM25 score and return top_n
        reranked = sorted(chunks, key=lambda x: x["score"], reverse=True)
        return reranked[:top_n]
    
    def search_documents(self, query: str, role: str, retrieval_mode: str = "dense", 
                        rerank: bool = False, top_k: int = 5) -> Dict[str, Any]:
        """Unified retrieval function supporting dense, sparse, and hybrid search with RBAC filtering."""
        try:
            index = self.get_index()
            
            # Construct filter for RBAC
            filter_dict = {"role": {"$eq": role}}
            
            # Generate embeddings for the query using Pinecone's integrated embeddings
            # We'll use the embed method if available, otherwise fall back to a simple approach
            try:
                # Try to use Pinecone's integrated embeddings
                embed_response = self.pc.inference.embed(
                    model="llama-text-embed-v2",
                    inputs=[query],
                    parameters={"input_type": "query"}
                )
                query_vector = embed_response[0]['values']
            except Exception as embed_error:
                # Fallback: create a simple semantic query using keyword matching
                print(f"Embedding failed, using fallback approach: {embed_error}")
                query_vector = [0.1] * 1024  # Simple non-zero vector for basic retrieval
            
            # Build query payload based on retrieval_mode
            if retrieval_mode == "dense":
                query_payload = {
                    "vector": query_vector,
                    "top_k": top_k,
                    "filter": filter_dict,
                    "include_metadata": True,
                    "namespace": self.namespace
                }
            elif retrieval_mode in ["sparse", "hybrid"]:
                # Sparse/hybrid use more results for reranking
                query_payload = {
                    "vector": query_vector,
                    "top_k": min(top_k * 3, 100),
                    "filter": filter_dict,
                    "include_metadata": True,
                    "namespace": self.namespace
                }
            else:
                return {
                    "success": False,
                    "message": f"Unsupported retrieval mode: {retrieval_mode}",
                    "chunks": []
                }
            
            # Perform the query using index.query (works with filter)
            results = index.query(**query_payload)
            
            # Extract matches (updated response structure)
            chunks = []
            for hit in results.get("matches", []):
                chunk = {
                    "id": hit["id"],
                    "text": hit.get("metadata", {}).get("chunk_text", ""),
                    "role": hit.get("metadata", {}).get("role", ""),
                    "score": round(hit.get("score", 0), 4)
                }
                chunks.append(chunk)
            
            # Apply retrieval mode specific processing
            if retrieval_mode == "sparse":
                # For sparse mode, use BM25 reranking
                chunks = self._bm25_rerank(chunks, query, top_k)
            elif retrieval_mode == "hybrid" and chunks:
                # Store original dense scores
                for chunk in chunks:
                    chunk["dense_score"] = chunk["score"]
                
                # Calculate BM25 scores
                bm25_chunks = self._bm25_rerank(chunks.copy(), query, len(chunks))
                bm25_scores = {chunk["id"]: chunk["score"] for chunk in bm25_chunks}
                
                # Combine scores (weighted average)
                alpha = 0.7  # Weight for dense score (0.7 dense + 0.3 sparse)
                max_dense = max(c["dense_score"] for c in chunks) or 1.0
                max_sparse = max(bm25_scores.values()) or 1.0
                
                for chunk in chunks:
                    normalized_dense = chunk["dense_score"] / max_dense
                    normalized_sparse = bm25_scores.get(chunk["id"], 0) / max_sparse
                    chunk["score"] = round(alpha * normalized_dense + (1 - alpha) * normalized_sparse, 4)
                
                chunks = sorted(chunks, key=lambda x: x["score"], reverse=True)[:top_k]
            
            # Ensure we don't return more than top_k results
            chunks = chunks[:top_k]
            
            # If we used the fallback vector and have results, do basic text filtering
            if query_vector == [0.1] * 1024 and chunks:
                # Simple text-based filtering as fallback
                query_lower = query.lower()
                filtered_chunks = []
                for chunk in chunks:
                    text_lower = chunk["text"].lower()
                    # Simple relevance scoring based on keyword presence
                    query_words = query_lower.split()
                    matches = sum(1 for word in query_words if word in text_lower)
                    if matches > 0:
                        # Update score based on keyword matches
                        chunk["score"] = round(matches / len(query_words), 4)
                        filtered_chunks.append(chunk)
                
                if filtered_chunks:
                    # Sort by text relevance score
                    chunks = sorted(filtered_chunks, key=lambda x: x["score"], reverse=True)[:top_k]
                else:
                    # If no text matches, just return first few results
                    chunks = chunks[:top_k]
            
            return {
                "success": True,
                "chunks": chunks,
                "metadata": {
                    "query": query,
                    "role": role,
                    "retrieval_mode": retrieval_mode,
                    "total_results": len(chunks)
                }
            }
        except Exception as e:
            import traceback
            return {
                "success": False,
                "message": f"Error searching documents: {str(e)}",
                "chunks": [],
                "error_details": traceback.format_exc()
            }