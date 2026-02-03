import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function ChartSavings({ triggerChartUpdate, goalProgress }) {
    const apiUrl = process.env.REACT_APP_API_URL;
// state management
// 1. load the user goals
// 2. load the infor of each goal 
// 3. is loading
//4. is error
    const [userGoals, setUserGoals] = useState ([])
    const [savingByGoal, setSavingByGoal] = useState ([])
    const [isLoading, setIsLoading] = useState (false)
    const [error, setError] = useState (null)

    // Single useEffect to handle both initial load and updates
    useEffect(() => {
        fetchUserSavingsbyGoal();
    }, [triggerChartUpdate, goalProgress]) // Depend on both triggerChartUpdate and goalProgress

    // function to fetch the user goals
    const fetchUserSavingsbyGoal = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`${apiUrl}/savings/savings_by_goal`, {
                withCredentials: true
            });
            console.log('response from backend', response.data.user_goals);
            console.log('response from backend', response.data.goal_savings);
            if (response.status === 200) {
                // Filter goals based on goalProgress prop
                const goalIds = new Set(goalProgress.map(goal => goal.goal_id));
                const filteredGoalSavings = response.data.goal_savings.filter(goal => 
                    goalIds.has(goal.goal_id)
                );
                
                setUserGoals(response.data.user_goals);
                setSavingByGoal(filteredGoalSavings);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Create chart data for a single goal
    const createGoalChartData = (goal) => {
        const goalInfo = goalProgress.find(g => g.goal_id === goal.goal_id);
        const totalSaved = Number(goal.total_saved) || 0;
        const goalAmount = Number(goalInfo?.goal_amount) || 0;
        const remaining = goalAmount - totalSaved;

        return {
            labels: [goal.description],
            datasets: [
                {
                    label: 'Amount Saved',
                    data: [totalSaved],
                    backgroundColor: 'rgba(34, 197, 94, 0.8)', // Green color
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                    stack: 'Stack 0'
                },
                {
                    label: 'Amount Remaining',
                    data: [remaining],
                    backgroundColor: 'rgba(156, 163, 175, 0.7)', // Gray color
                    borderColor: 'rgba(156, 163, 175, 0.6)',
                    borderWidth: 1,
                    borderRadius: 4,
                    stack: 'Stack 0'
                }
            ]
        };
    };

    // Chart options for individual goal charts
    const getGoalChartOptions = (goal) => {
        const goalInfo = goalProgress.find(g => g.goal_id === goal.goal_id);
        const totalSaved = Number(goal.total_saved) || 0;
        const goalAmount = Number(goalInfo?.goal_amount) || 0;
        const progressPercentage = goalAmount > 0 ? (totalSaved / goalAmount) * 100 : 0;

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                datalabels: {
                    color: function (context) {
                        return context.datasetIndex === 0 ? 'black' : '';
                    },
                    anchor: 'center',
                    align: 'top',
                    // add the dollar sign to the value
                    formatter: (value) => value > 0 ? '$' + value.toFixed(2) : '$0.00',
                    font: { size: 12, weight: 'bold' }
                },
                legend: {display: false},
            },
            scales: {
                x: {stacked: true,display: false, grid: {display: false}},
                y: { stacked: true, display: false, beginAtZero: true, grid: {display: false}}
                },
                // bar width smaller
            barPercentage: 0.5,
        // closing tag
        };
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading goals...</span>
                </div>
            ) : error ? (
                <div className="text-red-600 text-center py-8">Error loading goals: {error}</div>
            ) : savingByGoal.length === 0 ? (
                <div className="text-gray-500 text-center py-8">No savings available</div>
            ) : (
                
                <div className="grid grid-cols-3 gap-4">
                    {savingByGoal.map((goal) => {
                        const goalInfo = goalProgress.find(g => g.goal_id === goal.goal_id);
                        const totalSaved = Number(goal.total_saved) || 0;
                        const goalAmount = Number(goalInfo?.goal_amount) || 0;
                        const remaining = goalAmount - totalSaved;
                        return (
                            <div key={goal.goal_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 min-w-60 max-w-60">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3 text-center">
                                    {goal.description}
                                </h3>
                                
                                {/* Mini Stacked Bar Chart */}
                                <div className="mb-3 h-40">
                                    <Bar 
                                        data={createGoalChartData(goal)} 
                                        options={getGoalChartOptions(goal)} 
                                    />
                                </div>

                                {/* Amount Details */}
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Saved:</span>
                                        <span className="font-semibold text-green-600">
                                            ${totalSaved.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Remaining:</span>
                                        <span className="font-semibold text-gray-600">
                                            ${remaining.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t pt-1">
                                        <span className="font-semibold text-gray-800">Goal Amount:</span>
                                        <span className="font-bold text-blue-600">
                                            ${goalAmount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}