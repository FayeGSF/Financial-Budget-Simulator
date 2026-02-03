import React, { useState } from 'react';
import axios from 'axios';

export default function EditSavings({ savings, onSave, onCancel,goalProgress}) { 
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    // states
    const[editSavings, setEditSavings] = useState ({
        amount : savings.amount ||'',
        savings_id: savings.savings_id ||'',
        goal_id: savings.goal_id ||'',
        date: savings.date ||''
    })
    // 3. error
    const [error, setError] = useState(null)
    // 4. success
    const[successMessage, setSuccessMessage] = useState(null)

    // function
    // format currency
    // const formatCurrency = (amount) => {
    //     if (!amount) return '';
    //     return new Intl.NumberFormat('en-US', {
    //         style: 'currency',
    //         currency: 'NZD'
    //     }).format(amount);
    // };
    // function to handle edit savings
    const handleEditSavings = async (e) => {
        e.preventDefault()
        try{
            setError(null)
            const response = await axios.put(`${apiBaseUrl}/savings/edit`,
            {
                amount : editSavings.amount,
                savings_id: savings.savings_id,
                goal_id: editSavings.goal_id,
                date: editSavings.date
            }, {withCredentials:true})
            if(response.status===200 || response.status===201) {
                setSuccessMessage('Savings modified successfully')
                setTimeout( ()=> {
                    setSuccessMessage(null)
                    if (onSave){
                        onSave()
                    }
                },3000)
            } else{
                const errorMessage = response.data.errors || response.data.error || 'Failed to modify savings'
                setError(Array.isArray(errorMessage) ? errorMessage.join('\n') : errorMessage)
                setTimeout(() => {
                    setError(null)
                },3000)
            }
        } catch (error) {
            console.error('Error in edit savings:', error)
            const errorMessage = error.response?.data?.errors || error.response?.data?.error || 'Failed to modify savings'
            setError(Array.isArray(errorMessage) ? errorMessage.join('\n') : errorMessage)
            setTimeout( () => {
                setError(null)
            },3000)
        }
    }

    const handleCancel =()=> {
        if(onCancel){
            onCancel()
        }
    }
    return(
        <div className="p-4 sm:p-6">
            {/* success and error message section */}
            {successMessage && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3 sm:p-4">
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
                    <div className="text-sm font-medium text-red-800 whitespace-pre-line">{error}</div>
                </div>
            )}
            <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Savings</h3>
            </div>
            {/* Edit form for savings here */}

            <form onSubmit={handleEditSavings} className="space-y-4">
                <div className="space-y-4">
                    {/* description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Goal
                        </label>
                        <select 
                        value={editSavings.goal_id || ''}
                        onChange={(e) => setEditSavings ({...editSavings, goal_id: e.target.value})}
                        className ="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                        focus:outline-none 
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        >
                            <option value="">Select a goal</option>
                            {goalProgress && goalProgress.map((goal) => (
                                <option key={goal.goal_id} value={goal.goal_id}>
                                    {goal.description}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount
                        </label>
                        <input 
                        type="number"
                        value={editSavings.amount}
                        onChange={(e) => setEditSavings ({...editSavings, amount:e.target.value})}
                        className ="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                        focus:outline-none 
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>	
                    {/* date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <input 
                    type="date"
                    value={editSavings.date}
                    onChange={(e) => setEditSavings({...editSavings, date:e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm " 
                    />
                    </div>
                    {/* form div */}
                </div>
                <div className="flex flex-col justify-end sm:flex-row gap-3">
                <button 
                        type="button"
                        onClick={handleCancel}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium 
                        text-gray-700 bg-white hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium 
                        text-white bg-blue-600 hover:bg-blue-700 "
                    >
                        Update Savings
                    </button>
                    
                </div>
            </form>
        </div>
    )
}