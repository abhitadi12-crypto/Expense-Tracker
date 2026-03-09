import React, { useState } from "react";
import { Edit2, CheckCircle } from "lucide-react";
import { Card } from "../components/Card";

/**
 * Settings Page - User profile and budget settings
 */
export const Settings = ({ user, onUpdate }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.target);
    const userData = {
      name: formData.get("name"),
      email: formData.get("email"),
    };

    const success = await onUpdate(userData);
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl">
      <Card title="Profile Information">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
              <Edit2 className="w-8 h-8" />
            </div>
            <button type="button" className="text-indigo-600 font-semibold hover:text-indigo-700">Change Photo</button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                name="name"
                type="text" 
                defaultValue={user?.name} 
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                name="email"
                type="email" 
                defaultValue={user?.email} 
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Budget (₹)</label>
            <input 
              type="number" 
              defaultValue="50000" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            
            {showSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 font-medium animate-in fade-in slide-in-from-left-2">
                <CheckCircle className="w-5 h-5" />
                Changes saved!
              </div>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
