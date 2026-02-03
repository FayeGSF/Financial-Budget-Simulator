from flask import Blueprint, request, jsonify, session
from wrapper import auth_required
import db
from datetime import datetime
from . import utils
from .whatif import income_convert, fixedexpenses_convert
expenses_bp = Blueprint('expenses', __name__, url_prefix='/expenses')

# fixed expenses (salary, rent, utilities, etc)
# add fixed expense
# update fixed expense
# delete fixed expense
@expenses_bp.route('/getfixedexpense', methods=['GET'])
@auth_required()
def get_fixedExpense():
    user_id = session.get('id')
    conn = db.get_db()
    cursor = db.get_cursor()
    cursor.execute("""SELECT * FROM fixedexpenses WHERE user_id = %s""",(user_id,))
    fixedexpenses = cursor.fetchall()
    # get total FE 
    total_fe =fixedexpenses_convert()
    print(total_fe)
    return jsonify({'data': fixedexpenses, 
                    'total':total_fe}), 200

@expenses_bp.route('/addfixedexpense', methods=['POST'])
@auth_required()
def add_fixedExpense():
    user_id = session.get('id')
    data = request.get_json()
    amount = data.get('amount')
    fixedexpense_name = data.get('name')
    biling_cycle = data.get('biling_cycle')

    # amount validation (must be a number, must be greater than 0, no negative number)
    if not amount:
        return jsonify({'error': 'Amount is required'}), 400
    if not isinstance(amount, (int, float)):
        return jsonify({'error': 'Amount must be a number'}), 400
    if amount <= 0:
        return jsonify({'error': 'Amount must be greater than 0'}), 400
    # FE name validation (not entered, empty string, or whitespace)
    # FE name >100 show error
    if not fixedexpense_name or fixedexpense_name.strip() == '':
        return jsonify({'error': 'Name is required'}), 400
    if len(fixedexpense_name) > 100:
        return jsonify ({'error' : 'Name must be less than 100 characters'}), 400
    # biling cycle validation
    if not biling_cycle:
        return jsonify({'error': 'Biling cycle is required'}), 400
    if biling_cycle not in ['monthly', 'weekly','yearly'] :
        return jsonify({'error': 'Invalid biling cycle'}), 400
    
    try: 
        conn = db.get_db()
        cursor = db.get_cursor()
        cursor.execute("""INSERT INTO fixedexpenses(user_id,name,amount,biling_cycle)
                        VALUES(%s,%s,%s,%s)""",(user_id,fixedexpense_name,amount,biling_cycle))
        return jsonify({'message': 'Fixed expense added successfully'}), 201
    except Exception as e:
        print('Error adding fixed expense:', e)
        return jsonify({'error': f'Failed to add fixed expense: {str(e)}'}), 500

@expenses_bp.route('/updatefixedexpense', methods=['POST'])
@auth_required()
def update_fixedExpense():
    user_id = session.get('id')
    data = request.get_json()
    fixedexpense_id = data.get('fixedexpense_id')
    amount = data.get('amount')
    fixedexpense_name = data.get('fixedexpense_name')
    biling_cycle = data.get('biling_cycle')
    
    # validate the fields
    # amount validation (must be a number, must be greater than 0, no negative number)
    if not amount:
        return jsonify({'error': 'Amount is required'}), 400
    if not isinstance(amount, (int, float)):
        return jsonify({'error': 'Amount must be a number'}), 400
    if amount <= 0:
        return jsonify({'error': 'Amount must be greater than 0'}), 400
    # FE name validation (not entered, empty string, or whitespace)
    # FE name >100 show error
    if not fixedexpense_name or fixedexpense_name.strip() == '':
        return jsonify({'error': 'Name is required'}), 400
    if len(fixedexpense_name) > 100:
        return jsonify ({'error' : 'Name must be less than 100 characters'}), 400
    # biling cycle validation
    if not biling_cycle:
        return jsonify({'error': 'Biling cycle is required'}), 400
    if biling_cycle not in ['monthly', 'weekly','yearly'] :
        return jsonify({'error': 'Invalid biling cycle'}), 400
    update_fixedexpenses_fields=[]
    update_fixedexpenses_values=[]

    if amount:
        update_fixedexpenses_fields.append('amount = %s')
        update_fixedexpenses_values.append(amount)
    if fixedexpense_name:
        update_fixedexpenses_fields.append('name = %s')
        update_fixedexpenses_values.append(fixedexpense_name)
    if biling_cycle:
        update_fixedexpenses_fields.append('biling_cycle = %s')
        update_fixedexpenses_values.append(biling_cycle)
    
    if not update_fixedexpenses_fields:
        return jsonify({'error': 'No fields provided to update'}), 400
    
    try:
        conn = db.get_db()
        cursor = db.get_cursor()
        query = f"""UPDATE fixedexpenses SET {', '.join(update_fixedexpenses_fields)} WHERE fixed_expense_id = %s"""
        # Add fixedexpense_id to the values list for the WHERE clause
        update_fixedexpenses_values.append(fixedexpense_id)
        cursor.execute(query, update_fixedexpenses_values)
        
        return jsonify({'message': 'Fixed expense updated successfully'}), 200
    except Exception as e:
        print('Error updating fixed expense:', e)
        return jsonify({'error': f'Failed to update fixed expense: {str(e)}'}), 500


