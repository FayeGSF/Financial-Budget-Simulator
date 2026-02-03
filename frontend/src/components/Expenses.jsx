// show a list of all the expenses 
// filter by month
// search option 
// CRUD operations - different jsx
// visualisation of expenses - different jsx
// create expense category - different jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {FaTrash, FaEdit, FaTimes, FaPlus} from 'react-icons/fa';
import AddExpense from './AddExpense';
import EditExpenses from './EditExpenses';
import AddCategory from './AddCategory';
import ChartExpense from './ChartExpense';

export default function Expenses({ amountLeft, fetchRemainingAmount }) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;

// state managment
    // 1.expenses
    const [expenses, setExpenses] = useState([]);
    // 2.loading
    const [isLoading, setIsLoading] = useState(true);
    // 5. error
    const [error, setError] = useState(null);
    // 6. success 
    const [successMessage, setSuccessMessage] = useState(null);
// state management for search filter by month
    // 1. search query
    const [searchQuery, setSearchQuery] = useState('');
    // 2. selected Month
    const [selectedMonth, setSelectedMonth] = useState('');
    // 3. available month
    const [availableMonths, setAvailableMonths] = useState([]);
    // 4. showAddForm & showCategoryForm
    const [showAddForm, setShowAddForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    // 5. categories
    const [categories, setCategories] = useState([]);
    // 6. edit expense state
    const [editingExpense, setEditingExpense] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    // fetch expenses on mount
    useEffect(() => {
        fetchExpenses();
    } , [])

    // Handle month selection change
    const handleMonthChange = async (month) => {
        setSelectedMonth(month);
        if (month === '') {
            // If "All Months" is selected, fetch all expenses
            fetchExpenses();
            // Fetch remaining amount for current month when "All Months" is selected
            fetchRemainingAmount();
        } else {
            // Fetch expenses for the selected month from backend
            await fetchExpensesByMonth(month);
            // Fetch remaining amount for the selected month
            fetchRemainingAmount(month);
        }
    };

    // Function to fetch expenses by month from backend
    const fetchExpensesByMonth = async (month) => {
        setIsLoading(true);
        setError(null); 
        
        try {
            const response = await axios.get(`${apiBaseUrl}/expenses/expense_by_month?month=${month}`, { 
                withCredentials: true 
            });
            if (response.status === 200) {
                setExpenses(response.data.filtered_expenses);
            } else {
                console.error('Unexpected response status:', response.status);
                setError(response.data.error || 'Unexpected response from server');
            }
        } catch (error) {
            console.error('Error fetching expenses by month:', error)
        } finally {
            setIsLoading(false);
        }
    };

    // Search function - now only filters by search query since month filtering is handled by backend
    const filteredExpenses = expenses.filter(expense => {
        // Only filter by search query if provided
        if (!searchQuery) return true; // Show all if no search query
        
        const query = searchQuery.toLowerCase();
        return (
            expense.description.toLowerCase().includes(query) ||
            expense.cat_name.toLowerCase().includes(query) ||
            expense.amount.toString().includes(query) ||
            expense.date.toLowerCase().includes(query)
        );
    });

    // CRUD OPERATIONS 

    // function to fetch expenses
    const fetchExpenses = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${apiBaseUrl}/expenses/get`, { withCredentials: true })
        if (response.status === 200){
            console.log('Expenses fetched successfully');
            setExpenses(response.data.expenses);
            setSelectedMonth('');
            setAvailableMonths(response.data.selected_months);
            setCategories(response.data.categories);
            setSuccessMessage(response.data.message);
            // Fetch remaining amount for current month
            fetchRemainingAmount();
            // Trigger chart refresh when expenses are updated
            setRefreshChart(prev => !prev);
        } else {
            setError(response.data.error);
        }
        } catch (error) {
            setError(error.response.data.error || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    // charts need to refresh when new expenses is updated/added/deleted when expenses/get is triggered
    const [refreshChart, setRefreshChart] = useState(false);
    
    // function to handle edit expense
    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setShowEditForm(true);
    };

    // function to cancel edit
    const handleCancelEdit = () => {
        setEditingExpense(null);
        setShowEditForm(false);
    };

    // function to delete expense
    const handleDeleteExpense = async (expense_id) => {
        try{
            setIsLoading(true);
            const response = await axios.delete(`${apiBaseUrl}/expenses/delete`, {
                data: { expense_id: expense_id },
                withCredentials: true
            })
            if (response.status === 200){
                setSuccessMessage('Expense deleted successfully');
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);
                fetchExpenses();
            } else {
                setError(response.data.error);
            }
        } catch (error) {
            setError(error.response.data.error || 'An error occurred');
            setTimeout(() => {
                setError(null);
            }, 3000);
        } finally {
            setIsLoading(false);
        }
    }

    return(
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-6 lg:mb-8">
                <div className="bg-gradient-to-r from-lime-900 to-lime-700 px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Expenses</h2>
                            <p className="text-blue-100 mt-1 text-sm sm:text-base">Track and manage your expenses</p>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                <button 
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className="inline-flex items-center justify-end px-3 sm:px-4 py-2 
                                    border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white
                                    hover:bg-blue-600 hover:text-white"
                                >
                                    {showAddForm ? <FaTimes className ="mr-2" /> : <FaPlus className="mr-2" />}
                                    {showAddForm ? 'Cancel' : 'Add Expense'}
                                </button>
                            
                            <button 
                                onClick={() => setShowCategoryForm(!showCategoryForm)}
                                className="inline-flex items-center justify-end px-3 sm:px-4 py-2
                                 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white
                                 hover:bg-blue-600 hover:text-white"
                            >
                                {showCategoryForm ? <FaTimes className ="mr-2" /> : <FaPlus className="mr-2" />}
                                {showCategoryForm ? 'Cancel' : 'Add Category'}
                                
                            </button>
                        </div>
                    </div>
                </div>  
            </div>
        {/* End of header */}
        
        {/* success and error message section */}
        {successMessage && (
            <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-md p-3 sm:p-4">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
        )}
    
        {/* Error Message */}
        {error && (
            <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
                <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
        )}

        {/* Add Expense Form */}
        {!isLoading && showAddForm && 
        <AddExpense onSave={fetchExpenses} 
        categories={categories} 
        onClose={() => setShowAddForm(false)} />}

        {/* Add Category Form */}
        {!isLoading && showCategoryForm && (
            <AddCategory 
                onSave={fetchExpenses} 
                onClose={() => setShowCategoryForm(false)} 
            />
        )}

        {/* Edit Expense Form */}
        {!isLoading && showEditForm && editingExpense && (
            <EditExpenses 
                onSave={fetchExpenses} 
                onCancel={handleCancelEdit} 
                expense={editingExpense} 
                categories={categories} 
            />
        )}

        {/* Summary Charts and cards */}
        {!isLoading && (
            <ChartExpense monthly_expenses={expenses} selectedMonth={selectedMonth} refreshChart={refreshChart} amountLeft={amountLeft} />
        )}
        {/* filter/search bar - only show when not loading */}
        {!isLoading && (
            <div className="my-6 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            {/* filter by month */}
            <div className="flex justify-start flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Filter </label>
                <select
                    value={selectedMonth}
                    onChange={e => handleMonthChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                    <option value="">All Months</option>
                    {availableMonths.map(month => (
                        <option key={month} value={month}>
                        {month}</option>
                    ))}
                </select>
            </div>
                {/* search bar */}
             <div className="flex justify-end w-full sm:w-1/4 ml-auto">
                <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                </div>
                {/* closing tag filter/search bar */}
            </div>
        )}
        {/* Loading Spinner */}
        {isLoading ? (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"> </div>
                <span className="ml-3 text-gray-600">Loading expenses...</span>
            </div>
        ) : filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                <p className="text-gray-500 text-center italic">
                    {searchQuery || selectedMonth ? 
                        'No expenses match your current filters. Try adjusting your search or month filter.' : 
                        'You haven\'t added any expenses yet. Click "Add Expense" to get started.'
                    }
                </p>
            </div>
        ) : (
            <div className="mb-4">
                {/* Expenses count */}
                <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600">
                        {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} found
                    </p>
                </div>
                
                {/* Expense table container */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="max-h-[600px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Date
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Category
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                                        Amount
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                                        Description
                                    </th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredExpenses.map((expense, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                         {expense.date}
                                     </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {expense.cat_name}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                                        ${expense.amount}
                                    </td>

                                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 max-w-36 truncate">
                                         {expense.description === '' ? '-' : expense.description}
                                     </td>
                                    
                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-6">
                                            <button
                                                onClick={() => handleEditExpense(expense)}
                                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                                title="Edit expense"
                                            >
                                                <FaEdit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteExpense(expense.expense_id)}
                                                className="text-red-600 hover:text-red-800 transition-colors duration-200 "
                                                title="Delete expense"
                                            > 
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

{/* main container closing div */}
    </div>
</div>
    
    )
}