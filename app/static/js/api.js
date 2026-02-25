/**
 * API Integration Module
 * Handles all communication with the Flask backend API
 */

const API = {
    // Base headers for JSON requests
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },

    /**
     * Get all study sessions for the current user
     * @returns {Promise<Array>} List of session objects
     */
    async getSessions() {
        try {
            const response = await fetch('/api/sessions');
            if (!response.ok) throw new Error('Failed to fetch sessions');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    /**
     * Save a completed study session
     * @param {Object} sessionData 
     * @returns {Promise<Object>} Created session object
     */
    async saveSession(sessionData) {
        try {
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(sessionData)
            });
            if (!response.ok) throw new Error('Failed to save session');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    /**
     * Delete a session by ID
     * @param {number} id 
     */
    async deleteSession(id) {
        try {
            const response = await fetch(`/api/sessions/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete session');
            return true;
        } catch (error) {
            console.error('API Error:', error);
            return false;
        }
    },

    /**
     * Get user statistics including overall stats, streak, and weekly data
     * @returns {Promise<Object>} Stats object
     */
    async getStats() {
        try {
            const response = await fetch('/api/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    }
};
