// similar to dashboard but with added functionality to add, delete, update goals
//  separate jsx add and edit goals
import axios from 'axios';
import { useState } from 'react';
import { FaPlus, FaTimes, FaBullseye, FaCalendarAlt, FaEdit, FaTrash, FaTrophy } from 'react-icons/fa';
import { LuPartyPopper } from "react-icons/lu";
import { GiMoneyStack } from "react-icons/gi";
import EditGoals from './EditGoals';
import AddGoal from './AddGoal';


function Goals({ goals, goalProgress, isLoading, dashboardData, onGoalUpdate, onViewCompletedGoals }) {
    const totalSavings = 0 
    const totalGoals = goals?.length || 0
    const [showAddForm, setShowAddForm] =useState(false)
    const [error, setError] = useState (null)
    const[successMessage, setSuccessMessage] = useState (null)
    const [loading, setLoading] = useState(true);
    const [editingGoalId, setEditingGoalId] = useState(null);

   

     // format currency of amount from backend
     const formatCurrency =(amount) => {
        return new Intl.NumberFormat ('en-NZ', {
            style: 'currency',
            currency: 'NZD'
        }).format (amount || 0)
    }
    // formate date from SQL to frontend format
        const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    // Progress bar component for individual goals
    const ProgressBar = ({ goal }) => {
        // progress data for specific goal based on goal_id
        const progress = goalProgress?.find(p => p.goal_id === goal.goal_id);
        if (!progress) {
            return (
                <div className="px-4 sm:px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-300 h-2 rounded-full"></div>
                    </div>
                </div>
            );
        }
        //  if there is a progress %, show the color etc
        return (
            <div className="px-4 sm:px-6 py-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300" 
                        style={{width: `${progress.percentage || 0}%`}}
                    ></div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                    <div className="flex items-center space-x-1">
                        <GiMoneyStack className="text-green-600" />
                        <span>${(progress.goal_saving || 0).toLocaleString()} saved</span>
                    </div>
                    <span className="text-green-600 font-medium">{progress.percentage || 0}%</span>
                </div>
            </div>
        );
    };

    const handleEditGoal = (goalId) => {
        setEditingGoalId(goalId);
    };

    const handleCancelEdit = () => {
        setEditingGoalId(null);
    };

    const handleGoalUpdated = () => {
        setEditingGoalId(null);
        if (onGoalUpdate) {
            onGoalUpdate();
        }
    };



const apiBaseUrl = process.env.REACT_APP_API_URL;
// delete goal 
const handleDeleteGoal = async (goalId) => {
    try {
        setError(null);
        const response = await axios.delete(`${apiBaseUrl}/goals/delete/${goalId}`, 
            {withCredentials: true});
        
        if (response.status === 200) {
            setSuccessMessage('Goal deleted successfully');
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
            onGoalUpdate();
        } else {
            setError(response.data.error || 'Failed to delete goal');
            setTimeout(() => {
                setError(null);
            }, 5000);
        }
    } catch (error) {
        console.error('Error deleting goal:', error);
        setError(error.response?.data?.error || 'Failed to delete goal');
        setTimeout(() => {
            setError(null);
        }, 5000);
    }
}



// main return render section
return(
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8">
    <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-4 lg:mb-4">
            <div className="bg-gradient-to-r from-lime-900 to-lime-700 px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Goals</h2>
                        <p className="text-blue-100 mt-1 text-sm sm:text-base">Manage your financial goals</p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                <button 
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm 
                                    font-medium rounded-md text-blue-600 bg-white hover:bg-blue-500 hover:text-white"
                                >
                                    {showAddForm ? <FaTimes className="mr-2" /> : <FaPlus className="mr-2" />}
                                    {showAddForm ? 'Cancel' : 'Add Goal'}
                                </button>
                        </div>
                        {onViewCompletedGoals && (
                                <div className="flex justify-center mb-4 sm:justify-end">
                                    <button 
                                        onClick={onViewCompletedGoals}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                                        rounded-md text-yellow-600 bg-yellow-100 hover:bg-yellow-200 transition-colors"
                                    >
                                        <FaTrophy className="mr-2" />
                                        View Completed Goals
                                    </button>
                                </div>
                            )}
                    </div>
                </div>
            </div>  
        </div>
    {/* End of header */}
    {/* show add goal form :similar to fixed expense format */}
    {showAddForm && (
            <AddGoal onSave={() => {setShowAddForm(false);
                               setError(null);
                               if (onGoalUpdate) {
                                   onGoalUpdate();
                               }
                           }} 
                           onClose={() => setShowAddForm(false)} 
                       />
                   )}

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

    {/* Loading Spinner */}
    {/* instead of showing no goals while it is loading, show loading spinner for better UX */}
    {isLoading || !dashboardData ? (
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading goals...</span>
        </div>
    ) : (
        /* show list of goals */
        <div className="space-y-6">
            {/* Active Goals Section */}
            {goals && goals.filter(goal => !goal.completed).length > 0 && (
                <div>
                    <div className=" flex justify-center align-center text-center bg-blue-100 shadow-lg rounded-lg mb-4 py-2 ">
                    <h3 className="text-2xl mt-2 ml-4 font-semibold align-center text-blue-700 mb-4 px-2">Active Goals</h3>
                    </div>
                    <div className="space-y-4">
                        {goals.filter(goal => !goal.completed).map((goal) => (
                        <div key={goal.goal_id}>
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-6 lg:mb-8">
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-lg font-semibold text-gray-900">{goal.description}</h4>
                                        <div>
                                        {goal.completed ? (
                                            <div className ="border border-green-300 rounded-md p-2 bg-green-100">
                                                <LuPartyPopper className="inline mr-2 text-green-600 text-2xl" />
                                                <span className="text-md font-medium text-green-600">Goal Completed</span>
                                            </div>
                                        ) : (
                                            <div>
                                                <button
                                                    onClick={() => handleEditGoal(goal.goal_id)}
                                                    className="inline-flex items-center mr-2 px-3 py-1 rounded-md border border-gray-300
                                                    text-sm font-medium text-blue-600 bg-white hover:bg-gray-200 ">
                                                    <FaEdit className="mr-1" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGoal(goal.goal_id)}
                                                    className="inline-flex items-center px-3 py-1 rounded-md border border-gray-300
                                                    text-sm font-medium text-red-600 bg-white hover:bg-gray-50 ">
                                                    <FaTrash className="mr-1" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 ">
                                      <div className="flex items-center space-x-2">
                                            <FaBullseye className="text-red-600" />
                                            <span className="text-sm text-gray-600">Target:</span>
                                            <span className="text-lg font-bold text-green-600">${parseFloat(goal.goal_amount || 0).toLocaleString()}</span>
                                        </div>
                                        
                                        <div className="flex justify-end items-center space-x-2">
                                            <FaCalendarAlt className="text-gray-600" />
                                            <span className="text-sm text-gray-600">Target Date:</span>
                                            <span className="text-sm font-medium text-blue-600">
                                                {goal.target_date ? formatDate(goal.target_date) : 'No date set'}
                                            </span>
                                        </div >
                                        {/* remaining amount to save */}
                                        <div className="flex justify-start items-center space-x-2">
                                            <span className="text-sm text-gray-600">Remaining to save:</span>
                                            <span className="text-md font-semibold text-blue-600">$ {(() => {
                                                const progress = goalProgress?.find(p => p.goal_id === goal.goal_id);
                                                return parseFloat(progress?.goal_remaining  || 0).toLocaleString();
                                            })()}</span>
                                         </div>
                                     </div>
                                </div>
                                <ProgressBar goal={goal} />
                            </div>
                            
                            {/* Show edit form for goals */}
                            {editingGoalId === goal.goal_id && (
                                <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-6 lg:mb-8">
                                    <EditGoals 
                                        key={`edit-${goal.goal_id}`}
                                        goal={goal}
                                        onSave={handleGoalUpdated}
                                        onCancel={handleCancelEdit}
                                    />
                                </div>
                            )}
                        </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Goals Section */}
            {goals && goals.filter(goal => goal.completed).length > 0 && (
                <div>
                    <div className="bg-green-100 shadow-lg rounded-lg mb-4 py-4">
                        <div className="flex justify-center items-center px-4">
                            <h3 className="text-2xl font-semibold text-green-600">Completed Goals</h3>
                        </div>
                    </div>
                   
                    <div className="space-y-4">
                        {goals.filter(goal => goal.completed).map((goal) => (
                        <div key={goal.goal_id}>
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-6 lg:mb-8">
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-lg font-semibold text-gray-900">{goal.description}</h4>
                                        <div>
                                        {goal.completed ? (
                                            <div className ="border border-green-300 rounded-md p-2 bg-green-100">
                                                <LuPartyPopper className="inline mr-2 text-green-600 text-2xl" />
                                                <span className="text-md font-medium text-green-600">Goal Completed</span>
                                            </div>
                                        ) : (
                                            <div>
                                                <button
                                                    onClick={() => handleEditGoal(goal.goal_id)}
                                                    className="inline-flex items-center mr-2 px-3 py-1 rounded-md border border-gray-300
                                                    text-sm font-medium text-blue-600 bg-white hover:bg-gray-200 ">
                                                    <FaEdit className="mr-1" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGoal(goal.goal_id)}
                                                    className="inline-flex items-center px-3 py-1 rounded-md border border-gray-300
                                                    text-sm font-medium text-red-600 bg-white hover:bg-gray-50 ">
                                                    <FaTrash className="mr-1" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 ">
                                      <div className="flex items-center space-x-2">
                                            <FaBullseye className="text-red-600" />
                                            <span className="text-sm text-gray-600">Target:</span>
                                            <span className="text-lg font-bold text-green-600">${parseFloat(goal.goal_amount || 0).toLocaleString()}</span>
                                        </div>
                                        
                                        <div className="flex justify-end items-center space-x-2">
                                            <FaCalendarAlt className="text-gray-600" />
                                            <span className="text-sm text-gray-600">Target Date:</span>
                                            <span className="text-sm font-medium text-blue-600">
                                                {goal.target_date ? formatDate(goal.target_date) : 'No date set'}
                                            </span>
                                        </div >
                                        {/* remaining amount to save */}
                                        <div className="flex justify-start items-center space-x-2">
                                            <span className="text-sm text-gray-600">Remaining to save:</span>
                                            <span className="text-md font-semibold text-blue-600">$ {(() => {
                                                const progress = goalProgress?.find(p => p.goal_id === goal.goal_id);
                                                return parseFloat(progress?.goal_remaining  || 0).toLocaleString();
                                            })()}</span>
                                         </div>
                                     </div>
                                </div>
                                <ProgressBar goal={goal} />
                            </div>
                            
                            {/* Show edit form for goals */}
                            {editingGoalId === goal.goal_id && (
                                <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-6 lg:mb-8">
                                    <EditGoals 
                                        key={`edit-${goal.goal_id}`}
                                        goal={goal}
                                        onSave={handleGoalUpdated}
                                        onCancel={handleCancelEdit}
                                    />
                                </div>
                            )}
                        </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Goals Message */}
            {!isLoading && (!goals || goals.length === 0) && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-4 sm:mb-6 lg:mb-8">
                    <div className="px-4 sm:px-6 py-8 text-center">
                        <p className="text-gray-500 text-lg">No goals found. Create your first goal to get started!</p>
                    </div>
                </div>
            )}
        </div> 
    )}

    
   
{/* main container closing tag */}
    </div>
    </div>
)

} export default Goals;