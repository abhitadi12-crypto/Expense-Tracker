import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { geminiService } from "../services/gemini";

/**
 * Custom hook to manage expenses state and operations
 */
export function useExpenses(userId) {
  const [expenses, setExpenses] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch expenses on mount or when userId changes
  useEffect(() => {
    if (userId) {
      loadExpenses();
    }
  }, [userId]);

  // Fetch insights when expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      loadInsights();
    }
  }, [expenses.length]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await apiService.getExpenses(userId);
      setExpenses(data);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      const data = await geminiService.generateInsights(expenses);
      setInsights(data);
    } catch (err) {
      console.error("Failed to load insights:", err);
    }
  };

  const addExpense = async (expenseData) => {
    try {
      await apiService.saveExpense({ ...expenseData, user_id: userId });
      await loadExpenses();
      return true;
    } catch (err) {
      console.error("Failed to add expense:", err);
      return false;
    }
  };

  const removeExpense = async (id) => {
    try {
      const success = await apiService.deleteExpense(id);
      if (success) {
        await loadExpenses();
      }
      return success;
    } catch (err) {
      console.error("Failed to delete expense:", err);
      return false;
    }
  };

  return {
    expenses,
    insights,
    loading,
    addExpense,
    removeExpense,
    refreshInsights: loadInsights
  };
}
