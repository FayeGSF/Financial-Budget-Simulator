// This file is not for rendering, it is for format standardization. 


{/* Success Message */}
 {successMessage && (
    <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-md p-3 sm:p-4">
        <div className="flex">
            <div className="flex-shrink-0">
               <p></p>
            </div>
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
            <div className="flex-shrink-0">
                <p></p>
            </div>
            <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
        </div>
    </div>
)}

// card component with buttons
<div className="max-w-3xl mx-auto">
{/* Header */}
<div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-6 lg:mb-8">
    <div className="bg-gradient-to-r from-lime-900 to-lime-700 px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Fixed Expenses</h2>
                <p className="text-blue-100 mt-1 text-sm sm:text-base">Manage your recurring expenses</p>
            </div>
            {/* loading state   */}
            {isLoading && (
                <div className="text-center py-8">
                    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
                        <FaSpinner className="animate-spin mr-2" />
                        Loading fixed expenses...
                    </div>
                </div>
            )}
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

{/* main container div  */}
</div>


// symbols: 


<FaTimes className ="mr-2" /> 
<FaEdit className = "mr-2" />
<FaPlus className="mr-2" />