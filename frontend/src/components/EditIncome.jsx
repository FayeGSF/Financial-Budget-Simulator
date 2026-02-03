import { useState } from 'react';
import axios from 'axios';

export default function EditIncome ({ income, onSave, onCancel }) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;

    const [ editIncome, setEditIncome ] = useState ({
        amount : income.amount || '',
        frequency: income.frequency || '',
        comment: income.comment || ''
    })
    const [error, setError] = useState(null)
    const[successMessage, setSuccessMessage] = useState(null)

    const handleEditIncome = async (e) => {
        e.preventDefault ()
        try {
            setError(null)
            const formattedAmount = parseFloat (editIncome.amount)
            const response = await axios.put (`${apiBaseUrl}/user/edit_income`,
            {
                amount : formattedAmount, 
                frequency : editIncome.frequency,
                comment : editIncome.comment
            }, {withCredentials : true})
            if (response.status === 200 || response.status === 201){
                setSuccessMessage('Income modified successfully')
                setTimeout ( () =>{
                    setSuccessMessage (null)
                    if (onSave) {
                        onSave()
                    }
                }, 3000)
            } else {
                setError (response.data.error || response.data.errors)
                setTimeout ( () => {
                    setError (null)
                }, 3000)
            }
        }catch (error) {
            console.error('Error in edit income:', error)
            setError(error.response?.data?.error || 'Failed to modify income')
            setTimeout( () => {
                setError(null)
            },3000)
        }

        // function last tag
    }

    const handleCancel = () => {
        if(onCancel){
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
                <h3 className="text-lg font-medium text-gray-900">Edit Income</h3>
            </div>
            {/* edit income here */}
            <form onSubmit ={handleEditIncome} className='space-y-4'> 
                <div className='space-y-4'>
                    {/* amount */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                    </label>
                    <input 
                    type="number"
                    value ={editIncome.amount}
                    onChange = {(e) => setEditIncome ({...editIncome, amount: e.target.value})}
                    className ="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                    focus:outline-none 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder={`Original amount: ${income.amount || 'Not set'}`}
                   />
                    </div>
                    <div>
                    <label className ="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                    </label>
                        <select
                        value = {editIncome.frequency}
                        onChange= {(e) => setEditIncome ({...editIncome, frequency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value ="hourly">Hourly</option>
                            <option value="monthly">Monthly</option>
                            <option value="weekly">Weekly</option>
                            <option value="yearly">Yearly</option>

                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comment (Optional)
                        </label>
                        <textarea
                            value={editIncome.comment}
                            onChange={(e) => setEditIncome({...editIncome, comment: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add any additional notes about your income..."
                            rows="3"
                        />
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
                        Update Income
                    </button>
                </div>

            </form>


        </div>


// last return tag
    )

// ending function tag
}