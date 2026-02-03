#  savings page only need Add and Fetch savings. 
#  do not want to delete savings as we want users to save

from flask import Blueprint, request, jsonify, session
from wrapper import auth_required
import db
from datetime import datetime

savings_bp = Blueprint('savings', __name__, url_prefix='/savings')

@savings_bp.route('/add', methods=['POST'])
@auth_required()
def add_savings():
    user_id = session.get('id')
    data = request.get_json()
    amount = data.get('amount')
    goal_id = data.get('goal_id')
    date = data.get('date')
    errors = validate_savings_input(amount, goal_id, date)
    if errors:
        return jsonify({'errors': errors}), 400
    goal_amount_errors = validate_goal_amount_limit(amount, goal_id, user_id)
    if goal_amount_errors:
        return jsonify({'errors': goal_amount_errors}), 400
    try:
        conn = db.get_db()
        cursor = db.get_cursor()
        cursor.execute("""INSERT INTO savings ( goal_id, amount, date) VALUES (%s, %s, %s)""", ( goal_id, amount, date))
        
        return jsonify({'message': 'Savings added successfully'}), 201
    except Exception as e:
        print('Error in adding savings:', e)
        return jsonify({'errors': [f'Savings addition failed: {str(e)}']}), 500 

@savings_bp.route('/edit', methods=['PUT'])
@auth_required()
def edit_savings():
    user_id = session.get('id')
    data = request.get_json()
    amount = data.get('amount')
    savings_id = data.get('savings_id')
    goal_id = data.get('goal_id')
    date = data.get('date')
    errors = validate_savings_input(amount, goal_id,date)
    if errors:
        return jsonify({'errors': errors}), 400
    goal_amount_errors = validate_goal_amount_limit(amount, goal_id, user_id)
    if goal_amount_errors:
        return jsonify({'errors': goal_amount_errors}), 400

    try:
        conn = db.get_db()
        cursor = db.get_cursor()
        # check if the saving exists
        cursor.execute("""SELECT * FROM savings WHERE savings_id = %s""", (savings_id,))
        saving = cursor.fetchone()
        if not saving:
            return jsonify({'errors': ['Saving not found']}), 404
        # update the saving
        cursor.execute("""UPDATE savings
                        set amount = %s, date = %s, goal_id = %s
                        WHERE savings_id=%s
                        ;""", ( amount, date, goal_id, savings_id,))
        
        return jsonify({'message': 'Savings added successfully'}), 201
    except Exception as e:
        print('Error in modifying savings:', e)
        return jsonify({'errors': [f'Savings modification failed: {str(e)}']}), 500 

@savings_bp.route('/delete', methods=['DELETE'])
@auth_required()
def delete_savings():
    
    data= request.get_json()
    savings_id = data.get('savings_id')
    try:
        cursor = db.get_cursor()
        cursor.execute("""DELETE FROM savings 
                        WHERE savings_id =%s 
                        """, (savings_id,))
        
        return jsonify({'message': 'Saving deleted successfully'}), 200
    except Exception as e:
        print('Error in deleting savings:', e)
        return jsonify({'error': 'Failed to delete saving'}), 500

@savings_bp.route('/get_savings', methods=['GET'])
@auth_required()
def get_savings():
    user_id=session.get('id')
    # get all goals of user 
    # check if there are any savings for the user
    # if no savings, return empty array 
    # if there is, return savings 
    cursor = db.get_cursor()
    # check goals
    cursor.execute("""select * from goals 
    WHERE user_id = %s;""", (user_id,))
    user_goals= cursor.fetchall()
    if user_goals == []:
        return jsonify({'data': []}), 200
    # check savings (join savings and goals)
    cursor.execute("""SELECT s.*, g.description FROM goals as g
                    INNER JOIN savings as s on g.goal_id =s.goal_id
                    WHERE g.user_id = %s
                    order by s.date DESC; """, (user_id,))
    user_savings= cursor.fetchall()
    if user_savings == []:
        return jsonify({'data': []}), 200
    return jsonify({'data': user_savings}), 200

