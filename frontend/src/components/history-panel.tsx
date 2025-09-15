import { motion, AnimatePresence } from "motion/react";
import { X, History, Clock, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

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
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: SearchResult[];
  onResultClick: (result: SearchResult) => void;
}

const modeColors = {
  Dense: "bg-pastel-blue text-vibrant-blue",
  Sparse: "bg-pastel-green text-vibrant-green",
  Hybrid: "bg-pastel-lilac text-vibrant-lilac"
};

export function HistoryPanel({ isOpen, onClose, history, onResultClick }: HistoryPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-96 bg-white/95 backdrop-blur-md border-l border-slate-200 shadow-2xl z-50"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <motion.div 
                className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-slate-800">Search History</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-purple-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {history.length === 0 ? (
                  <motion.div 
                    className="flex flex-col items-center justify-center h-full text-center p-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Search className="w-12 h-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">No searches yet</h3>
                    <p className="text-sm text-slate-400">
                      Your search history will appear here as you explore your knowledge base.
                    </p>
                  </motion.div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-3">
                      {history.map((result, index) => (
                        <motion.div
                          key={result.id}
                          className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                          onClick={() => onResultClick(result)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-slate-700 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                "{result.query}"
                              </p>
                              <Badge className={`${modeColors[result.mode as keyof typeof modeColors]} border-0 text-xs flex-shrink-0`}>
                                {result.mode}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {result.timestamp.toLocaleTimeString()}
                              </div>
                              <div className="flex items-center gap-2">
                                <span>{result.chunks.length} sources</span>
                                {result.rerank && (
                                  <Badge className="bg-pastel-yellow text-vibrant-yellow border-0 text-xs">
                                    R
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="bg-slate-50 rounded p-3">
                              <p className="text-xs text-slate-600 line-clamp-2">
                                {result.llmOutput}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Footer */}
              {history.length > 0 && (
                <motion.div 
                  className="p-4 border-t border-slate-200 bg-slate-50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-xs text-slate-500 text-center">
                    {history.length} search{history.length !== 1 ? 'es' : ''} in this session
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}