from . import utils
from flask import Blueprint, request, jsonify, session
from wrapper import auth_required
import db
from datetime import datetime

charts_bp = Blueprint('charts', __name__, url_prefix='/charts')
# chart showing monthly expense by category
@charts_bp.route('/monthly_category_expenses', methods=['GET'])
@auth_required()
def monthly_category_expenses():
    user_id = session.get('id')
    month = request.args.get('month')
    monthly_category_expenses = utils.get_expenses_by_month_and_category(user_id, month)
    print('Monthly category expenses fetched from DB:', monthly_category_expenses)
    
    return jsonify({'monthly_category_expenses': monthly_category_expenses}), 200


# show total monthly expenses so far
@charts_bp.route('/total_monthly_expenses', methods=['GET'])
@auth_required()
def total_monthly_expenses():
    user_id = session.get('id')
    month = request.args.get('month')
    total_monthly_expenses = utils.total_expenses_by_month(user_id, month)
    print('Total monthly expenses fetched from DB:', total_monthly_expenses)
    return jsonify({'total_monthly_expenses': total_monthly_expenses}), 200
    # calculate monthly difference
    # 1. make sure a month is selected.
    # 2. make sure there are at least 2 months in the list to compare
    # 3. if no months are selected or less than 2 months available, return 0


@charts_bp.route('/monthly_expense_difference', methods=['GET'])
@auth_required()
def monthly_expense_difference():
    user_id = session.get('id')
    month = request.args.get('month')
    cursor = db.get_cursor()
    cursor.execute("""SELECT DATE_FORMAT(MIN(e.date), '%%M-%%Y') AS month_year,
                            SUM(e.amount) AS total_amt
                        FROM expenses AS e
                        WHERE e.user_id = %s
                        GROUP BY YEAR(e.date), MONTH(e.date)
                        ORDER BY YEAR(e.date), MONTH(e.date); """,(user_id,))
    monthly_expenses = cursor.fetchall()
    print('Monthly expenses fetched from DB:', monthly_expenses)

    # Check if a month is selected
    if not month or month == '':
        return jsonify({'monthly_difference': 'No month selected'}), 200
    
    # If month is selected, check if there's enough a previous month to compare
    if monthly_expenses and len(monthly_expenses) >= 2:
        # Find the index of the selected month
        selected_month_index = None
        for i, expense in enumerate(monthly_expenses):
            if expense['month_year'] == month:
                selected_month_index = i
                break
        
        # Check if selected month exists and has a previous month to compare with
        if selected_month_index is not None and selected_month_index > 0:
            current_month = float(monthly_expenses[selected_month_index]['total_amt'] or 0)
            previous_month = float(monthly_expenses[selected_month_index - 1]['total_amt'] or 0)
            monthly_difference = current_month - previous_month
            return jsonify({'monthly_difference': monthly_difference}), 200
        else:
            return jsonify({'monthly_difference': 'Not enough data to compare'}), 200
    else:
        return jsonify({'monthly_difference': 'Not enough data to compare'}), 200




