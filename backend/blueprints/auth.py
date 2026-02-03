from flask import Blueprint, request, jsonify, session, current_app
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import db
from wrapper import auth_required, get_current_user, has_income_and_fixed_expenses
import re
from extensions import bcrypt
from MySQLdb.cursors import DictCursor

# Create blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get ('confirm_password')

    # set error
    username_error = None
    email_error = None
    password_error = None
    
    # username constraints
    if len(username or "") < 3:
        username_error = 'Username must be at least 3 characters long'
    elif len(username or "") > 20:
        username_error = 'Username must be less than 20 characters long'
    elif not re.match(r'^[a-zA-Z0-9]+$', username):
        username_error = 'Username must contain only letters and numbers'
    
    # check email constraints
    if len(email or "") > 255:
        email_error = 'Email must be less than 255 characters'
    elif not re.fullmatch(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        email_error = 'Invalid email address'
    
    # check password constraints
    if len(password or "") < 8:
        password_error = 'Password must be at least 8 characters long'
    elif not re.match(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$', password):
        password_error = 'Password must contain at least one letter, one number, and one special character'
    elif password != confirm_password:
        password_error = 'Passwords do not match'    
    
    # Check if there are any validation errors
    if username_error or email_error or password_error:
        errors = {}
        if username_error:
            errors['username'] = username_error
        if email_error:
            errors['email'] = email_error
        if password_error:
            errors['password'] = password_error
        return jsonify({'errors': errors}), 400
        
    if not all([username, firstname, lastname, email, password]):
        return jsonify({'error': 'Missing fields'}), 400
    
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    try:
        # Use a single database connection for the entire operation
        cursor = db.get_cursor()
        # Check if username already exists
        cursor.execute("SELECT * FROM user WHERE username = %s", (username,))
        username_exists = cursor.fetchone() is not None
        
        if username_exists:
            return jsonify({'errors': {'username': 'Username already exists'}}), 400
        
        # Insert new user
        cursor.execute("""
            INSERT INTO user (username, firstname, lastname, email, password_hash)
            VALUES (%s, %s, %s, %s, %s)
        """, (username, firstname, lastname, email, password_hash))
        
        return jsonify({'message': 'User registered successfully'}), 201
        
    except Exception as e:
        print('Registration error:', str(e))
       
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Missing Fields'}), 400
    try:
        conn = db.get_db()
        cursor = conn.cursor(cursorclass=DictCursor)
        cursor.execute("SELECT * from user WHERE username = %s", (username,))
        user = cursor.fetchone()
        if user is None:
            return jsonify({'error': 'Invalid username or password'}), 401
    #  check for user case sensitivity
        if user['username'] != username:
            return jsonify({'error': 'Incorrect username (case sensitive)'}), 401
        if not bcrypt.check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Invalid username or password'}), 401

        session['loggedin'] = True
        session['id'] = user['user_id']
        session['username'] = user['username']
        session['status'] = 'active'
        print(f"Session set successfully: {dict(session)}")
        
        # Check if user has income and fixed expenses for accurate predictions
        has_complete_data = has_income_and_fixed_expenses(user['user_id'])
        
        response_data = {
            'message': 'Login successful',
            'user': {
                'user_id': user['user_id'],
                'username': user['username'],
                'firstname': user['firstname'],
                'lastname': user['lastname'],
                'email': user['email']
            }
        }
        
        # Add alert information if user is missing financial data
        if not has_complete_data:
            response_data['show_alert'] = True
            response_data['alert_message'] = 'Please add your income and fixed expenses for more accurate predictions and better financial insights.'
            response_data['alert_type'] = 'info'
        
        return jsonify(response_data)
    except Exception as e:
        print("Login error:", str(e))
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    response = jsonify({'message': 'Logged out successfully'}), 200
    response[0].headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response[0].headers['Pragma'] = 'no-cache'
    response[0].headers['Expires'] = '0'
    return response

@auth_bp.route('/session-check', methods=['GET'])
def session_check():
    user_data = get_current_user()
    if user_data['authenticated']:
        return jsonify({
            'authenticated': True,
            'session_data': user_data
        }), 200
    else:
        return jsonify({
            'authenticated': False,
            'session_data': None
        }), 401

@auth_bp.route('/check-user-data', methods=['GET'])
@auth_required()
def check_user_data():
    """Check if user has income and fixed expenses for alert display"""
    try:
        user_id = session.get('id')
        has_complete_data = has_income_and_fixed_expenses(user_id)
        
        if not has_complete_data:
            return jsonify({
                'show_alert': True,
                'alert_message': 'OOPS! We are missing details about your income and/or fixed expenses.',
                'alert_type': 'info'
            }), 200
        else:
            return jsonify({
                'show_alert': False
            }), 200
            
    except Exception as e:
        print(f"Error checking user data: {e}")
        return jsonify({'error': 'Failed to check user data'}), 500