# delete fixed expense
@expenses_bp.route('/deletefixedexpense', methods=['POST'])
@auth_required()
def delete_fixedExpense():
    user_id = session.get('id')
    data = request.get_json()
    fixedexpense_id = data.get('fixedexpense_id')
    try:   
        conn = db.get_db()
        cursor = db.get_cursor()
        # find the FE from the FE ID 
        cursor.execute("""DELETE FROM fixedexpenses WHERE fixed_expense_id = %s""",(fixedexpense_id,))

        return jsonify({'message': 'Fixed expense deleted successfully'}), 200
    except Exception as e:
        print ('Errpr deleting fixed expense:', e)
        return jsonify({'error': f'Failed to delete fixed expense: {str(e)}'}), 500

# other expenses
@expenses_bp.route('/get', methods=['GET'])
@auth_required()
def get_expenses():
    try:
        user_id = session.get('id')
        expenses = utils. get_user_expenses(user_id)
        total_expenses = utils.get_total_expenses()
    # retrieve categories for dropdown in frontend add categories to expenses
        cursor = db.get_cursor()
        cursor.execute("""Select * from categories""")
        categories = cursor.fetchall()
    # selected months from expenses
        selected_months = utils.selected_month()
        print("Expenses fetched from DB:", expenses)
        print("Categories fetched from DB:", categories)
        print("Total expenses fetched from DB:", total_expenses)
        print("Selected months fetched from DB:", selected_months)
        return jsonify({
            'expenses': expenses, 
            'categories': categories, 
            'total_expenses': total_expenses,
            'selected_months': selected_months
        }), 200
    except Exception as e:
        print ('Error fetching expenses:', e )
        return jsonify({'error': f'Failed to fetch expenses: {str(e)}'}), 500

# other expenses CRUD
# add expenses
@expenses_bp.route('/addexpense', methods=['POST'])
@auth_required()
def add_expense():
    user_id = session.get('id')
    data = request.get_json()
    amount = data.get('amount')
    expense_category= data.get('expense_category')
    expense_description = data.get('expense_description')
    expense_date = data.get('expense_date')
    expense_date = datetime.strptime(expense_date, '%Y-%m-%d').strftime('%Y-%m-%d')
    # validate input fields
    validation_errors = validate_expense_input(amount, expense_category, expense_description, expense_date)
    if validation_errors:
        return jsonify({'error': validation_errors}), 400
    # check if category exists
    cursor = db.get_cursor()
    cursor.execute("""SELECT category_id FROM categories WHERE category_id = %s""", (expense_category,))
    category = cursor.fetchone()
    if not category:
        return jsonify({'error': 'Invalid category'}), 400
    # insert expense into database
    try:
        conn = db.get_db()
        cursor=db.get_cursor()
        cursor.execute("""Insert into expenses (user_id, amount, category_id, description, date)
                            VALUES (%s, %s, %s, %s, %s)""",
                            (user_id, amount, expense_category, expense_description, expense_date))
        
        return jsonify({'message': 'Expense added successfully'}), 200
    except Exception as e:
        print('Error adding expense:', e)
        return jsonify({'error': f'Failed to add expense: {str(e)}'}), 500
# edit expenses
@expenses_bp.route('/edit', methods=['PUT'])
@auth_required()
def edit_expense():
    user_id = session.get('id')
    data = request.get_json()
    expense_id = data.get('expense_id')
    amount = data.get('amount')
    expense_category = data.get('expense_category')
    expense_description = data.get('expense_description', '')
    expense_date = data.get('expense_date')
    
    try:
        conn = db.get_db()
        cursor = db.get_cursor()
        
        # Check if expense exists and belongs to the user
        cursor.execute("""SELECT * FROM expenses WHERE expense_id = %s AND user_id = %s""", (expense_id, user_id))
        expense = cursor.fetchone()
        if not expense:
            return jsonify({'error': 'Expense not found or access denied'}), 404
        
        # Update the expense
        cursor.execute("""UPDATE expenses SET amount = %s, category_id = %s, description = %s, date = %s WHERE expense_id = %s AND user_id = %s""",
                        (amount, expense_category, expense_description, expense_date, expense_id, user_id))
        
        return jsonify({'message': 'Expense updated successfully'}), 200
    except Exception as e:
        print('Error updating expense:', e)
        return jsonify({'error': f'Failed to update expense: {str(e)}'}), 500

