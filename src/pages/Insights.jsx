import React from "react";
import { Lightbulb } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "../components/Card";

/**
 * Insights Page - AI generated financial advice
 */
export const Insights = ({ insights, onRefresh }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {insights.length > 0 ? insights.map((insight, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="h-full flex flex-col justify-between border-l-4 border-l-indigo-500">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="text-indigo-600 w-6 h-6" />
              </div>
              <p className="text-slate-700 leading-relaxed">{insight}</p>
            </div>
          </Card>
        </motion.div>
      )) : (
        <div className="col-span-2 text-center py-12">
          <p className="text-slate-500 mb-4">No insights generated yet.</p>
          <button 
            onClick={onRefresh}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700"
          >
            Generate Insights
          </button>
        </div>
      )}
    </div>
  );
};
