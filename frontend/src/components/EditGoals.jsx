import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditGoals= ( {goal, onSave, onCancel}) => {
    const [editGoal, setEditGoal] = useState({
        description: goal.description || '',
        amount: goal.goal_amount || '', 
        target_date: goal.target_date || ''
    });
    const[error, setError] = useState(null)
    const[successMessage, setSuccessMessage] = useState(null)

    const formatCurrency = (amount) => {
        if (!amount) return '';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const apiBaseUrl = process.env.REACT_APP_API_URL;

    // when the form is clicked for edit
    const handleEditGoal = async (e) => {
        e.preventDefault()
        try{
            setError(null)
            const formattedAmount = parseFloat(editGoal.amount)
            const response = await axios.put(`${apiBaseUrl}/goals/edit/${goal.goal_id}`,
                {
                    description: editGoal.description,
                    amount: formattedAmount,
                    target_date: editGoal.target_date
                },
                {withCredentials:true})
            if (response.status === 200) {
                setSuccessMessage ('Goal modified successfully')
                setTimeout(() => {
                    setSuccessMessage(null)
                    // Close the form after showing success message
                    if (onSave) {
                        onSave();
                    }
                }, 5000)
        } else{
            setError (response.data.errors || response.data.error || 'Failed to modify goals')
            setTimeout(() => {
                setError (null)
            }, 3000)
        }   
        } catch (error) {
            console.error('Error modifying goal:', error)
            setError(error.response?.data?.errors || error.response?.data?.error || 'Failed to modify goal')
        }
        setTimeout(() => {
            setError(null)
        }, 3000)}

    const handleCancel = () => {
        if(onCancel) {
            onCancel()
        }
    }



return (
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
           <p className="text-sm font-medium text-red-800">{error}</p>
       </div>
   )}
   <div className="mb-4">
       <h3 className="text-lg font-medium text-gray-900">Edit Goal</h3>
   </div>
   {/* Edit form for goals here */}

    <form onSubmit={handleEditGoal} className="space-y-4">
        <div className="space-y-4">
            {/* description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                </label>
                <input 
                    type="text"
                    value={editGoal.description}
                    onChange={(e) => setEditGoal({...editGoal, description:e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                    focus:outline-none 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
            </div>
            {/* amount */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                </label>
                <input 
                    type="number"
                    value={editGoal.amount}
                    onChange={(e) => setEditGoal({...editGoal, amount:e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                    focus:outline-none 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
            </div>
            {/* target date */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date
                </label>
                <input 
                    type="date"
                    value={editGoal.target_date}
                    onChange={(e) => setEditGoal({...editGoal, target_date:e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                    focus:outline-none 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
                <button 
                    type="button"
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm
                     font-medium text-gray-700 bg-white hover:bg-gray-200"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm 
                    text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    Update Goal
                </button>
            </div>
        </div>
    </form>
 </div>

)
}
export default EditGoals