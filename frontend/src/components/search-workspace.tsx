import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Search, Sparkles } from "lucide-react";

interface SearchWorkspaceProps {
  onSearch: (query: string, mode: string, role: string, rerank: boolean, topK?: number) => void;
}

export function SearchWorkspace({ onSearch }: SearchWorkspaceProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("Hybrid");
  const [role, setRole] = useState("Employee");
  const [rerank, setRerank] = useState(true);
  const [topK, setTopK] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, mode, role, rerank, topK);
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="text-center mb-8">
        <motion.h1
          className="text-4xl font-bold text-slate-800 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Explore Your Knowledge Base
        </motion.h1>
        <motion.p
          className="text-lg text-slate-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Ask questions and discover insights with intelligent retrieval strategies
        </motion.p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Input */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl blur-xl opacity-50"></div>
          <div className="relative bg-white rounded-2xl border-2 border-purple-200 p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <Search className="w-6 h-6 text-purple-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What would you like to know about your company?"
                className="flex-1 border-0 text-lg bg-transparent focus:ring-0 focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </motion.div>

        {/* Controls Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {/* Retrieval Mode */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <Label className="text-sm text-slate-600 mb-2 block">Retrieval Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="w-full border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dense">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Dense (Semantic)
                  </div>
                </SelectItem>
                <SelectItem value="Sparse">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Sparse (Keyword)
                  </div>
                </SelectItem>
                <SelectItem value="Hybrid">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Hybrid (Combined)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Role Selection */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <Label className="text-sm text-slate-600 mb-2 block">User Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Intern">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Intern
                  </div>
                </SelectItem>
                <SelectItem value="Employee">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Employee
                  </div>
                </SelectItem>
                <SelectItem value="Manager">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Manager
                  </div>
                </SelectItem>
                <SelectItem value="Executive">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Executive
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rerank Toggle */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-slate-600">Rerank Results</Label>
                <p className="text-xs text-slate-400 mt-1">Improve result quality</p>
              </div>
              <Switch
                checked={rerank}
                onCheckedChange={setRerank}
                className="data-[state=checked]:bg-purple-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Generate Button */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button
            type="submit"
            disabled={!query.trim()}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Generate Insights
            </motion.div>
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}