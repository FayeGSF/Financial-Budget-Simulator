// CRUD for user income - add, update, read, 
// users should have only income 

import { useState, useEffect } from 'react';
import { FaEdit, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import EditIncome from './EditIncome';

export default function Income () {
    const apiBaseUrl = process.env.REACT_APP_API_URL;

    const [income, setIncome] = useState ([])
    const[isLoading, setIsLoading]= useState (false)
    const [error, setError] = useState (null)
    const[successMessage, setSuccessMessage] = useState (null)
    const[showAddForm, setShowAddForm] = useState (false)
    const[addIncome, setAddIncome] = useState ({
        amount:'',
        frequency:'',
        comment:''
    })
    const [ editingIncomeId, setEditingIncomeId ] = useState (null)
    const [ totalIncome, setTotalIncome ] = useState('')
  

    useEffect (() => {
        fetchIncome();
    }, [])
    
    const fetchIncome = async () => {
        try{
            setIsLoading (true)
            const response = await axios.get(`${apiBaseUrl}/user/income`,{withCredentials:true })
            console.log ('Income fetched: ', response.data.income)
            console.log('Total Income fetched:', response.data.total_income)
            setIncome(response.data.income)
            setTotalIncome(response.data.total_income ? parseFloat(response.data.total_income) : 0)        
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to fetch income');
        } finally {
            setIsLoading (false);
        }
        // ending tag of fetchIncome
    }
    // handle add income
    const handleAddIncome = async (e) => {
        e.preventDefault()
        try{
            setError (null)
            const formattedAmount= parseFloat (addIncome.amount)
            const response = await axios.post(`${apiBaseUrl}/user/add_income`,
                {
                   amount: formattedAmount,
                   frequency: addIncome.frequency,
                   comment: addIncome.comment
                },
                {withCredentials:true })
                if (response.status === 200 || response.status === 201) {
                    setSuccessMessage('Income added successfully');
                    setTimeout(() => {
                        setSuccessMessage(null)
                    }, 3000)
                    fetchIncome();
                    setAddIncome({
                        amount: '', frequency: '', comment: ''
                    }) 
                    setShowAddForm (false)
                } else {
                    setError (response.data.error || 'Failed to add income');
                }
        } catch (error) {
            console.error('Error adding  income:', error);
            setError(error.response?.data?.error || 'Failed to income');
        }
        setTimeout(() => {
            setError(null);
        }, 3000);
        // endingtag of handleAddIncome
    }
    const handleEditIncomeComplete = () => {
        fetchIncome()
        setEditingIncomeId (null)
    };

    const handleCancelEdit =() => {
        setEditingIncomeId (null)
    };

    const handleDeleteIncome = async (income_id) => {
        try{
            setError(null)
            const response = await axios.delete(`${apiBaseUrl}/user/delete_income`,
                {
                    data: { income_id: income_id },
                    withCredentials: true
                })
            if (response.status === 200) {
                setSuccessMessage ('Income deleted successfully')
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);
                fetchIncome()
            } else {
                setError(response.data.error || 'Failed to delete Income');
                setTimeout(() => {
                setError(null);
                }, 3000);
            }
        } catch (error){
            console.error('Error deleting income: ', error);
            setError(error.response?.data?.error || 'Failed to delete income');
            setTimeout(() => {
                setError(null);
            }, 3000)
        }

    }

    return(
        <div className="max-w-3xl mx-auto">
             {/* Header */}
             <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-6 lg:mb-8">
                    <div className="bg-gradient-to-r from-lime-900 to-lime-700 px-4 sm:px-6 py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div>
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Income</h2>
                                <p className="text-blue-100 mt-1 text-sm sm:text-base">Enter income for accurate predictions</p>
                            </div>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                <button 
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
                                >
                                    {showAddForm ? <FaTimes className ="mr-2" /> : <FaPlus className="mr-2" />}
                                    {showAddForm ? 'Cancel' : 'Add Income'}
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
                {/* end of error message  */}
                {/* add income form */}
                {showAddForm && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-6 lg:mb-8">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Add New Income</h3>
                    </div>
             
                    <form onSubmit ={handleAddIncome} className="px-4 sm:px-6 py-4 sm:py-6">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Income Amount ($)
                                     <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type ="number"
                                    step="0.1"
                                    min="0"
                                    value= {addIncome.amount}
                                    onChange ={(e) => setAddIncome({...addIncome, amount: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none 
                                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                    placeholder='Enter net Income, after tax...'
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Frequency: <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={addIncome.frequency}
                                    onChange={(e) => setAddIncome ({...addIncome, frequency: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                >
                                    <option value="">Select a frequency</option>
                                    <option value="monthly">Monthly</option>
                                    <option value ="hourly">Hourly</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comment (Optional)
                            </label>
                            <textarea
                                value={addIncome.comment}
                                onChange={(e) => setAddIncome({...addIncome, comment: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                placeholder='Add any additional notes about your income...'
                                rows="3"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
                                <button 
                                    type="submit"
                                    className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    Add Income
                                </button>
                        </div>
{/* ending tag for container and form */}
                    </form>
                </div>
                )}
                {/* edit form */}
                {editingIncomeId && (
                    <EditIncome
                    key ={`edit-${editingIncomeId}`}
                    onSave={handleEditIncomeComplete}
                    onCancel= {handleCancelEdit}
                    income ={income.find(item => item.income_id === editingIncomeId)} />
                )}
                {/* Income */}
                 {/* loading state */}
                 <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                     <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                         <h3 className="text-lg font-medium text-gray-900">Your Income</h3>
                     </div>
                     {isLoading ? (
                         <div className="flex items-center justify-center py-12">
                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600">
                             </div>
                             <span className="ml-3 text-gray-600">Loading Income...</span>
                         </div>
                     ) : income.length === 0 ? (
                         <div className="text-center py-8 sm:py-12">
                             <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">No Income</h3>
                             <p className="mt-1 text-sm text-gray-500">Get started by adding your income.</p>
                             <div className="mt-4 sm:mt-6">
                                 <button
                                     onClick={() => setShowAddForm(true)}
                                     className="inline-flex items-center px-4 py-2 
                                     border border-transparent shadow-sm text-sm 
                                     font-medium rounded-md text-white bg-blue-600"
                                 >
                                     Add Income
                                 </button>
                             </div>
                         </div>    
                     ) : (
                         <div className="overflow-x-auto">
                             <table className="min-w-full divide-y divide-gray-200">
                                 <thead className="bg-gray-50">
                                     <tr>
                                         <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                             Amount
                                         </th>
                                         <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                                             Frequency
                                         </th>
                                         <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                                             Comment
                                         </th>
                                         <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ">
                                             Actions
                                         </th>
                                     </tr>
                                 </thead>
                                 <tbody className="bg-white divide-y divide-gray-200">
                                     {income.map((incomeItem, index) => (
                                         <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                 ${parseFloat(incomeItem.amount).toFixed(2)}
                                             </td>
                                             <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                 <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                     {incomeItem.frequency}
                                                 </span>
                                             </td>
                                             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                 {incomeItem.comment || '-'}
                                             </td>
                                             <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                 <div className="flex space-x-2">
                                                     <button 
                                                         onClick={() => setEditingIncomeId(incomeItem.income_id)}
                                                         className="text-blue-500 hover:text-blue-700 
                                                         transition-colors">
                                                         <FaEdit className="ml-2" />
                                                     </button>

                                                    <button
                                                        onClick={() => handleDeleteIncome(incomeItem.income_id)}
                                                        className="text-red-500 hover:text-red-700 
                                                        transition-colors duration-200">
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
                     {/*Total Income*/}
                     {income.length > 0 && (
                        <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Total Income:</span>
                                <span className="text-md font-bold text-gray-900 mr-10">
                                    ${totalIncome ? parseFloat(totalIncome).toFixed(2) : '0.00'} <span className ="text-sm text-gray-600">/month</span>
                                </span>
                            </div>
                        </div>
                    )}
                 </div>
        {/* main container closing tag */}
        </div>
    )
}