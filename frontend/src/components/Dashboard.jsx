import React, { useState, useEffect } from 'react';
import { FaPiggyBank, FaBullseye, FaChartLine, FaCalendarAlt, FaDollarSign, FaPlus} from 'react-icons/fa';
import { GiMoneyStack } from "react-icons/gi";
import { GrMoney } from "react-icons/gr";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoIosClose } from "react-icons/io";
import { Link } from "react-router-dom";
import Tips from "./Tips"


// passing on the dashboard data from App.js, lesser API calls, faster loading.
function Dashboard ({ sessionData, dashboardData, onReload, isLoading, amountLeft}) {
    const apiBaseURL = process.env.REACT_APP_API_URL;
    const navigate = useNavigate()
    const [alertData, setAlertData] = useState(null)

    // Refresh dashboard data when component mounts 
    // (when navigating to Dashboard so it grabs the latest data)
    useEffect(() => {
        if (onReload) {
            onReload();
        }
        // Check for alert data when dashboard loads
        checkForAlert();
    }, []); // Empty dependency array = runs only on mount

    // Function to check if user needs to see alert about missing data (FE and income)
    const checkForAlert = async () => {
        try {
            const response = await axios.get(`${apiBaseURL}/auth/check-user-data`, {
                withCredentials: true,
            });
            
            if (response.data.show_alert) {
                setAlertData({
                    message: response.data.alert_message,
                    type: response.data.alert_type || 'info'
                });
            }
        } catch (error) {
            console.error("Error checking for alert:", error);
        }
    };

    const dismissAlert = () => {
        setAlertData(null);
    };
    
    const goals = dashboardData?.data || []
    const goalProgress = dashboardData?.goal_progress || []
    const totalSavings = dashboardData?.total_savings || 0
    const totalGoals = dashboardData?.goal_count || 0
    const scenarios = dashboardData?.best_scenario || []
    const tips = dashboardData?.tips || []
    const completedGoalsCount = dashboardData?.completed_goals_count || 0
    const active_goals = totalGoals - completedGoalsCount

    // format currency of amount from backend
    const formatCurrency =(amount) => {
        return new Intl.NumberFormat ('en-NZ', {
            style: 'currency',
            currency: 'NZD'
        }).format (amount || 0)
    }
    // formate date from SQL to frontend format
        const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-NZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // formate date for the scenario 
    const scenarioDate =(dateString) => {
        return new Date(dateString). toLocaleDateString ('en-NZ', {
            year:'numeric',
            month:'short'
        });
    };
    // map top 3 scenarios with highest to lowest amount saved
    const scenarioSorted = scenarios.sort((a , b) => {
         return b.total_saving_amt - a.total_saving_amt
        })
    const scenarioSortedTop = scenarioSorted.slice (0.3)


// calculation needs fixing, not in-use
    const calculateProgress = (saved, target) => {
        if (!target || target === 0) return 0;
        return Math.min((saved / target) * 100, 100);
    };

    if (!dashboardData || !sessionData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                    <button 
                        onClick={onReload}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Reload
                    </button>
                </div>
            </div>
        );
    }


    return  (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Alert for FE and income check upon login */}
                {alertData && (
                    <div className="mb-6">
                        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 rounded-xl">
                            <div className="flex justify-between items-center">
                                <p className="text-sm">{alertData.message} - {""}
                                    <Link to="/profile" className="text-yellow-800 hover:text-yellow-900 underline">
                                    Click here enter your details
                                    </Link>
                                </p>
                                <button
                                    onClick={dismissAlert}
                                    className="ml-4 text-yellow-600 hover:text-yellow-800 font-bold text-lg"
                                >
                                   <IoIosClose />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome {sessionData.username} !</h1>
                    <p className="text-gray-600">Track your savings progress and financial goals</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FaPiggyBank className="text-purple-600 text-xl" />
                            </div>
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-600">Total Savings</p>
                                <p className="text-lg font-bold text-gray-800">{formatCurrency(totalSavings)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${amountLeft >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                        <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${amountLeft >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                <GiMoneyStack className={`text-xl ${amountLeft >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                            </div>
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-600">
                                    {amountLeft >= 0 ? 'Remaining Balance' : 'Overspent'}
                                </p>
                                <p className={`text-lg font-bold ${amountLeft >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                                    {amountLeft >= 0 ? formatCurrency(amountLeft) : formatCurrency(Math.abs(amountLeft))}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaBullseye className="text-blue-600 text-xl" />
                            </div>
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-600">Active Goals</p>
                                <p className="text-lg font-bold text-gray-800">{active_goals}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <GrMoney className="text-orange-600 text-xl" />
                            </div>
                            <div className="ml-3">
                                <p className="text-xs font-medium text-gray-600">Completed Goals</p>
                                <p className="text-lg font-bold text-gray-800">{completedGoalsCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Tips Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4"> Tips</h2>
                        {isLoading ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Loading tips...</p>
                            </div>
                        ) : (
                            <Tips tips={tips}/>
                        )}
                    </div>
                    {/* User scenario summary */}
                    <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Top 3 Scenarios</h2>
                                <button 
                                 onClick={() => navigate('/whatif')}
                                className="inline mr-2 border-dashed border-2 
                                border-orange-500 rounded-lg p-2 hover:border-orange-700 
                                hover:bg-orange-100 text-gray-600 text-sm font-semibold">
                                <FaPlus className="inline-block mr-2 leading-none align-middle" />Create more Scenarios
                                </button>
                        </div>
                        
                        {scenarios.length > 0? ( scenarioSortedTop.map((scenario) => (
                                <div key={scenario.scenario_id} className="border border-gray-200 rounded-lg p-4 mb-4">
                                    <div className="">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold text-gray-800 text-lg">
                                                {scenario.name}
                                            </h4>
                                            <div className="text-right">
                                                <span className="text-sm text-gray-600">Created:</span>
                                                <span className="font-semibold text-gray-800 text-sm ml-1">{formatDate(scenario.formatted_date)}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4 ">
                                            <div className="flex justify-between items-center">
                                            {/* Total Saved Amount */}
                                            <span className ="text-sm text-gray-500">Predicted savings:</span>
                                            <span className ="text-sm text-blue-600">${scenario.total_saving_amt} </span>
                                            {/* created date */}
                                            </div>
                                            {/* <Link to = {`/whatif/scenario/${scenario.scenario_id}`} className ="text-sm text-blue-600 hover:text-blue-800 underline">View Details</Link> */}

                                        </div>
                                    </div>
                                </div>
                        ))):(
                            <div className =" flex justify-center mt-10">
                                <span className=" text-center italic text-gray-400">You have no scenarios. 
                                    <br />Create and save scenarios to see them 
                                    <Link to = "/whatif" className ="text-blue-500 hover:text-blue-600  underline font-semibold"> 
                                       <span> HERE</span>
                                    </Link>
                                    </span>

                            </div>
                         )} 
                    {/* ending tag for scenario summary */}
                    </div>
                </div>
                {/* Goals & Savings Section  */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
                    {/* Goals and Savings Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Your Goals & Savings</h2>
                    </div>

                    {goalProgress.filter(goal => goal.completed === 0).length === 0? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">🎯</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Goals Found</h3>
                            <p className="text-gray-500 mb-6">Start by creating your first financial goal!</p>
                            <button 
                                onClick={() => navigate('/goals')}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Create Your First Goal
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {goalProgress.filter(goal => goal.completed === 0).map((goal, index) => (
                                <div key={goal.goal_id || index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {goal.description || `Goal ${index + 1}`}
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            <FaCalendarAlt className="inline mr-1" />
                                            {formatDate(goal.target_date)}
                                        </span>
                                    </div>

                                    <div className="space-y-4 ">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Target Amount:</span>
                                            <span className="font-semibold text-gray-800">
                                                {formatCurrency(goal.goal_amount)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Saved Amount:</span>
                                            <span className="font-semibold text-green-600">
                                                {formatCurrency(goal.goal_saving)}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Progress</span>
                                                <span className="font-medium">
                                                    {calculateProgress(goal.goal_saving, goal.goal_amount).toFixed(1)}%
                                                </span>
                                            </div>
                                            {/* progress bar */}
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${calculateProgress(goal.goal_saving, goal.goal_amount)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-gray-100">
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>Remaining:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(Math.max(0, (goal.goal_amount || 0) - (goal.goal_saving || 0)))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    </div>
                </div>
                {/* Quick Actions */}
                   <div className="mt-8 bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            onClick={() => navigate('/goals')}
                            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                        >
                            <FaBullseye className="text-red-600 text-xl mr-3" />
                            <span className="font-medium text-gray-700">Add New Goal</span>
                        </button>
                        <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
                            <FaPiggyBank className="text-green-600 text-xl mr-3" />
                            <span onClick = {() => navigate ('/Savings')} role="button" className="font-medium text-gray-700">Add Savings</span>
                        </button>
                        <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
                            <FaDollarSign className="text-purple-600 text-xl mr-3" />
                            <span onClick = {() => navigate ('/Expenses')} role="button"className="font-medium text-gray-700">View Expenses</span>
                        </button>
                    </div>
                </div>
             {/* main page container below */}
            </div>
        </div>
    );
}
export default Dashboard