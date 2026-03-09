import React from "react";
import { Search, Filter, Trash2 } from "lucide-react";
import { Card } from "../components/Card";

/**
 * Expenses Page - List of all expenses with search and delete
 */
export const Expenses = ({ expenses, onDelete }) => {
  return (
    <Card className="overflow-hidden">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:flex-1 md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search expenses..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>
      
      {/* Expenses Table */}
      <div className="overflow-x-auto -mx-6">
        <div className="inline-block min-w-full align-middle px-6">
          <table className="min-w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-4 font-semibold text-slate-600 whitespace-nowrap">Date</th>
                <th className="pb-4 font-semibold text-slate-600 whitespace-nowrap">Item</th>
                <th className="pb-4 font-semibold text-slate-600 whitespace-nowrap hidden sm:table-cell">Category</th>
                <th className="pb-4 font-semibold text-slate-600 whitespace-nowrap">Amount</th>
                <th className="pb-4 font-semibold text-slate-600 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 text-slate-600 text-sm whitespace-nowrap">{e.date}</td>
                  <td className="py-4 font-medium text-slate-800 text-sm">
                    {e.item}
                    <div className="sm:hidden text-xs text-slate-500 mt-0.5">{e.category}</div>
                  </td>
                  <td className="py-4 hidden sm:table-cell">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-4 font-bold text-slate-800 text-sm whitespace-nowrap">₹{e.amount}</td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={() => onDelete(e.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};
