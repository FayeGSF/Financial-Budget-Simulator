# Rule- based logic

# 1. check if expense exceed income
#- notify user that it exceeds
# awareness threshold: 
#- notify users if amount remaining is only 100 dollars left
#- if amount remaining to spend is only 200 dollars left
# -if amount remaining to spend is only 50 dollars left
#- if amount left is >20% of income saved - congratulate users on job well done.

# 2. check if user has saved this month
# - if no : recommend saving eg. $x/month to stay on track with timeline  (remaining amount / #months left to target_date)
# - if yes : congratulate user, tell them if they are on track to achieving their goal at target_date 

# 3. check the top 5 expenditure of the expenses
# - if single expense category takes up >10% of total expenditure (minus fixed expenses) recommend decreasing...
# - if single expense category takes up >20% of total exependiture (minus fixed expenses) recommend decreasing...
# HABITS
# 4. check weekend spendings 
# - if >20% of spending happens Fri-Sun -> alert user of this habit and suggest setting budget or putting aside some savings prior to weekend

import db
from . import utils
from .whatif import income_convert, fixedexpenses_convert
from datetime import datetime, timedelta
import math


# function for tip rule #1 check expense exceed income
def analyze_income_expenses (user_id):
    tips = []
    # get current month, user's income per month (from whatif.py), total FE per month (from whatif.py), total expenses per month (from utils)
    current_month =datetime.now().strftime ('%B-%Y')
    monthly_income= income_convert()
    monthly_fixed_expenses = fixedexpenses_convert()
    monthly_expenses_list = utils.total_expenses_by_month (user_id, current_month)
    
    # Extract the total amount from the list (should be a single item for current month)
    monthly_expenses = 0.0
    if monthly_expenses_list and len(monthly_expenses_list) > 0:
        monthly_expenses = float(monthly_expenses_list[0]['total_amt'] or 0)
    
    # if user has no income - don't generate income/expense tips for new users
    if monthly_income <= 0:
        return tips 
    
    remaining_amount = monthly_income -(monthly_fixed_expenses + monthly_expenses)

    if remaining_amount < 0:
        tips.append({
            'type':'income_expense',
            'priority':'urgent',
            'title': 'Overspending Alert',
            'message':f'Your expenses (${monthly_expenses + monthly_fixed_expenses:.2f}) exceed your income (${monthly_income:.2f}) by ${abs(remaining_amount):.2f}',
            'actionable_advice':'Consider reducing discretionary spending.'
            })
    elif remaining_amount <= 50:
        tips.append({
            'type': 'income_expense', 
            'priority': 'urgent',
            'title': 'Critical: Only $50 Left',
            'message': f'You have only ${remaining_amount:.2f} remaining this month',
            'actionable_advice': 'Avoid any non-essential purchases.'
        })
    elif remaining_amount <= 100:
        tips.append({
            'type': 'income_expense',
            'priority': 'warning', 
            'title': 'Low Budget Warning',
            'message': f'You have ${remaining_amount:.2f} remaining this month',
            'actionable_advice': 'Be cautious with spending and consider postponing non-essential purchases.'
        })
    elif remaining_amount <= 200:
        tips.append({
            'type': 'income_expense',
            'priority': 'suggestion',
            'title': 'Budget Alert',
            'message': f'You have ${remaining_amount:.2f} remaining this month',
            'actionable_advice': 'Monitor your spending closely for the rest of the month.'
        })
    elif remaining_amount > (monthly_income * 0.2):
        tips.append({
            'type': 'income_expense',
            'priority': 'congratulation',
            'title': 'Excellent Budgeting!',
            'message': f'Great job! You have ${remaining_amount:.2f} remaining ({(remaining_amount/monthly_income)*100:.1f}% of income)',
            'actionable_advice': 'Consider putting some of this surplus into your savings goals.'
        })
    
    return tips

# function for tip rule #2 analyze user's saving progress
def analyze_savings_progress (user_id):
    tips= []

    cursor = db.get_cursor()
    cursor.execute("""
        SELECT g.goal_id, g.description, g.amount as goal_amount, 
               COALESCE(SUM(s.amount), 0) as goal_saving, 
               g.target_date, g.created_at 
        FROM goals as g
        LEFT JOIN savings as s on s.goal_id = g.goal_id
        WHERE g.user_id = %s
        GROUP BY g.goal_id, g.description, g.amount, g.target_date, g.created_at
    """, (user_id,))
    
    goals = cursor.fetchall()
    for goal in goals:
        goal_amount = float(goal['goal_amount'])
        goal_saving = float(goal['goal_saving'])
        target_date = goal['target_date']
        formatted_target_date = target_date.strftime('%d-%b-%Y')
        if target_date:
            # Calculate timeline and required monthly savings
            today = datetime.now().date()
            target = datetime.strptime(str(target_date), '%Y-%m-%d').date()
            months_remaining = max(1, ((target.year - today.year) * 12) + (target.month - today.month))
            
            remaining_amount = goal_amount - goal_saving
            required_monthly = remaining_amount / months_remaining
            
            if required_monthly > 0:
                tips.append({
                    'type': 'savings_progress',
                    'priority': 'suggestion',
                    'title': f'{goal["description"]} Goal',
                    'message': f'To reach your ${goal_amount:.2f} goal by {formatted_target_date}, save ${required_monthly:.2f}/month',
                    'actionable_advice': f'You have ${goal_saving:.2f} saved. Need ${remaining_amount:.2f} more in {months_remaining} months.'
                })
    
    return tips

