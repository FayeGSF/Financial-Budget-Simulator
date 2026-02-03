import axios from 'axios';
import { useState } from 'react';

function AddSavings({ onSave, onClose, goals }) {
    const [addSavings, setAddSavings] = useState({
        goal_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // const formatCurrency = (amount) => {
    //     if (!amount) return '';
    //     return new Intl.NumberFormat('en-NZ', {
    //         style: 'currency',
    //         currency: 'NZD'
    //     }).format(amount);
    // };
    
    const apiBaseUrl = process.env.REACT_APP_API_URL;

    const handleAddSavings = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            setSuccessMessage(null);
            const formattedAmount = parseFloat(addSavings.amount);
            
            const response = await axios.post(`${apiBaseUrl}/savings/add`,
                {
                    goal_id: addSavings.goal_id,
                    amount: formattedAmount,
                    date: addSavings.date
                },
                { withCredentials: true }
            );
            
            if (response.status === 201 || response.status === 200) {
                setSuccessMessage('New Savings added successfully');
                setAddSavings({
                    goal_id: '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0]
                });
                setTimeout(() => {
                    onSave();
                    onClose(); // Close the form
                }, 3000);
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);
                
            } 
        }
        catch (error) {
            console.error('Error adding savings:', error);
            const errorMessage = error.response?.data?.errors || error.response?.data?.error || 'Failed to add savings';
            setError(errorMessage);
            setTimeout(() => {
                setError(null);
            }, 3000);
        }
    }

    return (
    <div>  
          {/* success and error message section */}
          {successMessage && (
            <div className="mb-8 sm:mb-6 bg-green-50 border border-green-200 rounded-md p-3 sm:p-4">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
        )}

        {/* Error Message */}
        {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <div className="text-sm font-medium text-red-800">{error}</div>
            </div>
        )}  
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-6 lg:mb-8 mt-4">
          
            {/* // main add savings form */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Add New Savings</h3>
                <form onSubmit={handleAddSavings} className="px-4 sm:px-6 py-4 sm:py-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Goal <span className="text-red-500">*</span>
                            </label>
                            <select 
                                value={addSavings.goal_id} 
                                onChange={(e) => setAddSavings({...addSavings, goal_id: e.target.value})} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                required
                            >
                                <option value="">Select a goal</option>
                                {goals && goals.length > 0 ? goals.filter(goal => !goal.completed).map(goal => (
                                    <option key={goal.goal_id} value={goal.goal_id}>
                                        {goal.description} 
                                    </option>
                                )) : (
                                <option value="" disabled>No goals available</option>
                                )}
                            </select>
                    
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount ($) <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="number" 
                                step="0.01"
                                min="0.01"
                                value={addSavings.amount} 
                                onChange={(e) => setAddSavings({...addSavings, amount: e.target.value})} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                placeholder="$0.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="date"
                                value={addSavings.date}
                                onChange={(e) => setAddSavings({...addSavings, date: e.target.value})}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
                        <button 
                            type="submit"
                            className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            Add Savings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    );
}

export default AddSavings;
