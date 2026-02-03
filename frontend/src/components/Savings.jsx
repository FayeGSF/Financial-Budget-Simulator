import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPiggyBank, FaPlus, FaTimes, FaBullseye, FaEdit, FaTrophy, FaTrash } from 'react-icons/fa';
import AddSavings from './AddSavings';
import ChartSavings from './ChartSavings';
import EditSavings from './EditSavings';
import CompletedGoals from './CompletedGoals';

export default function Savings({ dashboardData, onGoalUpdate }) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    
    // States
    const [savings, setSavings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [editingSavingsId, setEditingSavingsId] = useState(null);
    //when goal is completed, show congrats message
    const [congratulationsMessage, setCongratulationsMessage] = useState(null);
    //track if the goal is newly completed or not
    //prevents the congrats message from showing of not newly completed goal
    const [oldCompletedGoal, setOldCompletedGoal] = useState(new Set());

    // Extract goals data from dashboardData 
    const goalProgress = dashboardData?.goal_progress || [];
    const completedGoals = dashboardData?.completed_goals || [];
    
    // Get completed goal IDs for filtering
    const completedGoalIds = new Set(completedGoals.map(goal => goal.goal_id));
    // Filter goal progress to only show non-completed goals
    const activeGoals = goalProgress.filter(goal => !completedGoalIds.has(goal.goal_id));
    // State for showing completed goals view
    const [showCompletedGoals, setShowCompletedGoals] = useState(false);
    
    // State to trigger chart updates
    const [chartUpdateTrigger, setChartUpdateTrigger] = useState(0);
    // Function to refresh chart when savings are updated
    const refreshChart = () => {
        setChartUpdateTrigger(prev => prev + 1);
    };
    const [ selectedGoal, setSelectedGoal] = useState ('');
    // Function to check completed goals
    const checkCompletedGoals = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/goals/completed`, 
                { withCredentials: true }
            );
            if (response.status === 200 && response.data.message !== 'No completed goals') {
                const currentCompletedGoals = response.data.completed_goals || [];
                // Find newly completed goals (not in previously completed)
                const newlyCompleted = currentCompletedGoals.filter(goal => 
                    !oldCompletedGoal.has(goal.goal)
                );
                // Show congratulations only for newly completed goals
                if (newlyCompleted.length > 0) {
                    newlyCompleted.forEach(goal => {
                        setCongratulationsMessage({
                            goal: goal.goal,
                            status: goal.status,
                            message: goal.message
                        });
                    });
                    // Refresh dashboard data to update active goals
                    if (onGoalUpdate) {
                        onGoalUpdate();
                    }
                }
                // Update the previously completed goals set to include newly completed goals
                // This prevents them from showing again
                setOldCompletedGoal(prev => {
                    const newSet = new Set(prev);
                    newlyCompleted.forEach(goal => newSet.add(goal.goal));
                    return newSet;
                });
            }
        } catch (error) {
            console.error('Error checking completed goals:', error);
        }
    };

    // Fetch savings on mount
    useEffect(() => {
        fetchSavings();
    }, []);

    // Fetch savings from backend
    const fetchSavings = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(`${apiBaseUrl}/savings/get_savings`, { 
                withCredentials: true 
            });
            console.log('Savings:', response.data.data);
            if (response.status === 200) {
                setSavings(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching savings:', error);
            if (error.response) {
                setError(error.response.data?.error || 'Failed to fetch savings');
            } else {
                setError('Network error. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NZ', {
            style: 'currency',
            currency: 'NZD'
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get goal description by ID from goal_progress
    const getGoalDescription = (goalId) => {
        const goal = goalProgress.find(g => g.goal_id === goalId);
        return goal ? goal.description : 'Unknown Goal';
    };

    const handleEditSavings = (savingsId) => {
        setEditingSavingsId(savingsId);
    };
    const handleEditSavingsComplete = () => {
        fetchSavings();
        refreshChart();
        setEditingSavingsId(null);
    };

    const handleCancelEdit = () => {
        setEditingSavingsId(null);
    };

    // Show completed goals component if requested
    if (showCompletedGoals) {
        return (
            <CompletedGoals 
                dashboardData={dashboardData} 
                onBack={() => setShowCompletedGoals(false)} 
            />
        );
    }

    const handleDeleteSaving = async (savings_id) => {
        try{
            setIsLoading(true);
            const response = await axios.delete(`${apiBaseUrl}/savings/delete`, {
                data: { savings_id: savings_id },
                withCredentials: true
            })
            if (response.status === 200){
                setSuccessMessage('Saving deleted successfully');
                setTimeout(() => {
                    setSuccessMessage (null);
                },3000)
                fetchSavings()
            } else {
                setError(response.data.error);
            }
        } catch (error) {
            setError(error.response.data.error || 'An error occurred')
            setTimeout(() => {
                setError (null)
            }, 3000);
        } finally {
            setIsLoading (false);
        }

    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-lime-900 to-lime-700 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-white">Savings</h2>
                                <p className="text-blue-100 mt-1">Track your savings and reach your goals</p>
                            </div>
                            <div className="flex gap-2">

                            <button 
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                                    rounded-md text-blue-600 bg-white hover:bg-blue-600 hover:text-white transition-colors"
                                >
                                    {showAddForm ? <FaTimes className="mr-2" /> : <FaPlus className="mr-2" />}
                                    {showAddForm ? 'Cancel' : 'Add Savings'}
                                </button>
                                {completedGoals && (
                                    <button 
                                        onClick={() => setShowCompletedGoals(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                                        rounded-md text-yellow-600 bg-yellow-100 hover:bg-yellow-200 transition-colors"
                                    >
                                        <FaTrophy className="mr-2" />
                                        View Completed Goals
                                    </button>
                                )}
                               
                            </div>
                        </div>
                    </div>  
                </div>
                {/* Add Savings Form */}
                {showAddForm && (
                <AddSavings 
                    onSave={async () => {
                        await fetchSavings();
                        refreshChart();
                        // Check for completed goals after adding savings
                        await checkCompletedGoals();
                    }} 
                    onClose={() => setShowAddForm(false)}
                    goals={activeGoals}
                />
                )}

                {/* Congratulations Message */}
                {congratulationsMessage && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 shadow-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div>
                                <h3 className="text-lg font-bold text-green-800">
                                    🎉 Congratulations! {congratulationsMessage.goal} Completed! 🎉
                                </h3>
                                {congratulationsMessage.status === 'completed_on_time' && (
                                    <p className="text-green-500 text-sm font-semibold">
                                        ⭐ You completed this goal on time! Great job!
                                    </p>
                                )}
                                {congratulationsMessage.status === 'completed_late' && (
                                    <p className="text-yellow-600 text-sm font-semibold">
                                        ⏰ You completed this goal after the target date, but better late than never!
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setCongratulationsMessage(null)}
                            className="text-green-400 hover:text-green-600 transition-colors"
                        >
                            <FaTimes className="text-lg" />
                        </button>
                    </div>
                )}

                {/* Chart Savings */}
                <ChartSavings triggerChartUpdate={chartUpdateTrigger} goalProgress={activeGoals}  />

                {/* Messages */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <p className="text-sm font-medium text-green-800">{successMessage}</p>
                    </div>
                )}
            
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                )}

                {/* Loading Spinner */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading savings...</span>
                    </div>
                ) : (
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">Recent Savings</h3>
                        
                    {/* filter by goals */}
                        <div className="flex justify-end items-center gap-2">
                            <label className="text-sm font-medium text-gray-600">Filter by Goal:</label>
                            <select
                                value={selectedGoal}
                                onChange={(e) => setSelectedGoal(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none">
                                <option value="">All Active Goals</option>
                                {activeGoals.map((goal) => (
                                    <option key={goal.goal_id} value={goal.goal_id}>
                                        {goal.description}
                                </option>
                                ))}
                            </select>
                        </div> 
                        </div>

                        {savings.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <FaPiggyBank className="text-4xl mx-auto mb-4 text-gray-300" />
                                <p>No savings recorded yet.</p>
                                <p className="text-sm">Start saving towards your goals!</p>
                            </div>
                        ) : (
                        
                            <div className="divide-y divide-gray-200">
                                {savings
                                    .filter(saving => !completedGoalIds.has(saving.goal_id)) // Exclude completed goals
                                    .filter(saving => !selectedGoal || saving.goal_id.toString() === selectedGoal)
                                    .map((saving, index) => (
                                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-green-100 rounded-full">
                                                    <FaBullseye className="text-green-600 text-sm" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {saving.description || getGoalDescription(saving.goal_id)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(saving.date)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-green-600">
                                                    <FaPlus className=" inline text-xs" /> {formatCurrency(saving.amount)}
                                                </p>
                                            </div>
                                            <div>
                                                <button onClick={() => handleEditSavings(saving.savings_id)}
                                                className="inline-flex items-center mr-2 px-3 py-1 rounded-md 
                                                text-sm font-medium text-blue-600 bg-white hover:bg-gray-200 ">
                                                <FaEdit className="mr-1" />
                                                </button>
                                                <button onClick={() => handleDeleteSaving(saving.savings_id)}
                                                className="text-red-600 hover:text-red-800 transition-colors duration-200 "
                                                title="Delete savings"
                                            > 
                                                <FaTrash className="mr-1" />

                                        </button>
                                            </div>
                                        </div>
                                        
                                        {/* Edit Form*/}
                                        {editingSavingsId === saving.savings_id && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <EditSavings 
                                                    key={`edit-${saving.savings_id}`}
                                                    savings={saving}
                                                    onSave={handleEditSavingsComplete}
                                                    onCancel={handleCancelEdit}
                                                    goalProgress={activeGoals}
                                                />
                                            </div>
                                        )}
                                       
                                    </div>
                                ))}
                            </div>
                        )}
                        
                    </div>
                )}
            </div>
        </div>
    );
}