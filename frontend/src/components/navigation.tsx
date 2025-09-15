import { motion } from "motion/react";
import { Brain, History } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onHistoryToggle: () => void;
}

export function Navigation({ activeTab, onTabChange, onHistoryToggle }: NavigationProps) {
  return (
    <motion.nav
      className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Logo */}
      <motion.div
        className="flex items-center gap-3"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Retrievus
        </span>
      </motion.div>

      {/* Navigation Links */}
      <div className="flex items-center gap-6">
        {["Home", "About"].map((tab) => (
          <motion.button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === tab
              ? "bg-purple-100 text-purple-700"
              : "text-slate-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab}
          </motion.button>
        ))}

        <motion.button
          onClick={onHistoryToggle}
          className="px-4 py-2 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <History className="w-4 h-4" />
          History
        </motion.button>
      </div>


    </motion.nav>
  );
}