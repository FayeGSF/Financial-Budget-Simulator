from functools import wraps
from flask import request, redirect, url_for, session, flash, render_template, jsonify
import db
from datetime import datetime

def login_required():
    # checks if user is logged in and has the correct role
    def decorator_login(f):
        @wraps(f)
        # when the route is accessed or denied
        def decorated_function (*args, **kwargs):
            if 'loggedin' not in session:   
                return jsonify({'error': 'Authentication required', 'authenticated': False}), 401
            if session.get('status') == 'inactive':
                session.clear()
                return jsonify({'error': 'Account inactive', 'authenticated': False}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator_login

def auth_required():
    """Decorator for API endpoints that require authentication"""
    def decorator_auth(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'loggedin' not in session:
                return jsonify({
                    'error': 'Authentication required',
                    'authenticated': False
                }), 401
            
            if session.get('status') == 'inactive':
                session.clear()
                return jsonify({
                    'error': 'Account inactive',
                    'authenticated': False
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator_auth


def get_current_user():
    """Helper function to get current user data from session"""
    if 'loggedin' in session and session.get('status') == 'active':
        return {
            'user_id': session.get('id'),
            'username': session.get('username'),
            'authenticated': True
        }
    return {'authenticated': False}

# check if user has an income and
# check if user has entered any FE
# else prompt user to enter for more accurate predictions/results


def has_income_and_fixed_expenses(user_id):
    """
    Check if user has both income and fixed expenses entered.
    Returns True if user has at least one income record AND one fixed expense record.
    Returns False if either is missing, which should trigger a dismissible alert.
    """
    try:
        cursor = db.get_cursor()
        
        # Check for fixed expenses
        cursor.execute("SELECT COUNT(*) as count_fe FROM fixedexpenses WHERE user_id = %s", (user_id,))
        count_fe = cursor.fetchone()['count_fe']
        print(f"Fixed expenses count: {count_fe}")
        
        # Check for income
        cursor.execute("SELECT COUNT(*) as count_income FROM income WHERE user_id = %s", (user_id,))
        count_income = cursor.fetchone()['count_income']
        print(f"Income count: {count_income}")

        # Return True only if user has BOTH income and fixed expenses
        has_both = count_income > 0 and count_fe > 0
        print(f"User has both income and fixed expenses: {has_both}")
        
        return has_both
       
    except Exception as e:
        print(f"Error checking income and fixed expenses: {e}")
        return False

