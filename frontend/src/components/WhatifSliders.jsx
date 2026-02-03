import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTimes, FaPlus } from "react-icons/fa";
import { PiExclamationMarkFill } from "react-icons/pi";




// pass all the data from WHatif jsx to the sliders
export default function WhatifSliders({categories,selectedMonth,availableMonths,adjustments,savings,
    isLoading,error, amountLeft, onMonthChange,onSliderChange, onAddCategoryClick, onDeleteCategory})  {
    // get savings per category as user moves sliders
    const getCategorySavings = (categoryId) => {
        const categoryData = savings.category_breakdown?.find(item => item.category_id === categoryId)
        return categoryData?.savings;
    }

    // Check if selected month is current month
    const isCurrentMonth = () => {
        if (!selectedMonth) return false;
        const today = new Date();
        const currentMonth = today.getMonth(); // 0-11
        const currentYear = today.getFullYear();
        
        // Check if selectedMonth contains current month and year
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonthName = monthNames[currentMonth];
        // Check both month and year is current
        return selectedMonth.includes(currentMonthName) && selectedMonth.includes(currentYear.toString());
    }

    return (
        
        <div className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-lime-900 to-lime-700 px-6 py-4">
                <h3 className="font-bold text-white">Step 1</h3>
                <div className ="pl-4">
                <li className="text-emerald-100 text-sm">Choose a month to experiment with</li>
                </div>

                <h3 className="font-bold text-white">Step 2</h3>
                <div className="pl-4">
                <li className="text-emerald-100 text-sm">Adjust the sliders to desired spending on expense category</li>
                <li className="text-emerald-100 text-sm">Add a hypothetical expense category to see the impact</li>
                </div>
            </div>
            
            <div className="p-4">
                  {/* Current Month Alert */}
            {isCurrentMonth() && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded mb-2 text-sm">
                    <p><strong>Note:</strong> This is the current month. Expense data may be ongoing.</p>
                </div>
            )}
                {/* Month Filter */}
                <div className="mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Month:
                        </label>
                        <select 
                            value={selectedMonth} 
                            onChange={onMonthChange}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        >
                            <option value="">Select a month</option>
                            {availableMonths.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </div>

                    {/* Add Category button */}
                    <div className="flex space-x-2">
                        <button
                        onClick={onAddCategoryClick}
                        disabled={!!error}
                        className={`px-3 py-2 rounded ${
                            error 
                                ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                                : 'bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold' 
                        }`}
                    >
                        <FaPlus className="inline mr-1  text-sm text-white" /> Add Category
                    </button>
                    </div>
                </div>
            </div>
            {/* <p className="text-gray-600 mb-2 text-sm">
                        Select a month above to see expense categories and adjust sliders.
            </p> */}
        
            {/* Error State */}
            {/* {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                </div>
            )} */}

             {/* Loading State */}
             {isLoading ? (
                 <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"> </div>
                    <span className="ml-3 text-gray-600">Loading charts</span>
                </div>
            ) : !categories || categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                    <PiExclamationMarkFill className="text-5xl text-gray-400 " />
                    <h3 className="text-md font-medium text-gray-900 mb-2">No expense or categories available</h3>
                    <p className="text-gray-500 text-center italic">
                        {selectedMonth && selectedMonth !== '' ? 
                            'No expense categories found for the selected month. Try selecting a different month or add some expenses first.' : 
                            'Please select a month to view expense categories or add some expenses first. '
                        }
                    </p>
                </div>
            ) : (
                <div>
                    <h3 className="text-lg font-semibold mb-2">
                        Categories for {selectedMonth}
                    </h3>
                    
                    {/* sliders for each category - scrollable container */}
                    <div className="max-h-96 overflow-y-auto pr-2">
                        {categories.map(category => (
                        <div key={category.category_id} className="mb-4 p-3 border rounded">
                            <div className="flex justify-between mb-2">
                                <span>{category.category_name}</span>
                                <div className="flex items-center space-x-2">
                                    <span>${adjustments[category.category_id] || (category.is_hypothetical ? 0 : category.original_amount)}</span>
                                    {category.is_hypothetical && onDeleteCategory && (
                                        <button
                                            onClick={() => onDeleteCategory(category.category_id)}
                                            className="text-red-600 hover:text-red-800 p-1 border border-2 text-sm rounded-lg bg-gray-200"
                                            title="Delete this hypothetical category"
                                        >
                                            <FaTimes className=" inline text-sm" /> 
                                        </button>
                                    )}
                                </div>
                            </div>
                            {/* if there is no FE/income, set hypothetical max range to $1000, min range at $0 */}
                            <input
                                type="range"
                                min="0"
                                max={category.is_hypothetical ? (amountLeft > 0 ? amountLeft : 1000) : category.original_amount * 2}
                                value={adjustments[category.category_id] || (category.is_hypothetical ? 0 : category.original_amount)}
                                onChange={(e) => onSliderChange(category.category_id, parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex flex-row">
                                <div className="text-xs text-gray-500 mt-1">
                                    $0 - ${category.is_hypothetical ? (amountLeft > 0 ? amountLeft : 1000).toFixed(0) : category.original_amount * 2}
                                </div>
                                <div className="flex justify-end flex-1">
                                    {getCategorySavings(category.category_id) > 0 ? (
                                        <div className="text-sm text-green-600 mt-1 text-right">
                                            <span>Save ${getCategorySavings(category.category_id).toFixed(2)} more in {selectedMonth}</span>
                                        </div>
                                    ) : getCategorySavings(category.category_id) < 0 ? (
                                        <div className="text-sm text-red-600 mt-1 text-right">
                                            <span>Spend ${Math.abs(getCategorySavings(category.category_id)).toFixed(2)} more in {selectedMonth}</span>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 mt-1 text-right">
                                            <span>No change in {selectedMonth}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}