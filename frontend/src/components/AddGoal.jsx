import axios from 'axios';
import { useState, useEffect } from 'react';


function AddGoal({ onSave, onClose }) {
    const [addGoal, setAddGoal] = useState ({
        description: '',
        amount:'',
        target_date:''
    })
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    // const [showAddForm, setShowAddForm] = useState(false);

    // const formatCurrency = (amount) => {
    //     if (!amount) return '';
    //     return new Intl.NumberFormat('en-NZ', {
    //         style: 'currency',
    //         currency: 'NZD'
    //     }).format(amount);
    // };
    
    const apiBaseUrl = process.env.REACT_APP_API_URL;

    const handleAddGoal = async (e) => {
        e.preventDefault()
        try{
            setError(null)
            setSuccessMessage(null)
            const formattedAmount = parseFloat(addGoal.amount)
            
            const response = await axios.post(`${apiBaseUrl}/goals/add` ,
                {
                    description: addGoal.description,
                    amount: formattedAmount,
                    target_date: addGoal.target_date
                },
                {withCredentials: true})
            
            if (response.status === 201 || response.status === 200) {
                setSuccessMessage('New Goal added successfully');
                setAddGoal({
                    description: '',
                    amount: '',
                    target_date: ''
                })
                setTimeout(() => {
                    onSave();
                    onClose(); // Close the form
                }, 3000);
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 3000)
                
            } else {
                setError(response.data.errors || response.data.error || 'Failed to add goal');
            } 
        }
        catch (error) {
            console.error('Error adding goal:', error);
            setError(error.response?.data?.errors || error.response?.data?.error || 'Failed to add goal');
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
          
            {/* // main add goal form */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Add New Goal</h3>
                <form onSubmit={handleAddGoal} className="px-4 sm:px-6 py-4 sm:py-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Goal Name <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                value={addGoal.description} 
                                onChange={(e) => setAddGoal({...addGoal, description: e.target.value})} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                placeholder="Give your goal a name"
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
                                value={addGoal.amount} 
                                onChange={(e) => setAddGoal({...addGoal, amount: e.target.value})} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                placeholder="$0.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Date
                            </label>
                            <input 
                                type="date"
                                value={addGoal.target_date}
                                onChange={(e) => setAddGoal({...addGoal, target_date: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
                        <button 
                            type="submit"
                            className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            Add Goal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    );
} export default AddGoal;