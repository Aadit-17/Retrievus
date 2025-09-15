import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Navigation } from "./components/navigation";
import { SearchWorkspace } from "./components/search-workspace";
import { ResultCard } from "./components/result-card";
import { HistoryPanel } from "./components/history-panel";
import { ApiService, GenerateRequest, GenerateResponse } from "./services/api";

interface SearchResult {
  id: string;
  query: string;
  mode: string;
  role: string;
  rerank: boolean;
  timestamp: Date;
  chunks: Array<{
    id: string;
    content: string;
    source: string;
    score: number;
  }>;
  llmOutput: string;
  rawResponse?: GenerateResponse;
}

// Mock data generator removed - we'll use real API calls now

// Transform API response to our SearchResult format
const transformApiResponse = (response: GenerateResponse, query: string, mode: string, role: string, rerank: boolean): SearchResult => {
  return {
    id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    query,
    mode,
    role,
    rerank,
    timestamp: new Date(),
    chunks: response.retrieved_chunks.map(chunk => ({
      id: chunk.id,
      content: chunk.text,
      source: `Document: ${chunk.id}`, // We can enhance this based on metadata
      score: chunk.score
    })),
    llmOutput: response.llm_output,
    rawResponse: response
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState("Home");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'healthy' | 'error'>('unknown');

  // Check API health on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await ApiService.healthCheck();
        setApiStatus('healthy');
      } catch (error) {
        console.error('API health check failed:', error);
        setApiStatus('error');
      }
    };

    checkApiHealth();
  }, []);

  const handleSearch = async (query: string, mode: string, role: string, rerank: boolean, topK: number = 5) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare API request
      const request: GenerateRequest = {
        query,
        retrieval_mode: mode.toLowerCase(), // API expects lowercase
        role: role.toLowerCase(), // API expects lowercase  
        rerank,
        top_k: topK
      };

      console.log('Making API request:', request);

      // Call the real API
      const response = await ApiService.generate(request);

      console.log('API response:', response);

      // Transform response to our format
      const result = transformApiResponse(response, query, mode, role, rerank);

      // Update state
      setSearchResults([result, ...searchResults]);
      setSearchHistory([result, ...searchHistory]);

    } catch (error) {
      console.error('Search failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(`Search failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryResultClick = (result: SearchResult) => {
    // Move clicked result to top of current results
    setSearchResults([result, ...searchResults.filter(r => r.id !== result.id)]);
    setIsHistoryOpen(false);
  };

  const renderContent = () => {
    if (activeTab === "About") {
      return (
        <motion.div
          className="max-w-4xl mx-auto p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">About Retrievus</h1>
            <div className="space-y-4 text-slate-600">
              <p>
                Retrievus is an intelligent knowledge exploration platform designed to help teams discover
                insights from their company's information repositories using advanced retrieval strategies.
              </p>
              <p>
                Our system employs multiple retrieval modes (Dense, Sparse, and Hybrid) to ensure you get
                the most relevant information based on your role and query context.
              </p>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mt-6">
                <h3 className="font-semibold text-slate-700 mb-3">Key Features:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Role-based information filtering (Manager, Employee, Intern, Executive)</li>
                  <li>• Multiple retrieval modes (Dense, Sparse, Hybrid)</li>
                  <li>• AI-powered result reranking with BM25</li>
                  <li>• Real-time search with Pinecone vector database</li>
                  <li>• Google Gemini powered response generation</li>
                  <li>• Session-based search history</li>
                  <li>• Beautiful, intuitive interface</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>API Status:</strong>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${apiStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                        apiStatus === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {apiStatus === 'healthy' ? '✓ Connected' :
                        apiStatus === 'error' ? '✗ Disconnected' :
                          '? Checking...'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="space-y-8">
        <SearchWorkspace onSearch={handleSearch} />

        {/* Error Display */}
        {error && (
          <motion.div
            className="max-w-4xl mx-auto px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <span className="text-red-600">⚠️</span>
                <strong>Error:</strong>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        {isLoading && (
          <motion.div
            className="flex flex-col items-center justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Searching your knowledge base...</p>
            <p className="text-sm text-slate-400 mt-1">Connecting to Pinecone & Gemini AI</p>
          </motion.div>
        )}

        <div className="max-w-4xl mx-auto px-8">
          {searchResults.length > 0 && (
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Search Results</h2>
              {searchResults.map((result, index) => (
                <ResultCard key={result.id} result={result} index={index} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onHistoryToggle={() => setIsHistoryOpen(true)}
      />

      <main className="pb-12">
        {renderContent()}
      </main>

      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={searchHistory}
        onResultClick={handleHistoryResultClick}
      />
    </div>
  );
}