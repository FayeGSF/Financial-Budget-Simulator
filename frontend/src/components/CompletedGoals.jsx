import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrophy, FaArrowLeft, FaCheckCircle, FaClock, FaCalendarAlt, FaPiggyBank, FaFlagCheckered } from 'react-icons/fa';
import ChartSavings from './ChartSavings';

export default function CompletedGoals({ dashboardData, onBack }) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    
    // States
    const [savings, setSavings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState('');
    const [filteredSavings, setFilteredSavings] = useState([]);

    // Extract completed goals data from dashboardData 
    const completedGoals = dashboardData?.completed_goals || [];
    const goalProgress = dashboardData?.goal_progress || [];

    // State to trigger chart updates
    const [chartUpdateTrigger, setChartUpdateTrigger] = useState(0);

    // Fetch savings on mount
    useEffect(() => {
        fetchSavings();
    }, []);

    // Filter savings to show only completed goals' savings
    useEffect(() => {
        const completedGoalIds = completedGoals.map(goal => goal.goal_id.toString());
        const completedSavings = savings.filter(saving => 
            completedGoalIds.includes(saving.goal_id.toString())
        );
        
        const filtered = selectedGoal 
            ? completedSavings.filter(saving => saving.goal_id.toString() === selectedGoal)
            : completedSavings;
            
        setFilteredSavings(filtered);
    }, [selectedGoal, savings, completedGoals]);

    // Fetch savings from backend
    const fetchSavings = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await axios.get(`${apiBaseUrl}/savings/get_savings`, { 
                withCredentials: true 
            });
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
        return new Date(dateString).toLocaleDateString('en-NZ', {
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

    // Get completed goals for chart (only completed ones)
    // const completedGoalsForChart = goalProgress.filter(goal => 
    //     completedGoals.some(completed => completed.goal_id === goal.goal_id)
    // );

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onBack}
                                    className="text-white hover:text-yellow-200 transition-colors mr-4"
                                >
                                    <FaArrowLeft className="text-xl" />
                                </button>
                                <FaTrophy className="text-2xl text-white" />
                                <div>
                                    <h2 className="text-2xl lg:text-3xl font-bold text-white">Completed Goals</h2>
                                    <p className="text-yellow-100 mt-1">Celebrate your achievements and view your savings journey</p>
                                </div>
                            </div>
                        </div>
                    </div>  
                </div>

                {/* Completed Goals Summary */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Completed Goals</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {completedGoals.map((goal, index) => {
                                const completedDate = new Date(goal.completed_at);
                                const targetDate = new Date(goal.target_date);
                                const completedOnTime = completedDate <= targetDate;
                                
                                return (
                                    <div key={goal.goal_id} className="border border-gray-200 rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 rounded-full">
                                                    <FaCheckCircle className="text-green-600 text-lg" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 text-lg mb-2">{goal.description}</h4>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                        <span className="flex items-center gap-1">
                                                            <FaCalendarAlt className="text-xs" />
                                                            Target: {formatDate(goal.target_date)}
                                                        </span>
                                                    </div>
                                                   
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <FaPiggyBank className="text-xs" />
                                                            Saved:{formatCurrency(goal.amount_saved)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {completedOnTime ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <FaCheckCircle className="mr-1" />
                                                            On Time
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            <FaClock className="mr-1" />
                                                            Late
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                        </div>
                                        <div className="flex justify-center items-center text-sm text-gray-600">
                                            <span className="flex items-center mr-1 font-semibold">
                                                <FaFlagCheckered className="text-xs mr-1 " />
                                                Completed On:{formatDate(goal.completed_at)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Chart for Completed Goals */}
                {/* <ChartSavings 
                    triggerChartUpdate={chartUpdateTrigger} 
                    goalProgress={completedGoalsForChart}
                    title="Completed Goals Progress"
                /> */}

                {/* Savings List */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Savings History for Completed Goals</h3>
                        
                        {/* Filter by goals */}
                        <div className="flex justify-end items-center gap-2 mt-4">
                            <label className="text-sm font-medium text-gray-600">Filter by Goal:</label>
                            <select
                                value={selectedGoal}
                                onChange={(e) => setSelectedGoal(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none">
                                <option value="">All Completed Goals</option>
                                {completedGoals.map((goal) => (
                                    <option key={goal.goal_id} value={goal.goal_id}>
                                        {goal.description}
                                    </option>
                                ))}
                            </select>
                        </div> 
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
                            <span className="ml-3 text-gray-600">Loading savings...</span>
                        </div>
                    ) : filteredSavings.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <FaPiggyBank className="text-4xl mx-auto mb-4 text-gray-300" />
                            <p>No savings found for completed goals.</p>
                            <p className="text-sm">Savings will appear here once you have completed goals.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredSavings.map((saving, index) => (
                                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-green-100 rounded-full">
                                                <FaCheckCircle className="text-green-600 text-sm" />
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
                                                +{formatCurrency(saving.amount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
