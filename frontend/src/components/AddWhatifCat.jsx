import React, {useState }from "react";
import axios from 'axios';

export default function AddWhatifCategory( { onSave, onClose }) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;

    // State management for form fields
    const [categoryName, setCategoryName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 2. error & success message
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccessMessage(null)
        
        try {
            const response = await axios.post(`${apiBaseUrl}/whatif/add_hypothetical_category`,{
                category_name: categoryName
            }, { withCredentials: true })

            if (response.status === 201) {
                setSuccessMessage('Category added successfully!')
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 3000)
                // reset form
                setCategoryName('')
                // refresh categories list so user can see new category
                setTimeout(() => {
                    onSave()
                    onClose()
                }, 3000)
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to add category')
            setTimeout(() => {
                setError(null)
            }, 3000)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Whatif Category</h3>
                <p className="text-sm text-gray-600 mt-1">Create a hypothetical category for your what-if scenarios</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               
                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add an expense category *
                    </label>
                    <input
                        type="text"
                        id="category_name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                    </input>
                </div>
            </div>
            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Adding...' : 'Add Expense Category'}
                </button>
            </div>
        </form>
        </div>
    )
}

