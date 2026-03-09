/**
 * API service for handling expense-related requests
 */
export const apiService = {
  /**
   * Login user
   */
  login: async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }
    return data;
  },

  /**
   * Get Google Auth URL
   */
  getGoogleAuthUrl: async () => {
    const res = await fetch("/api/auth/google/url");
    return await res.json();
  },

  /**
   * Fetch all expenses for a user
   */
  getExpenses: async (userId) => {
    const res = await fetch(`/api/expenses/${userId}`);
    return await res.json();
  },

  /**
   * Save a new expense
   */
  saveExpense: async (expenseData) => {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseData)
    });
    return await res.json();
  },

  /**
   * Delete an expense
   */
  deleteExpense: async (id) => {
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    return res.ok;
  },

  /**
   * Update user profile
   */
  updateUser: async (id, userData) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    return await res.json();
  }
};
