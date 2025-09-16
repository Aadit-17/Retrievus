import google.generativeai as genai
from typing import List, Dict, Any
from ..config import Config

class GeminiService:
    def __init__(self):
        genai.configure(api_key=Config.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(Config.GEMINI_MODEL)
    
    def generate_response(self, query: str, retrieved_chunks: List[Dict]) -> Dict[str, Any]:
        """Generate a response using Gemini with retrieved chunks as context"""
        try:
            # Prepare context from retrieved chunks
            context = self._prepare_context(retrieved_chunks)
            
            # Create the prompt
            prompt = self._create_prompt(query, context)
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            return {
                "success": True,
                "response": response.text
            }
        except Exception as e:
            return {
                "success": False,
                "response": f"Error generating response: {str(e)}"
            }
    
    def _prepare_context(self, chunks: List[Dict]) -> str:
        """Prepare context string from retrieved chunks"""
        if not chunks:
            return "No relevant context found."
        
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            chunk_text = chunk.get("text", "")
            score = chunk.get("score", 0)
            context_parts.append(f"[Context {i}] (Relevance: {score:.3f})\n{chunk_text}")
        
        return "\n\n".join(context_parts)
    
    def _create_prompt(self, query: str, context: str) -> str:
        """Create the prompt for Gemini"""
        prompt = f"""You are Retrievus, an intelligent assistant for a company that helps users find information from a knowledge base.

Based on the following context information, please answer the user's question. Provide a helpful, accurate, and concise response based on the context provided.

CONTEXT:
{context}

USER QUESTION: {query}

Please provide your response:"""

        return prompt