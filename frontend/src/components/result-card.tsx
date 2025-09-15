import { motion } from "motion/react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { FileText, Brain, Clock, User } from "lucide-react";

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

interface ResultCardProps {
  result: SearchResult;
  index: number;
}

const modeColors = {
  Dense: "bg-pastel-blue text-vibrant-blue",
  Sparse: "bg-pastel-green text-vibrant-green",
  Hybrid: "bg-pastel-lilac text-vibrant-lilac"
};

const roleColors = {
  Intern: "bg-pastel-green text-vibrant-green",
  Employee: "bg-pastel-blue text-vibrant-blue",
  Manager: "bg-pastel-lilac text-vibrant-lilac",
  Executive: "bg-pastel-coral text-vibrant-coral"
};

export function ResultCard({ result, index }: ResultCardProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className="w-full"
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b border-slate-100">
          <div className="space-y-3">
            {/* Query and Metadata */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800 leading-relaxed">
                  "{result.query}"
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                  <Clock className="w-3 h-3" />
                  {result.timestamp.toLocaleTimeString()}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className={`${modeColors[result.mode as keyof typeof modeColors]} border-0 text-xs`}>
                  {result.mode}
                </Badge>
                <Badge className={`${roleColors[result.role as keyof typeof roleColors]} border-0 text-xs`}>
                  <User className="w-3 h-3 mr-1" />
                  {result.role}
                </Badge>
                {result.rerank && (
                  <Badge className="bg-pastel-yellow text-vibrant-yellow border-0 text-xs">
                    Reranked
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* LLM Output */}
          <motion.div 
            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-800">AI Response</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {result.llmOutput}
            </p>
          </motion.div>

          {/* Retrieved Chunks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
          >
            <Accordion type="single" collapsible>
              <AccordionItem value="chunks" className="border-0">
                <AccordionTrigger className="hover:no-underline py-3 text-slate-700">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Retrieved Sources ({result.chunks.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-3">
                    {result.chunks.map((chunk, chunkIndex) => (
                      <motion.div
                        key={chunk.id}
                        className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: chunkIndex * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-600">
                            {chunk.source}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Score: {chunk.score.toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {chunk.content}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}