# delete expenses

@expenses_bp.route('/delete', methods=['DELETE'])
@auth_required()
def delete_expense():
    user_id = session.get('id')
    data = request.get_json()
    expense_id = data.get('expense_id')
    try:
        conn = db.get_db()
        cursor = db.get_cursor()
        
        # Check if expense exists and belongs to the user
        cursor.execute("""SELECT * FROM expenses WHERE expense_id = %s AND user_id = %s""", (expense_id, user_id))
        expense = cursor.fetchone()
        if not expense:
            return jsonify({'error': 'Expense not found or access denied'}), 404
        
        # Delete the expense
        cursor.execute("""DELETE FROM expenses WHERE expense_id = %s AND user_id = %s""", (expense_id, user_id))
        
        return jsonify({'message': 'Expense deleted successfully'}), 200
    except Exception as e:
        print('Error deleting expense:', e)
        return jsonify({'error': f'Failed to delete expense: {str(e)}'}), 500


# helper function to validate expense input
def validate_expense_input(amount, expense_category, expense_description, expense_date):
    errors = []
     # amount validation (must be a number, must be greater than 0, no negative number)
    if not amount:
        errors.append('Amount is required')
    else:
        try:
            amount_val = float(amount)
            if amount_val <= 0:
                errors.append('Amount must be greater than 0')
        except ValueError:
            errors.append('Invalid amount format')
    # expense category validation 
    if not expense_category:
        errors.append('Category is required')
    # expense description validation (optional)
    if expense_description and expense_description.strip() != '' and len(expense_description) > 100:
        errors.append('Description must be less than 100 characters')
    # expense date validation
    if not expense_date:
        errors.append('Date is required')
    else:
        try:
            parsed_date = datetime.strptime(expense_date, '%Y-%m-%d')
            if parsed_date > datetime.now():
                errors.append('Expense date must not be in the future')
        except ValueError:
            errors.append('Invalid expense date format')

    return errors
# add expense category
@expenses_bp.route('/addcategory', methods=['POST'])
@auth_required()
def add_category():
    user_id = session.get('id')
    data = request.get_json()
    category_name = str(data.get('category_name')).capitalize()
    try:
        conn = db.get_db()
        cursor = db.get_cursor()
        cursor.execute("""INSERT INTO categories(cat_name) VALUES(%s)""",(category_name,))
    except Exception as e:
        print('Error adding category:   ', e)
        return jsonify({'error': f'Failed to add category: {str(e)}'}), 500
    return jsonify({'message': 'Category has been added successfully'}), 200

# filter expenses by months, utils.py has filter_months function
@expenses_bp.route('/selectedmonth', methods=['GET'])
@auth_required()
def selected_month():
    user_id = session.get('id')
    try:
        selected_month = utils.selected_month()
        print('Filter months fetched from DB:', selected_month)
        return jsonify({'months': selected_month}), 200
    except Exception as e:
        print('Error filtering months:', e)
        return jsonify({'error': f'Failed to filter months: {str(e)}'}), 500


@expenses_bp.route('/expense_by_month', methods=['GET'])
@auth_required()
def expense_by_month():
    user_id = session.get('id')
    month = request.args.get('month') 
    print('Month fetched from frontend:', month)
    try:
        filtered_expenses = utils.get_user_expenses_by_month(user_id, month)
        print('Filtered expenses fetched from DB:', filtered_expenses)
        return jsonify({'filtered_expenses': filtered_expenses}), 200
    except Exception as e:
        print('Error fetching expenses by month:', e)
        return jsonify({'error': f'Failed to fetch expenses by month: {str(e)}'}), 500
        
@expenses_bp.route('/amount_left', methods =['GET'])
@auth_required()
def amount_left():
    user_id = session.get('id')
    try:
        # use selectedMonth if not use current month
        selected_month = request.args.get('month')
        if not selected_month:
            selected_month = datetime.now().strftime('%B-%Y')
        
        monthly_income= income_convert()
        monthly_fixed_expenses = fixedexpenses_convert()
        monthly_expenses_list = utils.total_expenses_by_month (user_id, selected_month)
        
        # Extract the total amount from the list (should be a single item for selected month)
        monthly_expenses = 0.0
        if monthly_expenses_list and len(monthly_expenses_list) > 0:
            monthly_expenses = float(monthly_expenses_list[0]['total_amt'] or 0)
        remaining_amount = monthly_income -(monthly_fixed_expenses + monthly_expenses)
        return jsonify({'remaining_amount': remaining_amount, 'month': selected_month}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch amount left for spending: {str(e)}'}),500