# function for tip rule #3 analyze user's expense category 
def analyze_expense_categories (user_id):
    tips = []
    
    current_month = datetime.now().strftime('%B-%Y')
    category_expenses = utils.get_expenses_by_month_and_category(user_id, current_month)
    
    if not category_expenses:
        return tips
    
    # Calculate total expenses (excluding fixed expenses)
    total_expenses = sum(float(cat['total_amount']) for cat in category_expenses)
    print(total_expenses)
    # Check for large one-time expenses first
    monthly_income = income_convert()
    monthly_fixed_expenses = fixedexpenses_convert()
    large_expense_tips = analyze_large_one_time_expenses(user_id, current_month, monthly_income, monthly_fixed_expenses)
    tips.extend(large_expense_tips)
    
    for category in category_expenses[:5]:  # Top 5 categories
        category_name = category['cat_name']
        category_amount = float(category['total_amount'])
        percentage = (category_amount / total_expenses) * 100 if total_expenses > 0 else 0
        
        if percentage > 20:
            tips.append({
                'type': 'category_analysis',
                'priority': 'warning',
                'title': f'High Spending: {category_name}',
                'message': f'{category_name} accounts for {percentage:.1f}% of your expenses (${category_amount:.2f})',
                'actionable_advice': f'Consider reducing {category_name} spending to improve your budget balance.'
            })
        elif percentage > 10:
            tips.append({
                'type': 'category_analysis',
                'priority': 'suggestion',
                'title': f' Monitor: {category_name}',
                'message': f'{category_name} is {percentage:.1f}% of your expenses (${category_amount:.2f})',
                'actionable_advice': f'Keep an eye on {category_name} spending to ensure it stays within budget.'
            })
    
    return tips

#For large one-time expenses
def analyze_large_one_time_expenses(user_id, current_month, monthly_income, monthly_fixed_expenses):
    if monthly_income <= 0:
        return []
    
    cursor = db.get_cursor()
    
    # alert if expense occurs 1 time and is >25% of remaining amount to spend (income-FE)
    remaining_budget = monthly_income - monthly_fixed_expenses
    threshold = remaining_budget * 0.25
    
    # Find expenses > 25% of remaining budget that occur only once
    cursor.execute("""
        SELECT e.amount, e.description, e.date, c.cat_name,
               COUNT(*) as occurrence_count
        FROM expenses AS e
        LEFT JOIN categories AS c ON e.category_id = c.category_id
        WHERE e.user_id = %s 
        AND DATE_FORMAT(e.date, '%%M-%%Y') = %s
        AND e.amount > %s
        GROUP BY e.description, e.amount, e.date, c.cat_name
        HAVING occurrence_count = 1
        ORDER BY e.amount DESC
    """, (user_id, current_month, threshold))
    
    large_expenses = cursor.fetchall()
    
    return [{
        'type': 'large_one_time_expense',
        'priority': 'suggestion',
        'title': 'Large One-Time Purchase Detected',
        'message': f'You made a big purchase on {expense["date"].strftime("%d-%B")}: ${float(expense["amount"]):.2f} for {expense["description"]} ({(float(expense["amount"])/remaining_budget)*100:.1f}% of your remaining budget)',
        'actionable_advice': 'Consider if this was necessary. For future large expenses, try to plan ahead and save up to avoid impacting your monthly budget.'
    } for expense in large_expenses]

# function for tip rule #4 analyze user's weekend spending if it is >20%
def analyze_weekend_spending (user_id):
    tips = []
    
    cursor = db.get_cursor()
    current_month = datetime.now().strftime('%B-%Y')
    
    # weekend expenses 
    cursor.execute("""
        SELECT SUM(amount) as weekend_total
        FROM expenses 
        WHERE user_id = %s 
        AND DATE_FORMAT(date, '%%M-%%Y') = %s
        AND DAYOFWEEK(date) IN (5, 6, 7)
        
    """, (user_id, current_month,))
    
    weekend_result = cursor.fetchone()
    weekend_total = float(weekend_result['weekend_total'] or 0)
    
    # weekday expenses
    cursor.execute("""
        SELECT SUM(amount) as weekday_total
        FROM expenses 
        WHERE user_id = %s 
        AND DATE_FORMAT(date, '%%M-%%Y') = %s
        AND DAYOFWEEK(date) IN (1, 2, 3, 4)
    """, (user_id, current_month,))
    
    weekday_result = cursor.fetchone()
    weekday_total = float(weekday_result['weekday_total'] or 0)
    
    total_spending = weekend_total + weekday_total
    
    if total_spending > 0:
        weekend_percentage = (weekend_total / total_spending) * 100
        
        if weekend_percentage > 20:
            tips.append({
                'type': 'weekend_spending',
                'priority': 'suggestion',
                'title': 'Weekend Spending Pattern',
                'message': f'{weekend_percentage:.1f}% of your spending happens on weekends (${weekend_total:.2f})',
                'actionable_advice': 'Consider setting a weekend budget or putting aside savings before the weekend to avoid overspending.'
            })
    
    return tips

