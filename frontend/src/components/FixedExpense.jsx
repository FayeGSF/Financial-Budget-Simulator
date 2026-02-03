// show fixed expenses (FE)
// Add functionality to add, edit and delete fixed expenses
// state management includes:
    // 1. retrieve FE from backend
    // 2. is loading state
    // 3. error state
    // 4. success state
    // 5. show add form (backend form validation)
    // 6. addFE state
// edit state in EditFixedExpense.jsx to avoid bloating of jsx file.

import React, { useState, useEffect } from "react";
import axios from 'axios';
import api from '../api/auth';
// import { useNavigate } from 'react-router-dom'; 
import { FaEdit, FaTrash, FaSpinner, FaPlus, FaTimes } from 'react-icons/fa';
import EditFixedExpenses from './EditFixedExpenses';

function FixedExpense() {

    // state management for fixed expenses
    const[fixedExpense, setFixedExpense] = useState ([]);
    const [total_fe, setTotalFe] = useState (0)
    const[isLoading, setIsLoading] =useState (false)
    const [error, setError] = useState (null)
    const[successMessage, setSuccessMessage] = useState (null)
    const[showAddForm, setShowAddForm] = useState (false)
    const [addFixedExpense, setAddFixedExpense] = useState ({
        name: '',
        amount: '',
        biling_cycle: 'monthly'
    });

    // Edit state
    const [editingFixedExpense, setEditingFixedExpense] = useState(null)

     // Fetch fixed expenses on component mount
     useEffect(() => {
        fetchFixedExpense();

    }, []);
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    // to show FE from backend
    const fetchFixedExpense = async () => {
        setIsLoading(true)
        try{
            
            const response = await axios.get (`${apiBaseUrl}/expenses/getfixedexpense`, {
                withCredentials: true
            });
            console.log('Fixed expenses fetched:', response.data.data)
            setFixedExpense(response.data.data);
            // total_fe is now a direct number from the backend after using fixedexpenses_convert()
            console.log ('FE per month:', response.data.total)
            setTotalFe(response.data.total ? parseFloat(response.data.total) : 0);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to fetch fixed expenses');
        } finally {
            setIsLoading(false);
        }
    }

// const formatCurrency = (amount) => {
//     if (!amount) return '';
//     return new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'NZD'
//     }).format(amount);
// };

//  handle the add FE expense
 const handleAddFixedExpense = async (e) => {
    e.preventDefault()
    try{
        setError (null)
        const formattedAmount = parseFloat(addFixedExpense.amount)
        const response = await axios.post(`${apiBaseUrl}/expenses/addfixedexpense` ,
            {
                name: addFixedExpense.name,
                amount: formattedAmount,
                biling_cycle: addFixedExpense.biling_cycle
            },
            {withCredentials: true})
            if (response.status === 200 || response.status === 201) {
                setSuccessMessage('Fixed expense added successfully');
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 3000)
                fetchFixedExpense();
                setAddFixedExpense({
                    name: '',
                    amount: '',
                    biling_cycle: 'monthly'
                })
                setShowAddForm(false)
            } else {
                setError(response.data.error || 'Failed to add fixed expense');
            } 
        }
            catch (error) {
                console.error('Error adding fixed expense:', error);
                setError(error.response?.data?.error || 'Failed to add fixed expense');
            }    
            setTimeout(() => {
                setError(null);
            }, 3000);
        }

// to handle delete of FE
const handleDeleteFixedExpense = async (fixedExpenseId) => {
    try {
        setError(null);
            const response = await axios.post(`${apiBaseUrl}/expenses/deletefixedexpense`, {
            fixedexpense_id: fixedExpenseId
        }, {withCredentials: true});
        
        if (response.status === 200) {
            setSuccessMessage('Fixed expense deleted successfully');
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
            fetchFixedExpense();
        } else {
            setError(response.data.error || 'Failed to delete fixed expense');
            setTimeout(() => {
                setError(null);
            }, 3000);
        }
    } catch (error) {
        console.error('Error deleting fixed expense:', error);
        setError(error.response?.data?.error || 'Failed to delete fixed expense');
        setTimeout(() => {
            setError(null);
        }, 3000);
    }
}

