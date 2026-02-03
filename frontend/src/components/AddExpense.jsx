import React, { useState } from 'react';
import axios from 'axios';

export default function AddExpense({ onSave, categories, onClose }) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    
    // State management for form fields
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // 2. error & success message
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post(`${apiBaseUrl}/expenses/addexpense`, {
                amount: parseFloat(amount),
                expense_category: selectedCategory,
                expense_description: description,
                expense_date: date
            }, { withCredentials: true });

            if (response.status === 200) {
                setSuccessMessage('Expense added successfully!');
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);
                // Reset form
                setAmount('');
                setSelectedCategory('');
                setDescription('');
                setDate('');
                // Refresh expenses list
                setTimeout(() => {
                    onSave();
                    onClose(); // Close the form
                }, 3000);
                
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to add expense');
            setTimeout(() => {
                setError(null);
            }, 3000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
            )}

            <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Add New Expense</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount *
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                        </label>
                        <select
                            id="category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
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
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description (optional)
                        </label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter description (optional)"
                            maxLength="100"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Adding...' : 'Add Expense'}
                    </button>
                </div>
            </form>
            </div>
        </div>
    );
}