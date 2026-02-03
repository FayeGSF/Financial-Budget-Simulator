// import the expense chart 
// make chart respond to the sliders 
// 1. chart shows original expense by category per month 
// a. need to have data and month, 
// 2. chart changes as slider gets adjusted 
import { PiExclamationMarkFill } from "react-icons/pi";
import { MdOutlineSaveAlt } from "react-icons/md";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);


export default function WhatIfChart ({ categories, savings, selectedMonth, isLoading, error, onSaveClick }) {
// chart data - now received from parent component
    const barBGColor= [  
        // 'rgba(255, 99, 132, 0.8)' 
        'rgba(54, 162, 235, 0.8)' 
        // 'rgba(255, 206, 86, 0.8)',  
        // 'rgba(75, 192, 192, 0.8)', 
        // 'rgba(153, 102, 255, 0.8)',
        // 'rgba(255, 159, 64, 0.8)', 
        // 'rgba(255, 99, 132, 0.8)',  
        // 'rgba(201, 203, 207, 0.8)'  
    ]

    // Use categories data directly from parent component
    // No need for separate API call since data is already available
//  using the monthlyExpence category cat_id matach savings.category_breakdown cat_id
// then check if there is a new_amount !== 0 or undefined., return the new_amount value into the chart
// else original amount.
    const barData = () => {
        if (!categories || categories.length === 0) {
            return [];
        }
        return categories.map((expense, index) => {
            // Find the matching category in category_breakdown
            const breakdown = savings.category_breakdown.find(item => item.category_id === expense.category_id);
            
            // If there's a match AND there's a new_amount, return the new_amount
            if (breakdown && breakdown.new_amount !== undefined) {
                return breakdown.new_amount;
            } else {
                // Otherwise return the original amount
                return expense.original_amount;
            }
        });
    }

    // make the Y axis responive for smaller spendings
    // using the max data plus 20% so it scales according to the data
    function yAxis () {
        if (!categories || categories.length === 0) {
            return 1000; // Default value when no data
        }
        const originalAmounts = categories.map(expense => expense.original_amount);
        const adjustedAmount = barData();
        const originalMax = Math.max(...originalAmounts);
        const adjustedMax = Math.max(...adjustedAmount);
    
        // Compare and use the higher amount
        const higherAmount = Math.max(originalMax, adjustedMax);
        return Math.ceil(higherAmount * 1.2);
        }
    
    // define the chart 
    const chartData = {
        labels: categories && categories.length > 0 ? categories.map(expense => expense.category_name) : [],
        // 2 bars - 1 for original , 1 for adjusted to show the difference (visual)
        datasets: [{
            // For Orginal amount
            label: 'Original Amount',
            data: categories && categories.length > 0 ? categories.map(expense => expense.original_amount) : [],
            backgroundColor: 'rgba(197, 198, 200, 0.8)',
            borderRadius:4,
            categoryPercentage: 0.8,
            barPercentage: 0.8,
            },{ 
            //For  Adjusted amount
                // define the X axis dataset for adjusted
                label: 'Adjusted Amount',
                // if there is a new_amount, reflect that else the original
                data: barData (),
                // cycle through the barBGCOlor if user has more than 7 categories per month
                backgroundColor: categories && categories.length > 0 ? categories.map((_, index) => barBGColor[index % barBGColor.length]) : [],
                borderRadius: 4,
                categoryPercentage: 0.8,
                barPercentage: 0.8,            
            }]   
        }
      // chart options
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 0,      
                bottom: 0,   
                left: 0,     
                right: 0   
            }
        },
        plugins: {
            title: {display: true,
                text: `Expenses by Category - ${selectedMonth}`,
                font: {
                    size: 16,
                    weight: 'bold'
                }},
                datalabels :{
                    color:function(context){
                        return context.datasetIndex === 0? 'black' : 'blue';
                    },
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => '$' + value,
                    font:{ size: 10 },
                    offset: function(context) {
                        // Original Amount datasetindex 0 - smaller offset
                        // Adjusted Amount datasetindex 1 - larger offset
                        return context.datasetIndex === 0 ? 6 : 20;
                    }
                },
            legend: {display: true }
        },
        scales: {
            y: {
                display: false,
                max: yAxis()
            },
            x: {grid: {display: false}}
        }
    }


    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-lime-900 to-lime-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">Step 4</h3>
                        <div className ="pl-4">
                        <li className="text-emerald-100 text-sm">Below is a visual comparison of original vs adjusted expenses</li>
                        <li className="text-emerald-100 text-sm">Like the scenario? Click 'Save Scenario' to store it for future reference</li>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={onSaveClick}
                            disabled={!!error}
                            className={`px-4 py-2 rounded ${
                                error 
                                    ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold' 
                            }`}
                        >
                            <MdOutlineSaveAlt className="inline mr-2 text-lg text-white" /> Save Scenario
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="p-6">
            {isLoading ? (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"> </div>
                <span className="ml-3 text-gray-600">Loading charts</span>
            </div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                 <PiExclamationMarkFill className="text-5xl text-gray-400 " />
                <h3 className="text-md font-medium text-gray-900 mb-2">Chart is unavailable</h3>
            </div>
        ) : !categories || categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-2">No expense data available</h3>
                <p className="text-gray-500 text-center italic">
                    {selectedMonth && selectedMonth !== '' ? 
                        'No expense data found for the selected month. Try selecting a different month or add some expenses first.' : 
                        'Please select a month to view expense data.'
                    }
                </p>
            </div>
        ) : (
            <div className='h-96'>
                <Bar data={chartData} options={chartOptions} />
            </div>
            ) }
            </div>
        </div>
    )
}