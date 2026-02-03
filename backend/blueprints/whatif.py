from flask import Blueprint, request, jsonify, session
from wrapper import auth_required, has_income_and_fixed_expenses
import db
from . import utils
from datetime import datetime, timedelta
import math
from wrapper import has_income_and_fixed_expenses

whatif_bp = Blueprint('whatif', __name__, url_prefix='/whatif')

# current summary of spendings vs savings vs income
    # calculate total expenses (FE + expenses)
    # show income - expenses  = whats remaining to spend/save
@whatif_bp.route('/current_summary', methods=['GET'])
@auth_required()
def current_summary():
    try:
        user_id = session.get('id')
        data = request.get_json()
        month= data.get('month')
        current_income = income_convert()
        current_fe = fixedexpenses_convert()
        monthly_expense = utils.total_expenses_by_month(user_id, month)
        remaining_amount = current_income - (current_fe + monthly_expense)
        print('remaining_amount :', remaining_amount)
        
        if remaining_amount < 0:
            return jsonify({'message': 'Spendings exceed income', 'remaining_amount': remaining_amount})
        elif remaining_amount == 0:
            return jsonify({'message': 'All income has been spent', 'remaining_amount': remaining_amount})
        else:
            return jsonify({'message': f'${remaining_amount:.2f} left this month', 'remaining_amount': remaining_amount})
    except Exception as e:
        return jsonify({'error': str(e)}), 500



# adjusment settings 
 
    # get adjusted expenses 
    # compare adjusted expenses to existing expenses. 
    # show how much savings if adjusted expense was used instead
    # maybe, calculate new completion date 

