import { useState, useEffect } from "react";
import axios from "axios";

export default function EditExpenses({ onSave, onCancel, expense, categories }) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    
    // State management for form fields
    const [editAmount, setEditAmount] = useState('');
    const [editSelectedCategory, setEditSelectedCategory] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editDate, setEditDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // 2. error & success message
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Initialize form with expense data when component mounts or expense changes
    useEffect(() => {
        if (expense) {
            setEditAmount(expense.amount || '');
            setEditSelectedCategory(expense.category_id || '');
            setEditDescription(expense.description || '');
            setEditDate(expense.date || '');
        }
    }, [expense]);

    // handle edit submission
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.put(`${apiBaseUrl}/expenses/edit`, {
                expense_id: expense.expense_id,
                amount: parseFloat(editAmount),
                expense_category: editSelectedCategory,
                expense_description: editDescription,
                expense_date: editDate
            }, { withCredentials: true });
            
            if (response.status === 200) {
                setSuccessMessage('Expense modified successfully!');
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);
                
                // Reset form
                setEditAmount('');
                setEditSelectedCategory('');
                setEditDescription('');
                setEditDate('');
                
                // Refresh expenses list and close form
                setTimeout(() => {
                    onSave();
                    onCancel();
                }, 3000);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to modify expense');
            setTimeout(() => {
                setError(null);
            }, 3000);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Modify Expense</h3>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm font-medium text-green-800">{successMessage}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount *
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter amount"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                        </label>
                        <select
                            id="category"
                            value={editSelectedCategory}
                            onChange={(e) => setEditSelectedCategory(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a category</option>
                            {categories && categories.map(category => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.cat_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date *
                        </label>
                        <input
                            type="date"
                            id="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description 
                        </label>
                        <input
                            type="text"
                            id="description"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter description (optional)"
                            maxLength="100"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Modifying...' : 'Modify Expense'}
                    </button>
                </div>
            </form>
        </div>
    )
}