@savings_bp.route('/goals', methods=['GET'])
@auth_required()
def get_user_goals():
    user_id = session.get('id')
    cursor = db.get_cursor()
    cursor.execute("SELECT * FROM goals WHERE user_id = %s", (user_id,))
    user_goals = cursor.fetchall()
    print('user_goals fetched from DB:', user_goals)
    return jsonify({'data': user_goals}), 200

# helpher function to validate savings input
def validate_savings_input(amount, goal_id, date):
    errors = []
    # validate amount
    if not amount:
        errors.append('Amount is required')
    else:
        try:
            amount_val = float(amount)
            if amount_val <= 0:
                errors.append('Amount must be greater than 0')
        except ValueError:
            errors.append('Invalid amount format')

    # validate date
    if not date:
        errors.append('Date is required')
    else:
        try:
            parsed_date = datetime.strptime(date, '%Y-%m-%d')
            if parsed_date > datetime.now():
                errors.append('Saving date must not be in the future')
        except ValueError:
            errors.append('Invalid saving date format')
    # validate goal_id
    if not goal_id:
        errors.append('Goal ID is required')
    
    return errors

# function to display savings per goal in summary card
# savings per user by goal
@savings_bp.route('/savings_by_goal', methods=['GET'])
@auth_required()
def get_savings_by_goal():
    user_id = session.get('id')
    try:
        cursor = db.get_cursor()
        # retrive goal_id for the specific user
        cursor.execute("""SELECT goal_id FROM goals WHERE user_id = %s;""", (user_id,))
        user_goals = cursor.fetchall()
        print('User goals from db', user_goals)
        # if user has no goals, return empty array
        if user_goals == []:
            return jsonify({'data': []}), 200
        user_goal_savings = []
        for goal in user_goals:
            goal_id= goal['goal_id']
        # retrive totalsavings for the specific goal
            cursor.execute(""" SELECT g.user_id, g.goal_id, g.description,
                            COALESCE(SUM(s.amount), 0) AS total_saved
                        FROM goals AS g
                        LEFT JOIN savings AS s ON g.goal_id = s.goal_id
                        WHERE g.user_id = %s
                        AND g.goal_id = %s
                        GROUP BY g.user_id, g.goal_id, g.description;""", (user_id, goal_id,))
            each_goal_savings = cursor.fetchone()
            if each_goal_savings:
                user_goal_savings.append(each_goal_savings)
        print('savings per user by goal', user_goal_savings)
        return jsonify({'user_goals': user_goals, 'goal_savings':user_goal_savings}), 200
    except Exception as e:
        print('Error fetching savings by goal:', e)
        return jsonify({'errors': [f'Failed to fetch savings by goal: {str(e)}']}), 500

 # helper function so user doesnt cant save exceeding goal amount
def validate_goal_amount_limit( amount, goal_id, user_id):
    errors =[]
    # get goal amount for the specific goal
    # compare it to user's amount input
    try:
        cursor = db.get_cursor()
        cursor.execute("""SELECT amount FROM goals WHERE goal_id = %s AND user_id = %s""", (goal_id, user_id,))
        goal_result = cursor.fetchone()
        if not goal_result:
            errors.append('Goal not found')
        goal_amount = float(goal_result['amount'])

        cursor.execute ("""SELECT SUM(amount) as saved_amount FROM savings
                        WHERE goal_id =%s
                        ; """, (goal_id,))
        saved_result = cursor.fetchone()
        # safeguard incase saved amount = 0.0 
        saved_amount = float(saved_result['saved_amount']) if saved_result['saved_amount'] is not None else 0.0       
        remaining_amount = goal_amount - saved_amount
        
        # Add small tolerance for floating-point precision issues
        if amount > remaining_amount + 0.001:
            errors.append(f'Input amount exceeds remaining goal amount ${remaining_amount:.2f}')
    except Exception as e:
        print('Error validating goal amount limit:', e)
        errors.append('Input amount exceeds goal amount. Please adjust the amount.')
    return errors
    
