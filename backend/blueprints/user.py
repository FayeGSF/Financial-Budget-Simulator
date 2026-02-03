from flask import Blueprint, request, jsonify, session, current_app
from wrapper import auth_required
import db
from MySQLdb.cursors import DictCursor
import re
from extensions import bcrypt
from .whatif import income_convert
user_bp = Blueprint('user', __name__, url_prefix='/user')

@user_bp.route('/profile', methods=['GET'])
@auth_required()
def user_profile():
    user_id = session.get('id')
    cursor = db.get_cursor()
    cursor.execute("""SELECT u.user_id, u.username, u.firstname, u.lastname, u.email 
                    FROM user as u
                    WHERE u.user_id = %s""", (user_id,))
    user_data = cursor.fetchone()
    return jsonify({'data': user_data}), 200

@user_bp.route('/update', methods=['PUT'])
@auth_required()
def update_profile():
    user_id = session.get('id')
    data = request.get_json()
    username = data.get('username')
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    confirm_new_password = data.get('confirm_new_password')
    email=data.get('email')

    # Check if required fields are provided
    if not username or not firstname or not lastname or not email:
        return jsonify({'error': 'Username, firstname, lastname, and email are required'}), 400

    # Build update fields and values
    update_fields = []
    update_values = []
    cursor = db.get_cursor()

    # validate username
    if not re.match(r'^[a-zA-Z0-9]+$', username):
        return jsonify({'error': 'Username must contain only letters and numbers'}), 400
    # Check if username is already taken by another user  
    cursor.execute("SELECT user_id FROM user WHERE username = %s AND user_id != %s", (username, user_id))
    existing_user = cursor.fetchone()
    if existing_user:
        return jsonify({'error': 'Username is already taken'}), 400
    update_fields.append('username = %s')
    update_values.append(username)
    session['username'] = username

    update_fields.append('firstname = %s')
    update_values.append(firstname)

    update_fields.append('lastname = %s')
    update_values.append(lastname)

    # email validation logic
    if len(email) > 255:
        return jsonify({'error': 'Email must be less than 255 characters'}), 400
    elif not re.fullmatch(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        return jsonify({'error': 'Invalid email address'}), 400
    update_fields.append('email = %s')
    update_values.append(email)

    # Password validation logic
    if new_password or confirm_new_password:
        # Require old password when changing password
        if not old_password:
            return jsonify({'error': 'Current password is required to change password'}), 400
        
        # Verify old password is correct
        cursor.execute("SELECT password_hash FROM user WHERE user_id = %s", (user_id,))
        stored_password = cursor.fetchone()
        if not stored_password:
            return jsonify({'error': 'User not found'}), 400
        if not bcrypt.check_password_hash(stored_password['password_hash'], old_password):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Validate new password fields
        if not (new_password and confirm_new_password):
            return jsonify({'error': 'Both new password and confirm password are required to change password'}), 400
        if new_password != confirm_new_password:
            return jsonify({'error': 'New password and confirm password do not match'}), 400
        if old_password == new_password:
            return jsonify({'error': 'New password cannot be the same as current password'}), 400
        if len(new_password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Use bcrypt to generate password hash
        password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        update_fields.append('password_hash = %s')
        update_values.append(password_hash)
    
    update_values.append(user_id)
    try:
        cursor = db.get_cursor()
        cursor.execute(f"""
            UPDATE user
            SET {', '.join(update_fields)}
            WHERE user_id = %s
        """, update_values)
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        print('Error updating profile:', e)
        return jsonify({'error': f'Profile update failed: {str(e)}'}), 500

# user income
@user_bp.route('/income', methods=['GET'])
@auth_required()
def get_user_income():
    user_id = session.get('id')
    cursor = db.get_cursor()
    
    if request.method == 'GET':
        # GET request - fetch existing income
        cursor.execute("""SELECT * FROM income WHERE user_id = %s""", (user_id,))
        income = cursor.fetchall()
        total_income = income_convert()
        print("Income fetched from DB:", income)
        print("Total Income:", total_income )
        return jsonify({
        'income': income,
        'total_income': total_income}), 200

# add income 
@user_bp.route ('/add_income', methods =['POST'])
@auth_required()
def add_income():
    user_id=session.get('id')
    data =request.get_json ()
    amount= data.get('amount')
    frequency = data.get ('frequency')
    comment = data.get('comment', '')  # Optional comment field
    errors= validate_income (amount, frequency)
    if errors:
        return jsonify ({'error': errors}),400
    try: 
        cursor = db.get_cursor()
        cursor.execute("""INSERT INTO income (user_id, amount, frequency, comment) VALUES (%s, %s, %s, %s)""", 
        (user_id, amount, frequency, comment,))
        
        return jsonify ({'message' : 'Income added successfully'}),201
    except Exception as e:
        print ('Error in adding income: ', e)
        return jsonify ({'error' : f'Failed to add income: {str(e)}'}),500
# edit income
@user_bp.route('/edit_income', methods=['PUT'])
@auth_required()
def edit_user_income():
    user_id = session.get('id')
    data = request.get_json()
    amount = data.get('amount')
    frequency = data.get('frequency')
    comment = data.get('comment', '')  # Optional comment field
    errors= validate_income (amount, frequency)
    if errors:
        return jsonify ({'error': errors}),400
    cursor = db.get_cursor()
    try:
        cursor.execute("""UPDATE income SET amount = %s, frequency = %s, comment = %s WHERE user_id = %s""", 
        (amount, frequency, comment, user_id,))
        
        return jsonify({'message': 'Income updated successfully'}), 200
    except Exception as e:
        print('Error in modifying income:', e)
        return jsonify({'error': f'Income update failed: {str(e)}'}), 500


# delete income
@user_bp.route('/delete_income', methods =['DELETE'])
@auth_required ()
def delete_income ():
    user_id = session.get('id')
    data = request.get_json()
    income_id = data.get('income_id')
    try:
        conn = db.get_db()
        cursor = db.get_cursor()
        # check if income exists
        cursor.execute ("""SELECT * from income 
        where user_id =%s AND income_id =%s; """, (user_id, income_id,))
        user_income= cursor.fetchone()
        if not user_income:
            return jsonify ({'error': 'Income not found or access denied'}), 404
        cursor.execute ( """DELETE FROM income WHERE income_id =%s and user_id = %s; """, (income_id, user_id,))
        return jsonify({'message': 'Income deleted successfully'}), 200
    except Exception as e:
        print('Error deleting income:', e)
        return jsonify({'error': f'Failed to delete income: {str(e)}'}), 500

# helper function for validation
def validate_income(amount, frequency):
    errors =[] 
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
    if not frequency:
        errors.append('Income frequency is required')
    return errors
    
