import { useEffect, useState, useRef } from 'react';
import WhatifSliders from "./WhatifSliders";
import WhatIfChart from "./WhatifChart";
import axios from 'axios'; 
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { TbPigMoney, TbReload  } from "react-icons/tb";
import { FaTimes, FaRegListAlt} from 'react-icons/fa';
import SaveScenario from './SaveScenario';
import ScenarioList from './ScenarioList';
import AddWhatifCategory from './AddWhatifCat';
import WhatifHelpFloating from './WhatifHelpFloating';
import { useNavigate } from 'react-router-dom';


export default function Whatif({ amountLeft }) {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    
    // states - categories, adjustments, savings, loading, error
    const [categories, setCategories] = useState([]);
    const [adjustments, setAdjustments] = useState({});
    const [savings, setSavings] = useState({
        total_monthly_savings: 0,
        category_breakdown: []
    });
    const [hypotheticalAmount, setHypotheticalAmount] = useState (0)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    //multiple error types need to track them for different error messages
    const [errorType, setErrorType] = useState(null); 
    const [availableMonths, setAvailableMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [refreshScenarios, setRefreshScenarios] = useState(0);
    const [showAddWhatifCategory, setShowAddWhatifCategory] = useState(false);
    
    const navigate = useNavigate();
    
    // Function to go to profile section (same as Header.jsx)
    const goToProfileSection = (sectionId) => {
        navigate('/profile');
        setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    // Fetch available months when component mounts
    useEffect(() => {
        fetchAvailableMonths();
    }, [selectedMonth]);

    
   // Fetch categories when selectedMonth changes
    useEffect(() => {
        if (selectedMonth) {
            fetchExpenseCategory();
        }
    }, [selectedMonth]);

    // filtering for months
    const fetchAvailableMonths = async () => {
        try {
            setIsLoading(true);
            setError(null);
            setErrorType(null);
            const response = await axios.get(`${apiBaseUrl}/whatif/available_months`, {
                withCredentials: true
            });
            setAvailableMonths(response.data.available_months);
            // selects latest month as default
            if (response.data.available_months.length === 0) {
                // Set current month as default for new users
                const currentDate = new Date();
                const currentMonth = currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                });
                setSelectedMonth(currentMonth);
            } else if (!selectedMonth) {
                setSelectedMonth(response.data.available_months[0]);
            }
        } catch (error) {
            const errorData = error.response?.data;
            if (errorData?.error_profile) {
                setError(errorData.error_profile);
                setErrorType('profile');
            } else if (errorData?.error_expenses) {
                setError(errorData.error_expenses);
                setErrorType('expenses');
            } else {
                setError(errorData?.error || 'Failed to fetch available months');
                setErrorType(null);
            }
            console.error('Error fetching months:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // fetch expense category for display of current data onto sliders
    const fetchExpenseCategory = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await axios.get(`${apiBaseUrl}/whatif/expense_categories/${selectedMonth}`, {
                withCredentials: true
            });
            
            console.log('Categories response:', response.data);
            if (response.data.categories) {
                setCategories(response.data.categories);
                
                const initialAdjustments = {};
                response.data.categories.forEach(cat => {
                    initialAdjustments[cat.category_id] = cat.original_amount;
                });
                setAdjustments(initialAdjustments);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to fetch expense categories');
            console.error('Error fetching categories:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleMonthChange = (e) => {
        const newMonth = e.target.value;
        setSelectedMonth(newMonth);
        
        // when changing from months(eg. Jul to May), 
        // need to reset savings and adjustments for new month
        setSavings({
            total_monthly_savings: 0,
            category_breakdown: []
        });
        setAdjustments({});
        
        // Clear any pending changes
        pendingChangesRef.current = {};
        
        // Clear any active timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };

    //UseRef so the page doesnt render with each slider being moved.
    // for a better UI, lesser API calls 
    const timerRef = useRef(null);
    const pendingChangesRef = useRef({});
    // added useRef with a timer function so it will only have 1API call at the end of the timer
    // prevents lag, slow loading, multiple API calls and infinite renderings
    const handleSliderChange = async (categoryId, newAmount) => {
        // Update UI immediately for responsiveness
        const newAdjustments = { ...adjustments, [categoryId]: newAmount };
        setAdjustments(newAdjustments);
        // Store the adjustsment made within the set time and send it as a batch for API call 
        pendingChangesRef.current[categoryId] = newAmount;
        // if there is a slider change, timer resets
        // Clear previous timer and set new one
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            try {
                // keep a record of all pending changes of sliders
                const allAdjustments = { ...adjustments, ...pendingChangesRef.current };
                
                const response = await axios.post(`${apiBaseUrl}/whatif/adjust_preview`, {
                    month: selectedMonth,
                    adjustments: allAdjustments
                }, { withCredentials: true });
                
                console.log('from backend:', response.data);
                console.log('category breakdown:', response.data.category_breakdown);
                
                setSavings({
                    total_monthly_savings: response.data.total_monthly_savings,
                    category_breakdown: response.data.category_breakdown
                });
                setHypotheticalAmount ( response.data.hypothetical_remaining_amount)
                // Clear pending changes after successful API call
                pendingChangesRef.current = {};
            } catch (error) {
                setError(error.response?.data?.error || 'Failed to calculate savings');
                console.error('Error calculating savings:', error);
            }
        }, 500); // 500ms timer delay. send API call only after the timer goes out.
    };

    // handle reload of whole page
    const handleReload = () => {
        window.location.reload();
    }

    // Function to trigger scenario list refresh
    // This increments the refreshTrigger state, which causes ScenarioList to re-fetch scenarios
    const handleScenarioSaved = () => {
        setRefreshScenarios(prev => prev + 1);
    };

    // Function to handle when a new hypothetical category is added
    const handleHypotheticalCategoryAdded = () => {
        // Refresh categories to include the new hypothetical category
        if (selectedMonth) {
            fetchExpenseCategory();
        }
        setShowAddWhatifCategory(false);
    };

    // Function to handle deletion of hypothetical categories
    const handleDeleteHypotheticalCategory = async (categoryId) => {
        try {
            await axios.delete(`${apiBaseUrl}/whatif/delete_hypothetical_category`, {
                data: { category_id: categoryId },
                withCredentials: true
            });
            
            // Remove the category from UI so it doesnt appear immediately.
            setCategories(prevCategories => 
                prevCategories.filter(cat => cat.category_id !== categoryId)
            );
            
            // Resets the adjustments back to its original without the deleted hypothetical_cat
            setAdjustments(prevAdjustments => {
                const newAdjustments = { ...prevAdjustments };
                delete newAdjustments[categoryId];
                return newAdjustments;
            });
            // Refresh the expense categories to get updated data
            if (selectedMonth) {
                fetchExpenseCategory();
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to delete hypothetical category');
            console.error('Error deleting hypothetical category:', error);
        }
    };
        // for save scenario section
    const [showSaveScenario, setShowSaveScenario] = useState(false);
   
    return(
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-lime-900 to-lime-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Scenario Playground </h2>
                            <p className="text-blue-100 mt-1">Create your scenario, plan ahead and reach your goals</p>   
                        </div>
                        <div>
                        <button onClick={handleReload} 
                        className ="inline flex ml-auto w-24 sm:w-auto p-2 bg-blue-600 text-white text-md font-semibold
                                    rounded-md hover:bg-blue-500">
                                    <TbReload className= "mr-2 self-center font-medium text-lg"/>Reset scenario</button>
                        </div>
                    </div>
                </div>
                </div>  
                
                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 sm:px-4 lg:px-6 xl:px-8">
                        <p className="text-sm font-medium text-red-800">
                            {error}
                            {errorType === 'profile' && (
                                <> <button onClick={() => goToProfileSection('income-section')} 
                                className="text-blue-600 underline hover:text-blue-800 font-semibold">Add Income</button> or 
                                <button onClick={() => goToProfileSection('fixed-expenses-section')} 
                                className="text-blue-600 underline hover:text-blue-800 font-semibold">Add Fixed Expenses</button></>
                            )}
                            {errorType === 'expenses' && (
                                <> <button onClick={() => navigate('/expenses')} 
                                className="text-blue-600 underline hover:text-blue-800 font-semibold">Add Expenses</button></>
                            )}
                        </p>
                    </div>
                )}
                
                {/* Floating Help Button */}
                <WhatifHelpFloating />
                
                {/* Sliders and Scenario Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Whatif Sliders */}
                    <div className="lg:col-span-2">
                        <WhatifSliders 
                            categories={categories}
                            selectedMonth={selectedMonth}
                            availableMonths={availableMonths}
                            adjustments={adjustments}
                            savings={savings}
                            isLoading={isLoading}
                            error={error}
                            amountLeft={amountLeft}
                            onMonthChange={handleMonthChange}
                            onSliderChange={handleSliderChange}
                            onAddCategoryClick={() => setShowAddWhatifCategory(true)}
                            onDeleteCategory={handleDeleteHypotheticalCategory}
                        />
                    </div>
                    
                    {/* Scenario Summary */}
                    <div className="lg:col-span-1 bg-white shadow-xl rounded-xl overflow-hidden flex flex-col">
                        {/* Summary Header */}
                        <div className="bg-gradient-to-r from-lime-900 to-lime-700 px-4 py-3 flex-shrink-0">
                            {/* <div className="flex items-center space-x-2">
                                <div className="p-1.5 bg-white/20 rounded-lg">
                                    <TbPigMoney className="text-white text-lg" />
                                </div>
                                <div> */}
                                    <h3 className="font-bold text-white">Step 3</h3>
                                        <p className="text-emerald-100 text-sm font-semibold mb-2">Based on your adjustments, the summary shows: </p>
                                        <div className ="pl-4">
                                            <li className="text-emerald-100 text-sm">Did you save more/less for the month ?</li>
                                            <li className="text-emerald-100 text-sm">Amount remaining for the month selected</li>
                                            <li className="text-emerald-100 text-sm">Category breakdown of your adjusted expenses</li>
                                        </div>
                                {/* </div> */}
                            {/* </div> */}
                        </div>

                        {/* Summary Content */}

                        <div className="p-4 overflow-y-auto flex-1">
                            <p className="text-gray-800 text-md font-semibold mb-4">Analysis for {selectedMonth}</p>

                            {/* Main Result */}
                            <div className="mb-4">
                                {savings.total_monthly_savings > 0 ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-1.5 bg-green-100 rounded-full">
                                                <GiReceiveMoney className="text-green-600 text-lg" />
                                            </div>
                                            <div>
                                                <p className="text-green-800 font-semibold text-base">
                                                Save ${Number(savings.total_monthly_savings).toFixed(2)}!
                                                </p>
                                                <p className="text-green-600 text-xs">
                                                Great job! Your adjustments help reach goals faster.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : savings.total_monthly_savings < 0 ? (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-1.5 bg-red-100 rounded-full">
                                                <GiPayMoney className="text-red-600 text-lg" />
                                            </div>
                                            <div>
                                                <p className="text-red-800 font-semibold text-base">
                                                Additional spending: ${Math.abs(savings.total_monthly_savings).toFixed(2)}
                                                </p>
                                                <p className="text-red-600 text-xs">
                                                Consider adjusting expenses to stay within budget.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-1.5 bg-gray-200 rounded-full">
                                                <TbPigMoney className="text-gray-500 text-lg" />
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-semibold text-base">
                                                    No changes to spending
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                    Adjust sliders to see financial impact.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Amount remaining */}
                            <div className="mb-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                                    <h3 className="text-gray-700 font-semibold mb-2 text-xs uppercase tracking-wide">Amount remaining:</h3>
                                    {savings.category_breakdown.length > 0 ? (
                                        <p className="text-sm text-blue-600">${parseFloat(hypotheticalAmount).toFixed(2)} remaining for the month.</p>
                                    ) : (
                                        <p className="text-sm text-gray-500">Adjust sliders to view amount</p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Category Breakdown */}
                            <div>
                                <h4 className="text-gray-700 font-semibold mb-2 text-xs uppercase tracking-wide">
                                    Category Breakdown
                                </h4>
                                <div className="space-y-1">
                                    {savings.category_breakdown
                                        .filter(category => category.savings !== 0)
                                        .map((category, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                <span className="text-gray-700 font-medium text-sm">{category.category_name}</span>
                                                <span className={`font-semibold text-sm ${category.savings > 0 ? 'text-green-600': 'text-red-600'}`}>
                                                    {category.savings > 0 ? '+' : ''} ${Number(category.savings).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    {savings.category_breakdown.filter(category => category.savings !== 0).length === 0 && (
                                        <div className="text-center py-3 text-gray-500">
                                            <p className="text-sm">No adjustments made yet. Use sliders to see impact!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Chart Section - Moved below sliders */}
                <div className="mb-6">
                    <WhatIfChart 
                        categories={categories}
                        selectedMonth={selectedMonth}
                        savings={savings}
                        adjustments={adjustments}
                        isLoading={isLoading}
                        error={error}
                        onSaveClick={() => setShowSaveScenario(true)}
                    />
                </div>
                
                {/* Saved Scenarios */}
                <div className="mb-6">
                    <ScenarioList refreshTrigger={refreshScenarios} />
                </div>

                     {/* add scenario component */}

                     {showSaveScenario && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                             <button 
                                onClick={() => setShowSaveScenario(false)}
                                className="  block ml-auto w-24 sm:w-auto p-2 bg-gray-500 text-white 
                                rounded-md hover:bg-gray-600"
                            >
                                <FaTimes />
                            </button>
                            <SaveScenario 
                                category_breakdown={savings.category_breakdown}
                                total_monthly_savings={savings.total_monthly_savings}
                                selectedMonth={selectedMonth}
                                onClose ={ () => setShowSaveScenario(false)}
                                onScenarioSaved={handleScenarioSaved}
                            />
                           
                        </div>
                    </div>
                        )}

                    {/* Add Category  */}
                    {showAddWhatifCategory && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                                <button 
                                    onClick={() => setShowAddWhatifCategory(false)}
                                    className="block ml-auto w-24 sm:w-auto p-2 bg-gray-500 text-white 
                                    rounded-md hover:bg-gray-600"
                                >
                                    <FaTimes />
                                </button>
                                <AddWhatifCategory 
                                    onSave={handleHypotheticalCategoryAdded}
                                    onClose={() => setShowAddWhatifCategory(false)}
                                />
                            </div>
                        </div>
                    )}
            </div>
        </div>
    )
}