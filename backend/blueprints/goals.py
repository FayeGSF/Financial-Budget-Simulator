from flask import Blueprint, request, jsonify, session
from wrapper import auth_required
import db
from datetime import datetime

goals_bp = Blueprint('goals', __name__, url_prefix='/goals')

    # add goal
@goals_bp.route('/add', methods=['POST'])
@auth_required()
def add_goals():
    user_id = session.get('id')
    data=request.get_json()
    amount= data.get('amount')
    description= data.get('description')
    target_date= data.get('target_date')

    # validate input fields and error
    errors= validate_goal_input(amount, description, target_date)
    if errors:
        return jsonify({'errors': errors[0]}), 400

    # if no errors, insert into db.
    try:
        cursor=db.get_cursor()
        cursor.execute("""INSERT INTO goals (user_id, amount, description, target_date) VALUES (%s, %s, %s, %s)""",
                       (user_id, float(amount), description.strip(), target_date,))
        
        return jsonify({'message':'Goal added successfully'}), 201
    except Exception as e:
        return jsonify({'error': 'Failed to add goal'}), 500
    
    # edit goal
@goals_bp.route('/edit/<int:goal_id>', methods=['PUT'])
@auth_required()
def edit_goal(goal_id):
    user_id = session.get('id')
    data=request.get_json()
    amount= data.get('amount')
    description= data.get('description')
    target_date= data.get('target_date')
    
    # validate input fields and error
    errors= validate_goal_input(amount, description, target_date)
    if errors:
        return jsonify({'errors': errors[0]}), 400
    
    # check for empty fields
    # if no errors, update in db.
    try:
        cursor = db.get_cursor()

        # check if the goal exists and belongs to user
        cursor.execute("SELECT goal_id FROM goals WHERE goal_id = %s AND user_id = %s", (goal_id, user_id))
        if not cursor.fetchone():
            return jsonify({'error': 'Goal not found or access denied'}), 404
        # if goal exists, update it
        cursor.execute("""UPDATE goals SET amount=%s, description=%s, target_date=%s 
                        WHERE goal_id=%s AND user_id=%s""",
                       (float(amount), description.strip(), target_date, goal_id, user_id,))
        
        return jsonify({'message': 'Goal updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to update goal'}), 500
    
    # delete goal
@goals_bp.route('/delete/<int:goal_id>', methods=['DELETE'])
@auth_required()
def delete_goal(goal_id):
    user_id = session.get('id')
    try:
        cursor = db.get_cursor()
        cursor.execute("""DELETE FROM goals 
                        WHERE goal_id =%s 
                        AND user_id =%s""", (goal_id,user_id,))
        
        return jsonify({'message': 'Goal deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to delete goal'}), 500
    
# goal error helper function
def validate_goal_input(amount, description, target_date):
    errors = []

    # checking for missing fields:
    if not description or not description.strip():
        errors.append('Description is required')
    
    # amount errors:
    if not amount:
        errors.append('Amount is required')
    else:
        try:
            amount_val = float(amount)
            if amount_val <= 0:
                errors.append('Amount must be greater than 0')
        except ValueError:
            errors.append('Amount must be a valid number')
    
    # target date errors:
    if not target_date:
        errors.append('Target date is required')
    else:
        try:
            parsed_date = datetime.strptime(target_date, '%Y-%m-%d')
            if parsed_date <= datetime.now():
                errors.append('Target date must be in the future')
        except ValueError:
            errors.append('Invalid target date format')
    
    return errors

# completed goal check
# if total sum of savings for goal == goal.amount , the goal is completed
# query must also capture goals that have no savings input as well. *COALESCE
@goals_bp.route('/completed', methods=['GET'])
@auth_required()
def get_completed_goals():
    """Check if user has any completed goals and return info about them"""
    user_id = session.get('id')
    cursor = db.get_cursor()
    cursor.execute("""SELECT g.*, COALESCE(sum(s.amount), 0 )as amount_saved FROM goals as g
                    LEFT Join savings as s on s.goal_id = g.goal_id
                    WHERE user_id = %s
                    Group by goal_id;""",(user_id,))
    goals= cursor.fetchall()
    
    completed_goals = []
    current_date = datetime.now().date()
    
    for goal in goals:
        if goal['amount'] == goal['amount_saved']:
            try:
                #update the goal completed status to true in db 
                cursor.execute("""UPDATE goals SET completed = TRUE, completed_at = %s
                WHERE goal_id = %s""", (current_date, goal['goal_id'],))
            except Exception as e:
                print(f'Error updating goal to completed status: {e}')
            # if Goal is completed, check if it was completed before or after target date
            if current_date <= goal['target_date']:
                completed_goals.append({
                    'goal': goal['description'],
                    'status': 'completed_on_time',
                    'message': f'Goal "{goal["description"]}" is completed on time (before or on target date)'
                })
            else:
                completed_goals.append({
                    'goal': goal['description'],
                    'status': 'completed_late',
                    'message': f'Goal "{goal["description"]}" is completed late (after target date)'
                })
    
    if completed_goals:
        return jsonify({
            'message': 'Completed goals',
            'completed_goals': completed_goals,
            'total_completed': len(completed_goals)
        }), 200
    else:
        return jsonify({
            'message': 'No completed goals'
        }), 200
