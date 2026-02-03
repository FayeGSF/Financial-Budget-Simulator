// plugins for chartjs 
// bar elements (BarElement)
// axis (CategoryScale),(LinearScale)
// tooltip when users hover over the bar (Tooltip)
// legend to show the category names (Legend)
// title to show the total expenses (Title)
// responsive design
// animation when user changes the month (low)
import axios from 'axios';
import { useEffect, useState } from 'react';
import {FaArrowUp, FaArrowDown} from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

// used props from expenses.jsx here, less fetching data from backend
export default function ChartExpense({ monthly_expenses, selectedMonth, refreshChart, amountLeft }) { 

    // fetch expense by monthly category
    const [monthlyExpenseCategory, setMonthlyExpenseCategory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const barBGColor= [  'rgba(255, 99, 132, 0.8)', 
        'rgba(54, 162, 235, 0.8)', 
        'rgba(255, 206, 86, 0.8)',  
        'rgba(75, 192, 192, 0.8)', 
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)', 
        'rgba(255, 99, 132, 0.8)',  
        'rgba(201, 203, 207, 0.8)'  
    ]

    const apiBaseUrl = process.env.REACT_APP_API_URL;
    
// fetch the backend expenses by month and category 
    const fetchMonthlyExpenseCategory = async () => {
        try{
            setIsLoading(true);
            setError(null);
            
            // 2 urls needed 
            // 1. if user filters by month then use from charts.py, monthly_category_expenses
            // 2. if user doesnt filter, use the other query in charts.py without the month params
            const response = await axios.get(
                selectedMonth && selectedMonth !== '' 
                    ? `${apiBaseUrl}/charts/monthly_category_expenses?month=${selectedMonth}`
                    : `${apiBaseUrl}/charts/monthly_category_expenses`,
                { withCredentials: true }
            );
            console.log('response', response.data.monthly_category_expenses);
            setMonthlyExpenseCategory(response.data.monthly_category_expenses);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching monthly category expenses:', error);
            setError(error.message);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchMonthlyExpenseCategory();
        fetchTotalExpenses();
        fetchMonthlyDifference();
    }, [selectedMonth, refreshChart]);
    
    // define data for the chart
    // X axis (category names) 
    // Y axis (amount)
    // define options for the chart :
    // responsive design,legend, tooltip,title
    const chartData = {
        labels: monthlyExpenseCategory.map(expense => expense.cat_name),
        datasets: [
            { 
                // define the X axis dataset
                label: 'Amount',
                data:monthlyExpenseCategory.map(expense => expense.total_amount),
                // cycle through the barBGCOlor if user has more than 7 categories per month
                backgroundColor: monthlyExpenseCategory.map((_, index) => barBGColor[index % barBGColor.length])
                ,borderRadius: 4
            },
        ]
    }

    function yAxis () {
        const amountMax = monthlyExpenseCategory.map(expense => expense.total_amount);
        const axisMax = Math.max(...amountMax);
        return Math.ceil(axisMax * 1.2);
    }

    // chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {display: true,
                text: selectedMonth && selectedMonth !== '' 
                    ? `Expenses by Category - ${selectedMonth}`
                    : 'Expenses by Category - All months',
                font: {
                    size: 16,
                    weight: 'bold'
                }  },
                datalabels :{
                   
                    color: function (context){
                        return context.dataIndex % 2 === 0? 'black' :'blue';
                    },
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => '$' + value,
                    font:{ size: 10 },
                    offset: function(context) {
                        // Alternate offset for every other data label, prevent overlap
                        return context.dataIndex % 2 === 0 ? 6 : 24;
                    }
                },
            legend: {
                display: false,
            }
        },
        scales: {
            y: {
                display: false,
                max: yAxis()
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }

    // card components to show total expenses 
    const [totalExpenses, setTotalExpenses] = useState([]);
    // if no months select, show the avg of all the month's expenses.total_amt is in string so need parsefloat
    const calculateAverageExpenses = () => {
        if (!selectedMonth || selectedMonth === '') {
            if (totalExpenses && totalExpenses.length > 0) {
                const totalAmount = totalExpenses.reduce((sum, month) => {
                    const amount = parseFloat(month.total_amt) || 0;
                    return sum + amount;
                }, 0);
                return totalAmount / totalExpenses.length;
            }
        }
        return 0;
    };
    
    const totalAvgExp = calculateAverageExpenses();
    
    const fetchTotalExpenses = async () => {
        try{
            setIsLoading(true);
            setError(null);
            
            // 2 urls needed 
            // 1. if user filters by month then use from charts.py, total_monthly_expenses
            // 2. if user doesnt filter, use the other query in charts.py without the month params
            const response = await axios.get(
                selectedMonth && selectedMonth !== '' 
                    ? `${apiBaseUrl}/charts/total_monthly_expenses?month=${selectedMonth}`
                    : `${apiBaseUrl}/charts/total_monthly_expenses`,
                { withCredentials: true }
            );
            console.log('Total monthly expenses:', response.data.total_monthly_expenses);
            console.log('Monthly difference:', response.data.monthly_difference);
            setTotalExpenses(response.data.total_monthly_expenses || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching total monthly expenses:', error);
            setError(error.message);
            setIsLoading(false);
        }
    }
// card component to show monthly difference
    const [monthlyDifference, setMonthlyDifference] = useState([]);
    const fetchMonthlyDifference = async () => {
        try{
            setIsLoading(true);
            setError(null);
            const response= await axios.get(
                selectedMonth && selectedMonth !== '' 
                    ? `${apiBaseUrl}/charts/monthly_expense_difference?month=${selectedMonth}`
                    : `${apiBaseUrl}/charts/monthly_expense_difference`,
                { withCredentials: true }
            ) 
            console.log('Monthly difference:', response.data.monthly_difference);
            setMonthlyDifference(response.data.monthly_difference || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching monthly difference:', error);
            setError(error.message);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    }
    return(
        <div className='flex flex-col lg:flex-row gap-6'>
            {/* Chart Container */}
            <div className='flex-1 lg:w-3/4 chart-container'>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading chart...</span>
                    </div>
                ) : error ? (
                    <div className="text-red-600 text-center py-8">Error loading chart: {error}</div>
                ) : monthlyExpenseCategory.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No data available for the selected period</div>
                ) : (
                    <div className='h-96 mb-4' >
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                )}
            </div>

            {/* right side Cards  */}
            <div className='flex flex-col sm:flex-row lg:flex-col gap-4 w-full lg:w-1/4'>
                {/* Card 1 */}
                <div className='bg-white rounded-lg shadow-md p-4 border border-gray-200 text-center'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                        {selectedMonth && selectedMonth !== '' ? 'Total Expenses' : 'Average Expenses'}
                    </h3>
                    <div className='text-3xl font-bold text-blue-600'>
                        $ {selectedMonth && selectedMonth !== '' 
                            ? (parseFloat(totalExpenses[0]?.total_amt) || 0).toFixed(2)
                            : totalAvgExp.toFixed(2)
                        }
                    </div>
                    <p className='text-sm text-gray-600 mt-2'>
                        {selectedMonth && selectedMonth !== '' ? `For ${selectedMonth}` : 'Monthly Average'}
                    </p>
                </div>

                {/* Card 2 */}
                {/* if amount is more than 0 - show red, if amount is less than 0, show green */}
                <div className='bg-white rounded-lg shadow-md p-4 border border-gray-200 text-center'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-3'>Expense Compared to Last Month</h3>
                    <div className={`text-xl font-bold ${monthlyDifference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {/* typeof as a security, in case it comes back as a string */}
                        {typeof monthlyDifference === 'number' 
                            ? `$${Math.abs(monthlyDifference).toFixed(2)}`
                            : <span className='text-gray-500'>{monthlyDifference || 'N/A'}</span>
                        }
                    </div>
                    <p className='text-sm text-gray-600 mt-2'>
                        {typeof monthlyDifference === 'number' 
                            ? (monthlyDifference >= 0 ? (
                                <>
                                    <FaArrowUp className='inline-block mr-1 text-red-600 size-4' />
                                    <span className='text-red-600'>Increase in spending</span>
                                </>
                            ) : (
                                <>
                                    <FaArrowDown className='inline-block mr-1 text-green-600 size-4' />
                                    <span className='text-green-600'>Decrease in spending</span>
                                </>
                            ))
                            : 'No comparison available'
                        }
                    </p>
                </div>
                {/* Card 3 - Remaining Amount */}
                <div className='bg-white rounded-lg shadow-md p-4 border border-gray-200 text-center'>
                    <h3 className='text-lg font-semibold text-gray-800 mb-3'>
                        {amountLeft >= 0 ? 'Remaining Budget' : 'Overspent'}
                    </h3>
                    <div className={`text-2xl font-bold ${amountLeft >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(amountLeft || 0).toFixed(2)}
                    </div>
                    <p className='text-sm text-gray-600 mt-2'>
                        {selectedMonth && selectedMonth !== '' ? ` for ${selectedMonth}` : ' this month'}
                    </p>
                </div>
            </div>
        </div>
    )
}