# user can adjust slider/amount without saving first
@whatif_bp.route('/available_months', methods=['GET'])
@auth_required()
def get_available_months():
    try:
        user_id = session.get('id')
        cursor = db.get_cursor()
        
        #check if user has income and FE and also at least 1 expenese input if not they cant 
        # if does not have income and FE, do not allow use of what-if
        if not has_income_and_fixed_expenses(user_id):
            return jsonify({'error_profile': 'Add your income and/or fixed expensesto use scenario simulation.'}), 400
        cursor.execute ("""SELECT COUNT(*) as count_expenses 
                        FROM expenses WHERE user_id =%s""", (user_id,))
        count_expenses = cursor.fetchone()['count_expenses']
        if count_expenses ==0 :
            return jsonify({'error_expenses': 'Please add at least 1 expense to use scenario simulation.'}), 400

        # Get all available months for the user
        cursor.execute("""SELECT DATE_FORMAT(date, '%%M-%%Y') as month_year 
                        FROM expenses 
                        WHERE user_id = %s
                        GROUP BY month_year 
                        ORDER BY MIN(date) DESC;""", (user_id,))
        months = cursor.fetchall()
        # Extract month values from the result
        available_months = [month['month_year'] for month in months]

        return jsonify({
            'available_months': available_months,
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@whatif_bp.route('/expense_categories/<month>', methods=['GET'])
@auth_required()
def get_expense_categories(month):
    try:
        user_id = session.get('id')
        cursor = db.get_cursor()
        
        # get current expenses by category for the specified month
        cursor.execute("""SELECT 
                            c.cat_name, c.category_id,
                            DATE_FORMAT(e.date, '%%M-%%Y') AS month_year, 
                            SUM(e.amount) AS total_amount
                            FROM expenses AS e
                            INNER JOIN categories AS c ON e.category_id = c.category_id
                            WHERE e.user_id = %s
                            AND DATE_FORMAT(e.date, '%%M-%%Y') = %s
                            GROUP BY e.category_id, month_year
                            Order by total_amount DESC;""", (user_id, month))
        real_categories = cursor.fetchall()

# get hypothetical categories
        cursor.execute("""SELECT category_name, hypothetical_category_id as category_id, 0 as total_amount
                                FROM whatif_categories 
                                WHERE user_id = %s AND is_deleted = FALSE""", (user_id,))
        hypothetical_categories = cursor.fetchall()

        all_categories = list(real_categories) + list(hypothetical_categories)
        # Format categories for frontend
        categories = []
        for category in all_categories:
            # Determine if this is a hypothetical category
            is_hypothetical = 'cat_name' not in category
            
            categories.append({
                'category_id': category['category_id'],
                'category_name': category.get('cat_name') or category.get('category_name'),
                'original_amount': category['total_amount'],
                'is_hypothetical': is_hypothetical
            })
        return jsonify({
            'categories': categories,
            'month': month,
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@whatif_bp.route('/adjust_preview', methods=['POST'])
@auth_required()
def adjust_preview():
    try:
        user_id = session.get('id')
        data = request.get_json()
        month = data.get('month')
        adjustments = data.get('adjustments')
        if not month:
            return jsonify({'error': 'Month is required'}), 400
        if not adjustments:
            return jsonify({'error': 'Adjustments are required'}), 400
        cursor = db.get_cursor()
        # get current expenses by category for calculations these are REAL categories
        cursor.execute("""SELECT 
                            c.cat_name, c.category_id,
                            DATE_FORMAT(e.date, '%%M-%%Y') AS month_year, 
                            SUM(e.amount) AS total_amount
                            FROM expenses AS e
                            INNER JOIN categories AS c ON e.category_id = c.category_id
                            WHERE e.user_id = %s
                            AND DATE_FORMAT(e.date, '%%M-%%Y') = %s
                            GROUP BY e.category_id, month_year
                            Order by total_amount DESC;""", (user_id, month))
        monthly_expenses__category = cursor.fetchall()
        # Calculate savings from adjustments
        total_savings_adjusted = 0
        category_breakdown = []
        
        for category in monthly_expenses__category:
            category_id = category['category_id']
            
            if category_id in adjustments or str(category_id) in adjustments:
                # Get the adjustment value, handling both key types
                new_amount = adjustments.get(category_id) or adjustments.get(str(category_id))
                original_amount = category['total_amount']
                # fix the error of decimal set in sql vs frontend
                new_amount= float (new_amount)
                savings= float (original_amount) - new_amount
                total_savings_adjusted += savings
                # Add to category breakdown
                category_breakdown.append({
                    'category_id': category_id,
                    'category_name': category['cat_name'],
                    'original_amount': original_amount,
                    'new_amount': new_amount,
                    'savings': savings,
                    'is_hypothetical': False
                })

        # GET Hypothetical categories. 
        cursor.execute("""SELECT category_name, hypothetical_category_id as category_id
                         FROM whatif_categories 
                         WHERE user_id = %s""", (user_id,))
        hypothetical_categories = cursor.fetchall()
        #similar to real categories 
        for hypo_cat in hypothetical_categories:
            category_id = hypo_cat['category_id']
            
            if category_id in adjustments or str(category_id) in adjustments:
                new_amount = adjustments.get(category_id) or adjustments.get(str(category_id))
                new_amount = float(new_amount)
                # For hypothetical categories, original amount is always 0
                # Savings = 0 - new_amount (negative because it's new spending)
                savings = 0 - new_amount
                total_savings_adjusted += savings
                
                # Add to category breakdown
                category_breakdown.append({
                    'category_id': category_id,
                    'category_name': hypo_cat['category_name'],
                    'original_amount': 0,
                    'new_amount': new_amount,
                    'savings': savings,
                    'is_hypothetical': True
                })

        current_remaining_amount = get_amount_left_for_month(month)
        
        # Calculate hypothetical remaining amount
        hypothetical_remaining_amount = current_remaining_amount + total_savings_adjusted

        return jsonify({ 
            'total_monthly_savings': total_savings_adjusted,
            'category_breakdown': category_breakdown,
            'message': f'Total monthly savings: ${total_savings_adjusted:.2f}',
            'current_remaining_amount': current_remaining_amount,
            'hypothetical_remaining_amount': hypothetical_remaining_amount,
            'amount_difference': total_savings_adjusted
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
   
#  if user likes the scenario, they can save the scenario = create scenario
@whatif_bp.route('/save_scenario', methods=['POST'])
@auth_required()
def save_scenario():
    try:
        user_id = session.get('id')
        data = request.get_json()
        
        # Required fields
        scenario_name = data.get('scenario_name').capitalize()
        category_breakdown = data.get('category_breakdown')
        total_monthly_savings = data.get('total_monthly_savings')
        goal_id = data.get('goal_id')  # Optional
        
        if not scenario_name:
            return jsonify({'error': 'Scenario name is required'}), 400
        if not category_breakdown:
            return jsonify({'error': 'Category breakdown is required'}), 400
        if total_monthly_savings is None:
            return jsonify({'error': 'Total monthly savings is required'}), 400
        
        cursor = db.get_cursor()
        
        # Create the scenario
        cursor.execute("""
            INSERT INTO whatifscenario (user_id, goal_id, name, created_at)
            VALUES (%s, %s, %s, NOW());
        """, (user_id, goal_id, scenario_name))
        
        # Get the newly created scenario ID
        scenario_id = cursor.lastrowid
        
        # Insert adjustments for each category
        for category in category_breakdown:
            is_hypothetical = category.get('is_hypothetical', False)
            cursor.execute("""
                    INSERT INTO whatifadjustment 
                    (scenario_id, category_id, is_hypothetical_cat, original_amt, new_amt, note)
                    VALUES (%s, %s, %s, %s, %s, %s);
                """, (
                scenario_id,
                category['category_id'],
                is_hypothetical,
                category['original_amount'],
                category['new_amount'],
                f"Adjusted from ${float(category['original_amount']):.2f} to ${float(category['new_amount']):.2f}"            ))
        
        # If there's a goal_id, insert projection
        if goal_id and total_monthly_savings > 0:
            cursor.execute("""
                INSERT INTO whatifprojection 
                (scenario_id, projected_savings, projected_completion_date, created_at)
                VALUES (%s, %s, %s, NOW())
            """, (scenario_id, total_monthly_savings, None))
            
        return jsonify({
            'message': 'Scenario saved successfully',
            'scenario_id': scenario_id,
            'scenario_name': scenario_name,
            'total_monthly_savings': total_monthly_savings,
            'adjustments_count': len(category_breakdown)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@whatif_bp.route('/delete_scenario' , methods= ['DELETE'])
@auth_required()
def delete_scenario():
    try:
        user_id = session.get('id')
        data = request.get_json()  
        scenario_id = data.get('scenario_id')
        if not scenario_id:
            return jsonify({'error': 'scenario_id is required'}), 400
        
        cursor = db.get_cursor()
        cursor.execute("DELETE FROM whatifscenario WHERE scenario_id = %s", (scenario_id,))
        return jsonify({'message': 'Scenario deleted successfully'}), 200
    except Exception as e:
        print('Error deleting scenario:', e)
        return jsonify({'error': f'Failed to delete scenario: {str(e)}'}), 500


#  get scenario so user can view their past saved scenario
@whatif_bp.route('/get_scenario', methods=['GET'])
@auth_required()
def get_scenario():
    try:
        user_id = session.get('id')
        cursor = db.get_cursor()
        
        cursor.execute("""
            SELECT awa.scenario_id, awa.category_id, awa.category_name,
            wis.name, awa.note, wis.goal_id, awa.saving_amt,
            wis.created_at AS formatted_date, awa.is_hypothetical
            FROM all_whatif_adjustments awa
            INNER JOIN whatifscenario wis ON wis.scenario_id = awa.scenario_id
            WHERE wis.user_id = %s
            ORDER BY wis.scenario_id DESC, awa.category_name;
        """, (user_id,))
        
        results = cursor.fetchall()
        
        # Group results by scenario_id
        scenarios = {}
        for row in results:
            scenario_id = row['scenario_id']
            if scenario_id not in scenarios:
                scenarios[scenario_id] = {
                    'scenario_id': scenario_id,
                    'name': row['name'],
                    'total_saved_amount': 0,
                    'adjustments': [],
                    'date':row['formatted_date']
                }
            
            # Add adjustment note and accumulate savings
            if row['note']:
                saving_amount = float(row['saving_amt'] or 0)
                scenarios[scenario_id]['total_saved_amount'] += saving_amount
                scenarios[scenario_id]['adjustments'].append({
                    'category_name': row['category_name'],
                    'note': row['note'],
                    'saving_amount': saving_amount,
                    'is_hypothetical': row['is_hypothetical']
                })
        
        # Convert to list and format response
        formatted_scenarios = list(scenarios.values())
        print (f'List of scenarios : {formatted_scenarios}')
        return jsonify({
            'scenarios': formatted_scenarios,
            'total_count': len(formatted_scenarios)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# users to create hypothetical categories in Whatif scenarios
@whatif_bp.route('/add_hypothetical_category', methods=['POST'])
@auth_required()
def add_hypothetical_category():
    try:
        user_id = session.get('id')
        data = request.get_json()
        category_name = data.get('category_name', '').strip().capitalize()
        cursor = db.get_cursor()

        if not has_income_and_fixed_expenses(user_id):
            return jsonify({'error': 'Please add your income and fixed expenses to use scenario simulation.'}), 400
        cursor.execute ("""SELECT COUNT(*) as count_expenses 
                        FROM expenses WHERE user_id =%s""", (user_id,))
        count_expenses = cursor.fetchone()['count_expenses']
        if count_expenses ==0 :
            return jsonify({'error': 'Please add at least 1 expense to use What-If.'}), 400

        
        if not category_name:
            return jsonify({'error': 'Category name is required'}), 400
        cursor.execute("""INSERT INTO whatif_categories(category_name, user_id) 
                         VALUES(%s, %s)""", (category_name, user_id))
        
        return jsonify({
            'message': 'Hypothetical category added successfully',
            'category_id': cursor.lastrowid,
            'category_name': category_name
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@whatif_bp.route('/delete_hypothetical_category', methods=['DELETE'])
@auth_required()
def delete_hypothetical_category():
    try: 
        user_id = session.get('id')
        data = request.get_json()
        hypothetical_category_id = data.get('category_id')
        
        if not hypothetical_category_id:
            return jsonify({'error': 'Category ID is required'}), 400
            
        cursor = db.get_cursor()
        # check if the category exists
        cursor.execute('''SELECT * from whatif_categories 
        WHERE hypothetical_category_id = %s
        AND user_id = %s''', (hypothetical_category_id, user_id,))
        cat_exist = cursor.fetchone()
        if not cat_exist:
            return jsonify({'error': 'Category not found or access denied'}), 404
        
        # remove the category from frontend, but keep it in db 
        cursor.execute("""UPDATE whatif_categories SET is_deleted = True 
                        WHERE hypothetical_category_id = %s
                        AND user_id = %s""", (hypothetical_category_id, user_id,))
        
        return jsonify({'message': 'Whatif category deleted successfully'}), 200
    except Exception as e:
        print('Error deleting whatif category:', e)
        return jsonify({'error': f'Failed to delete whatif category: {str(e)}'}), 500


# HELPER FUNCTIONS ------------------------------

# convert all income to monthly
def income_convert():
    try:
        user_id = session.get('id')
        cursor = db.get_cursor()
        cursor.execute("""SELECT ROUND(SUM(
        CASE 
            WHEN frequency = 'monthly' THEN amount
            WHEN frequency = 'weekly' THEN amount * 4.345
            WHEN frequency = 'yearly' THEN amount / 12
            WHEN frequency = 'hourly' THEN amount * 40 * 4.345
            ELSE 0
        END
            ), 2) AS monthly_income
            FROM income
            WHERE user_id = %s;""", (user_id,))
        monthly_income = cursor.fetchone()
        cursor.close()
        return float(monthly_income['monthly_income'] or 0)
    except Exception as e:
        print(f"Error in income_convert: {e}")
        return 0

# convert all FE to monthly
def fixedexpenses_convert():
    try:
        user_id = session.get('id')
        cursor = db.get_cursor()
        cursor.execute("""SELECT ROUND(SUM(
        CASE
            WHEN biling_cycle = 'monthly' THEN amount
            WHEN biling_cycle = 'weekly' THEN amount * 4.345
            WHEN biling_cycle = 'yearly' THEN amount / 12
            WHEN biling_cycle = 'hourly' THEN amount * 40 * 4.345
            ELSE 0
        END
            ), 2) AS monthly_fe
            FROM fixedexpenses
            WHERE user_id = %s;""", (user_id,))
        monthly_FE = cursor.fetchone()
        cursor.close()
        return float(monthly_FE['monthly_fe'] or 0)
    except Exception as e:
        print(f"Error in fixedexpenses_convert: {e}")
        return 0

# get whatif amount left when user use the scenario sliders
def get_amount_left_for_month(month):
    """Helper function that replicates the amount_left logic for a specific month"""
    try:
        user_id = session.get('id')
        monthly_income = income_convert()
        monthly_fixed_expenses = fixedexpenses_convert()
        monthly_expenses_list = utils.total_expenses_by_month(user_id, month)
        
        # Extract the total amount from the list
        monthly_expenses = 0.0
        if monthly_expenses_list and len(monthly_expenses_list) > 0:
            monthly_expenses = float(monthly_expenses_list[0]['total_amt'] or 0)
        
        remaining_amount = monthly_income - (monthly_fixed_expenses + monthly_expenses)
        return remaining_amount
    except Exception as e:
        print(f"Error calculating amount left: {e}")
        return 0