# function to generate general saving tips for new users
# General advice so tip section will not be left empty
#50/30/20 - 50 for needs, 30 for wants, 20 for savings  reference: https://www.bankrate.com/personal-finance/monthly-expenses-examples/
# https://www.nerdwallet.com/article/finance/nerdwallet-budget-calculator
def get_general_saving_tips():
    return [
        {
            'type': 'general_tip',
            'priority': 'suggestion',
            'title': 'A Simple Starting Point ',
            'message': 'Not sure where to start? Try the 50/30/20 guideline: 50% of income to needs, 30% to wants, and 20% to savings .',
            'actionable_advice': 'Think of it as a guide, not a rule — even saving 5% is a great start!'
        },
        {
            'type': 'general_tip',
            'priority': 'suggestion',
            'title': 'Start by setting small Goals',
            'message': 'Create a goal you can achieve within a short duration ~3-6 months.',
            'actionable_advice': 'How about a small emergency fund of $500? or a small fund for Christmas? '
        },
        {
            'type': 'general_tip',
            'priority': 'suggestion',
            'title': 'Build the Habit, One Day at a Time',
            'message': 'Start logging just one expense today - simply click on expenses to start your journey',
            'actionable_advice': 'Small habits stick! Try adding at least one expense each day for a week! '
        },
        {
            "type": "general_tip",
            "priority": "suggestion",
            "title": " Spot Your Spending Pattern",
            "message": "At the end of the week, look back: where did most of your money go?",
            "actionable_advice": "Awareness is half the battle, knowing where your money goes is part of the reaching your goal. "
        },
        {
            "type": "general_tip",
            "priority": "suggestion",
            "title": "Make It Automatic, one less task to think about",
            "message": "Set up an automatic transfer to savings — save without even thinking about it.",
            "actionable_advice": "Even $10 a week adds up to over $500 a year!"
        }

    ]

# function to save all tips
def save_tips (user_id, all_tips):
    cursor = db.get_cursor()    
    #reset all the tips for the user to inactive first before generating new tips.
    cursor.execute("UPDATE tips SET is_active = 0 WHERE user_id = %s", (user_id,))

    # Get list of dismissed tips to avoid regenerating them
    cursor.execute("""
        SELECT DISTINCT t.title, t.message, t.actionable_advice
        FROM tips t 
        JOIN user_tip_interactions uti ON t.tip_id = uti.tip_id 
        WHERE t.user_id = %s AND uti.action = 'dismissed'
    """, (user_id,))
    dismissed_tips = cursor.fetchall()

    for tip in all_tips:
        #Check if this exact tip content was previously dismissed
        #iterate through dismissed_tips and check if the tip content matches whats in all_tips
        #if title, message and actionable_advice matches, do not generate that tip. 
        #(all 3 criteria must be met = True -> do not generate tip)
        #if False -> continue -> store the tip to be generated again 
        tip_was_dismissed = any(
            dismissed['title'] == tip['title'] and 
            dismissed['message'] == tip['message'] and 
            (dismissed['actionable_advice'] or '') == (tip.get('actionable_advice') or '')
            for dismissed in dismissed_tips
        )
        
        # Skip tips that have been dismissed by the user
        if tip_was_dismissed:
            continue
            
        # Set default is_active to True if not provided
        is_active = tip.get('is_active', True)
        cursor.execute("""
            INSERT INTO tips (user_id, tip_type, priority, title, message, actionable_advice, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (user_id, tip['type'], tip['priority'], tip['title'], 
              tip['message'], tip['actionable_advice'], is_active))
    
    # Retrieve all the tips with tip_id (after all insertions)
    # Order by priority: income_expense, savings_progress, 
    # category_analysis, large_one_time_expense, 
    # weekend_spending, then others
    cursor.execute("""SELECT tip_id, tip_type, priority, 
                        title, message, actionable_advice, is_active, generated_at
                        FROM tips 
                        WHERE user_id = %s
                        AND is_active = true
                        ORDER BY 
                            CASE tip_type
                                WHEN 'income_expense' THEN 1
                                WHEN 'savings_progress' THEN 2
                                WHEN 'category_analysis' THEN 3
                                WHEN 'large_one_time_expense' THEN 4
                                WHEN 'weekend_spending' THEN 5
                                ELSE 6
                            END,
                            generated_at DESC""", (user_id,))
    tips_info = cursor.fetchall()
    # convert the is_active from 1 to boolean
    for tip in tips_info:
        tip['is_active'] =bool(tip['is_active'])
    return tips_info

