// display saved scenarios with short summary of savings for that scenario, categories adjusted. 
//  include delete function for scenario here. 

import { useEffect, useState } from 'react';
import axios from 'axios';
import {  FaRegSave, FaTrash } from 'react-icons/fa';


export default function ScenarioList({ refreshTrigger }) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const [scenarios, setScenarios] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [expandedAdjustments, setExpandedAdjustments] = useState(new Set());
    const [successMessage, setSuccessMessage] = useState(null);
    useEffect(() => {
        fetchScenarios();
    }, [refreshTrigger]); // Re-fetch scenarios when refreshTrigger changes

    const fetchScenarios = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await axios.get(`${apiBaseUrl}/whatif/get_scenario`, {
                withCredentials: true
            });
            console.log ('List of Scenarios:' , response.data)
            setScenarios(response.data.scenarios || []);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to fetch saved scenarios');
            console.error('Error fetching scenarios:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-NZ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-NZ', {
            style: 'currency',
            currency: 'NZD'
        }).format(amount);
    };

  // delete scenario

    const handleDeleteScenario = async (scenario_id) => {
        try{
        const response = await axios.delete (`${apiBaseUrl}/whatif/delete_scenario`, {
            withCredentials: true,
            data: { scenario_id: scenario_id }
        })
        if (response.status === 200){
            setSuccessMessage('Scenario deleted successfully');
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
            fetchScenarios();
        } else {
            setError(response.data.error);
        }
        } catch (error) {
            setError(error.response?.data?.error || 'An error occurred');
            setTimeout(() => {
                setError(null);
            }, 5000);
        } finally {
            setIsLoading(false);
        }
    }


// show only the first 2 
// user can click show more to expand the list
    const getDisplayedScenarios = () => {
        if (showAll) {
            return scenarios;
        }
        return scenarios.slice(0, 2);
    };

    const hasMoreScenarios = scenarios.length > 2;

    const toggleAdjustments = (scenario_id) => {
        setExpandedAdjustments(prev => {
            const newSet = new Set(prev);
            // collapse and expand states
            newSet.has(scenario_id) ? newSet.delete(scenario_id) : newSet.add(scenario_id);
            return newSet;
        });
    };

  

    if (isLoading) {
        return (
            <div className="bg-white shadow-xl rounded-xl overflow-hidden flex flex-col h-[28rem]">
                <div className="bg-gradient-to-r from-lime-900 to-lime-700 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FaRegSave className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Saved Scenarios</h3>
                            <p className="text-indigo-100 text-sm">Your previous simulations</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading scenarios...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white shadow-xl rounded-xl overflow-hidden flex flex-col h-[28rem]">
                <div className="bg-gradient-to-r from-lime-900 to-lime-700 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FaRegSave className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Saved Scenarios</h3>
                            <p className="text-indigo-100 text-sm">Your previous simulations</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500 mb-2">Error loading scenarios</p>
                        <p className="text-gray-500 text-sm">{error}</p>
                        <button 
                            onClick={fetchScenarios}
                            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden flex flex-col h-[28rem]">
            {/* Header */}
            <div className="bg-gradient-to-r from-lime-900 to-lime-700 px-6 py-4 flex-shrink-0">
                <div >
                    {/* <div className="p-2 bg-white/20 rounded-lg">
                        <FaRegSave className="text-white text-xl" />
                    </div> */}
                    
                   
                        <h3 className=" font-bold text-white">Step 5</h3>
                        <div className ="pl-4">
                            <li className="text-indigo-100 text-sm">View your saved simulations here</li>
                            <li className="text-indigo-100 text-sm">Delete any scenario you no longer need</li>
                        </div>
                    
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
                {scenarios.length === 0 ? (
                    <div className="text-center py-8">
                        <FaRegSave className="text-gray-300 text-4xl mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No saved scenarios yet</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Create and save scenarios to see them here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {getDisplayedScenarios().map((scenario) => (
                            <div key={scenario.scenario_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 text-lg">
                                            {scenario.name}
                                        </h4>
                                        {/* Total Saved Amount */}
                                        {scenario.total_saved_amount !== 0 && (
                                        <div className="mt-1">
                                            <span
                                            className={`text-sm font-medium ${
                                                scenario.total_saved_amount > 0 ? "text-green-600" : "text-red-600"
                                            }`}
                                            >
                                            Projected savings: {formatCurrency(scenario.total_saved_amount)}
                                            </span>
                                            <span className=" flex text-xs text-gray-500 mr-2">Created: {scenario.date}</span>
                                        </div>
                                        )}
                                    </div>
                                    <div className="flex">
                                   
                                    <button 
                                    onClick={() => handleDeleteScenario(scenario.scenario_id)}
                                    
                                    className="inline-flex items-center px-3 py-1 rounded-md border border-gray-300
                                         text-sm font-medium text-red-600 bg-white hover:bg-gray-50">
                                    <FaTrash className="inline mr-1" /> Delete
                                    </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                    {/* Adjustments Section */}
                                    {scenario.adjustments && scenario.adjustments.length > 0 && (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                            <button
                                                onClick={() => toggleAdjustments(scenario.scenario_id)}
                                                className="flex items-center w-full text-left hover:bg-gray-100 p-2 rounded transition-colors"
                                            >
                                                <FaRegSave className="mr-2 text-gray-600" />
                                                <span className="font-medium text-gray-700">
                                                    {expandedAdjustments.has(scenario.scenario_id) ? 'Hide' : 'Show'} Adjustments
                                                </span>
                                                <span className="ml-auto text-gray-500">
                                                    {expandedAdjustments.has(scenario.scenario_id) ? '▼' : '▶'}
                                                </span>
                                            </button>
                                            
                                            {expandedAdjustments.has(scenario.scenario_id) && (
                                                <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
                                                    {scenario.adjustments.map((adjustment, adjIndex) => (
                                                        adjustment.saving_amount !== 0 && (
                                                            <div key={adjIndex} className="text-xs">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-gray-600 font-medium">
                                                                        {adjustment.category_name}
                                                                    </span>
                                                                    {adjustment.saving_amount !== 0 && (
                                                                        <span className={`font-medium ${adjustment.saving_amount > 0 ? "text-green-600" : "text-red-600"}`}>
                                                                            {formatCurrency(adjustment.saving_amount)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-gray-500 text-xs italic">
                                                                    {adjustment.note}
                                                                </p>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {(!scenario.adjustments || scenario.adjustments.length === 0) && (
                                        <div className="text-gray-500 text-xs italic">
                                            No adjustments recorded
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {/* Show More/Less Button */}
                        {hasMoreScenarios && (
                            <div className="text-center pt-2">
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
                                >
                                    {showAll ? 'Show Less' : `Show ${scenarios.length - 2} More`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
