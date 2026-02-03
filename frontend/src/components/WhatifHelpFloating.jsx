import React, { useState } from "react";
import { FaCalendarAlt, FaSlidersH, FaChartLine, FaSave, FaPlus, FaQuestionCircle, FaTimes } from "react-icons/fa";

export default function WhatifHelpFloating() {
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-1/2 right-4 transform -translate-y-1/2 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg 
                hover:bg-blue-700 transition-colors"
                title="Show Help">
                <FaQuestionCircle className="text-3xl" /><p className="text-white text-xs">Need</p> <p className="text-white text-xs">Help?</p>
            </button>
        );
    }

    return (
        <div className="fixed top-4 right-4 z-50 w-80 bg-white border rounded shadow-lg max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-3">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Quick Guide</h3>
                        <p className="text-gray-600 text-xs">Scenario planning steps</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                    <FaTimes className="text-sm" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Step 1 */}
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaCalendarAlt className="text-blue-600 text-sm" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">Step 1: Choose Your Month</h4>
                        <p className="text-gray-600 text-xs mb-2">Select which month's expense data you want to experiment with from the dropdown menu.</p>
                        <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Tip: Start with your most recent month to see current spending patterns
                        </div>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaSlidersH className="text-green-600 text-sm" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">Step 2: Adjust Your Spending</h4>
                        <p className="text-gray-600 text-xs mb-2">Use the sliders to increase or decrease spending in each expense category. Watch the summary update in real-time!</p>
                        <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        Tip: Drag sliders left to save money, right to spend more
                        </div>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <FaChartLine className="text-purple-600 text-sm" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">Step 3: Review Your Impact</h4>
                        <p className="text-gray-600 text-xs mb-2">The scenario summary shows how your adjustments affect your remaining monthly amount. Green means savings, red means additional spending.</p>
                        <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        Tip: Check the chart to see visual representation of your changes
                        </div>
                    </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <FaSave className="text-orange-600 text-sm" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">Step 4: Save Your Scenario</h4>
                        <p className="text-gray-600 text-xs mb-2">Like what you see? Click 'Save Scenario' to store this plan for future reference and comparison.</p>
                    </div>
                </div>

                {/* Step 5 */}
                <div className="flex items-start space-x-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <FaPlus className="text-teal-600 text-sm" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">Step 5: Add Custom Categories (Optional)</h4>
                        <p className="text-gray-600 text-xs mb-2">Planning for future expenses? Click 'Add Category' to create temporary categories for upcoming spending.</p>
                    </div>
                </div>

                {/* Example Section */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">📊 Example</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>Goal:</strong> Save $200</p>
                        <p><strong>Action:</strong> Reduce dining out, entertainment</p>
                        <p><strong>Result:</strong> More money for vacation!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