// handle edit of FE (set state to show form only, details in EditFixedExpense.jsx)
const handleEditClick = (fixedExpenseItem) => {
    setEditingFixedExpense(fixedExpenseItem)

}

// function to handle edit form cancel
const handleEditCancel = () => {
    setEditingFixedExpense(null);
    fetchFixedExpense();
};

    return(
        <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-6 lg:mb-8">
                    <div className="bg-gradient-to-r from-lime-900 to-lime-700 px-4 sm:px-6 py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div>
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Fixed Expenses</h2>
                                <p className="text-blue-100 mt-1 text-sm sm:text-base">Manage your recurring expenses</p>
                            </div>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                <button 
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
                                >
                                    {showAddForm ? <FaTimes className ="mr-2" /> : <FaPlus className="mr-2" />}
                                    {showAddForm ? 'Cancel' : 'Add Fixed Expense'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* success and error message section */}
                {successMessage && (
                    <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-md p-3 sm:p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{successMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
        {/* Add FE form */}
          {/* Add Fixed Expense Form */}
          {showAddForm && (
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-6 lg:mb-8">
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Add New Fixed Expense</h3>
                        </div>
                        <form onSubmit={handleAddFixedExpense} className="px-4 sm:px-6 py-4 sm:py-6 ">
                            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fixed Expense Name <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={addFixedExpense.name} 
                                        onChange={(e) => setAddFixedExpense({...addFixedExpense, name: e.target.value})} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                        placeholder="e.g., Rent, Internet, Insurance"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount ($) <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        min="0"
                                        value={addFixedExpense.amount} 
                                        onChange={(e) => setAddFixedExpense({...addFixedExpense, amount: e.target.value})} 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                        placeholder="$0.00"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Biling Cycle
                                    </label>
                                    <select 
                                        value={addFixedExpense.biling_cycle}
                                        onChange={(e) => setAddFixedExpense({...addFixedExpense, biling_cycle: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
                                <button 
                                    type="submit"
                                    className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    Add Fixed Expense
                                </button>
                            </div>
                        </form>
                    </div>
                )}
        {/* Edit Fixed Expense Form */}
        {editingFixedExpense && (
            <EditFixedExpenses 
                fixedExpenseItem={editingFixedExpense}
                onCancel={handleEditCancel}
            />
        )}
      {/* Fixed Expenses List */}
      {/* loading state   */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Your Fixed Expenses</h3>
                    </div>
                    {isLoading ? (
                         <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600">
                            </div>
                            <span className="ml-3 text-gray-600">Loading Fixed Expenses...</span>
                     </div>
                    ) : fixedExpense.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                            <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">No fixed expenses</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by adding your first fixed expense.</p>
                            <div className="mt-4 sm:mt-6">
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="inline-flex items-center px-4 py-2 
                                    border border-transparent shadow-sm text-sm 
                                    font-medium rounded-md text-white bg-blue-600"
                                >
                                    Add Fixed Expense
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fixed Expense Name
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Biling Cycle
                                        </th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {fixedExpense.map((fixedExpenseItem, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {fixedExpenseItem.name}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ${parseFloat(fixedExpenseItem.amount).toFixed(2)}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {fixedExpenseItem.biling_cycle}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={() => handleEditClick(fixedExpenseItem)}
                                                        className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                                                    >
                                                        <FaEdit className="ml-2" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteFixedExpense(fixedExpenseItem.fixed_expense_id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                                    >
                                                        <FaTrash className="ml-2"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* Total Fixed Expenses */}
                    {fixedExpense.length > 0 && (
                        <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Total Fixed Expenses:</span>
                                <span className="text-md font-bold text-gray-900 mr-10">
                                    ${total_fe ? parseFloat(total_fe).toFixed(2) : '0.00'}<span className ="text-sm text-gray-600">/month</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>
    {/* main container div  */}
    </div>
    )
}
export default FixedExpense;