// statemanagement
// 1. Edit form state
// 2. error state
// 3. success state 

import React, { useState } from "react";
import axios from 'axios';

function EditFixedExpenses({ fixedExpenseItem, onCancel }) {
    const [showEditForm, setShowEditForm] = useState(true) // Changed to true so form shows immediately
    const [editFixedExpense, setEditFixedExpense] = useState ({
        fixedexpense_id: fixedExpenseItem.fixed_expense_id,
        amount: fixedExpenseItem.amount || '',
        fixedexpense_name: fixedExpenseItem.name || '',
        biling_cycle: fixedExpenseItem.biling_cycle || 'monthly'
    })
    const[error, setError] = useState(null)
    const[successMessage, setSuccessMessage] = useState(null)

    // const formatCurrency = (amount) => {
    //     if (!amount) return '';
    //     return new Intl.NumberFormat('en-US', {
    //         style: 'currency',
    //         currency: 'NZD'
    //     }).format(amount);
    // };

    const apiBaseUrl = process.env.REACT_APP_API_URL;

    // when the form is clicked for edit 
    const handleEditFixedExpense = async (e) => {
        e.preventDefault()
        try {
            setError(null)
            const formattedAmount = parseFloat(editFixedExpense.amount)
            const response = await axios.post(`${apiBaseUrl}/expenses/updatefixedexpense`,
                {
                    fixedexpense_id: editFixedExpense.fixedexpense_id,
                    amount: formattedAmount,
                    fixedexpense_name: editFixedExpense.fixedexpense_name,
                    biling_cycle: editFixedExpense.biling_cycle
                },
                {withCredentials: true})
            
            if (response.status === 200) {
                setSuccessMessage('Fixed expense modified successfully');
                setTimeout(() => {
                    setSuccessMessage(null)
                    // Close the form after showing success message
                    if (onCancel) {
                        onCancel();
                    }
                }, 3000)
            } else {
                setError(response.data.error || 'Failed to modify fixed expense');
                setTimeout(() => {
                    setError(null);
                }, 5000);
            } 
        } catch (error) {
            console.error('Error modifying fixed expense:', error);
            setError(error.response?.data?.error || 'Failed to modify fixed expense');
        }    
        setTimeout(() => {
            setError(null);
        }, 3000);
    }

    // Update the onCancel function to use the prop
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };
  
    



    return(
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-6 lg:mb-8">
         {/* success and error message section */}
         {successMessage && (
            <div className="mb-8 sm:mb-6 bg-green-50 border border-green-200 rounded-md p-3 sm:p-4">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
        )}

        {/* Error Message */}
        {error && (
            <div className="mb-8 sm:mb-6 bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
                <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
        )}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Edit Fixed Expense</h3>
        </div>
        {/* Edit form */}
        <form onSubmit={ handleEditFixedExpense } className="px-4 sm:px-6 py-4 sm:py-6 mt-6 sm:mt-8">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fixed Expense Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            value={editFixedExpense.fixedexpense_name} 
                            onChange={(e) => setEditFixedExpense({...editFixedExpense, fixedexpense_name: e.target.value})} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                            placeholder="e.g., Rent, Internet, Insurance"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="number" 
                            step="0.01"
                            min="0"
                            value={editFixedExpense.amount} 
                            onChange={(e) => setEditFixedExpense({...editFixedExpense, amount: e.target.value})} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Biling Cycle
                        </label>
                        <select 
                            value={editFixedExpense.biling_cycle}
                            onChange={(e) => setEditFixedExpense({...editFixedExpense, biling_cycle: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
                    <button 
                        type="button"
                        onClick={handleCancel}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        Update Fixed Expense
                    </button>
                </div>
            </form>
        </div>

    )
}
export default EditFixedExpenses;