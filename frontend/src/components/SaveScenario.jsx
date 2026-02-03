// add simulation
// addform structure - name of scenario, goal_id (optional)

import { useState } from "react";
import axios from 'axios';

// should also send information to backend to WhatifAdj table
// * this should be after the scenario has been created
    // adjustmnet amt
    // original amt
    // category_id
    // scenario _id 
    // notes will be set defined string from backend.
// once scenario is saved, it needs to trigger the scenario list to refresh
export default function SaveScenario({ category_breakdown, total_monthly_savings, 
    selectedMonth, onClose, onScenarioSaved }) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [scenarioName, setScenarioName] = useState('');

    // function to handle saveScenario
    const handleSaveScenario = async (e) => {
        e.preventDefault();
        
        if (!scenarioName.trim()) {
            setError('Scenario name is required');
            return;
        }

        if (!category_breakdown || category_breakdown.length === 0) {
            setError('No adjustments to save. Please adjust the sliders first.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccessMessage('');
            
            const response = await axios.post(`${apiBaseUrl}/whatif/save_scenario`, {
                scenario_name: scenarioName,
                category_breakdown: category_breakdown,
                total_monthly_savings: total_monthly_savings,
                goal_id: null
            }, {
                withCredentials: true
            });
            
            if (response.status === 201) {
                setSuccessMessage('Scenario saved successfully!');
                setScenarioName('');
                
                // Call the callback to refresh the scenario list
                if (onScenarioSaved) {
                    onScenarioSaved();
                }
                
                // Close the popup after successful save
                setTimeout(() => {
                    onClose();
                }, 2000);

            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save scenario');
            console.error('Error saving scenario:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-4 mt-4 ">
            {/* success and error message section */}
            {successMessage && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
            )}

            {/* main add scenario form section */}
            <form onSubmit={handleSaveScenario}>
                <div className="mb-4 text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Scenario Name
                    </label>
                    <input 
                        type="text"
                        value={scenarioName}
                        onChange={(e) => setScenarioName(e.target.value)}
                        className="w-full px-2 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Enter a Scenario name"
                        required
                    />
                </div>
                
                <button 
                type="submit"
                className="text-white mx-auto block w-full sm:w-auto px-2 py-2 
                border border-transparent rounded-md bg-blue-600 hover:bg-blue-700">
                    Save Scenario
                </button>
            </form>

            {/* Display summary of what will be saved */}
            {category_breakdown && category_breakdown.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Summary:</h4>
                    <p className="text-sm text-gray-600">
                        Monthly savings: ${total_monthly_savings?.toFixed(2) || '0.00'}
                    </p>
                </div>
            )}
        </div>
    );
}