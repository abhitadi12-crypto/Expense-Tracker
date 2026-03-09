import React from "react";
import { Receipt, BarChart3, Check } from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend 
} from "recharts";
import { format } from "date-fns";
import { StatCard } from "../components/StatCard";
import { Card } from "../components/Card";
import { COLORS } from "../constants";

/**
 * Dashboard Page - Overview of spending
 */
export const Dashboard = ({ expenses, setActivePage }) => {
  // Calculate stats
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlySpent = expenses
    .filter(e => e.date && e.date.startsWith(format(new Date(), "yyyy-MM")))
    .reduce((sum, e) => sum + e.amount, 0);

  // Prepare chart data
  const categoryData = Object.entries(
    expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Balance" 
          value={`₹${totalSpent.toLocaleString()}`} 
          icon={Receipt} 
          color="bg-indigo-600" 
        />
        <StatCard 
          title="Monthly Spending" 
          value={`₹${monthlySpent.toLocaleString()}`} 
          trend="+12% from last month" 
          icon={BarChart3} 
          color="bg-purple-600" 
        />
        <StatCard 
          title="Budget Status" 
          value="On Track" 
          trend="75% of budget used" 
          icon={Check} 
          color="bg-emerald-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <Card title="Category Distribution">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity List */}
        <Card title="Recent Activity">
          <div className="space-y-4">
            {expenses.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{e.item}</p>
                    <p className="text-xs text-slate-500">{e.category} • {e.date}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-800">₹{e.amount}</span>
              </div>
            ))}
            <button 
              onClick={() => setActivePage("expenses")}
              className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-2"
            >
              View All Expenses
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
