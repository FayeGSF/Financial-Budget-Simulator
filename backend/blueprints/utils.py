from flask import session
import db

# helper function to get user expenses with category name
def get_user_expenses(user_id):
    cursor = db.get_cursor()
    cursor.execute("""SELECT e.expense_id, e.user_id, e.amount, e.category_id, e.description, 
                             e.date, c.cat_name 
                      FROM expenses AS e
                      LEFT JOIN categories AS c ON e.category_id = c.category_id
                      WHERE user_id = %s
                      ORDER BY e.date DESC;""", (user_id,))
    expenses = cursor.fetchall()
    
    # Format dates 
    for expense in expenses:
        if expense['date']:
            expense['date'] = expense['date'].strftime('%d/%m/%Y')
        
    
    return expenses

def get_expenses_by_category():
    user_id = session.get('id')
    cursor = db.get_cursor()
    cursor.execute("""SELECT c.cat_name, SUM(e.amount) AS total_amount FROM expenses as e
                    Inner join categories as c on e.category_id =c.category_id
                    WHERE user_id = %s
                    GROUP BY e.category_id;""", (user_id,))
    return cursor.fetchall()

def get_expenses_by_month_and_category(user_id, month):
    cursor = db.get_cursor()
    
    if month and month != '':
        # If month is filtered, then include month in query
        cursor.execute("""SELECT 
                        c.cat_name, 
                        DATE_FORMAT(e.date, '%%M-%%Y') AS month_year, 
                        SUM(e.amount) AS total_amount
                        FROM expenses AS e
                        INNER JOIN categories AS c ON e.category_id = c.category_id
                        WHERE e.user_id = %s
                        AND DATE_FORMAT(e.date, '%%M-%%Y') = %s
                        GROUP BY e.category_id, month_year
                        Order by total_amount DESC;""", (user_id, month,))
    else:
        # If no month provided, get all expenses grouped by category
        cursor.execute("""SELECT 
                        c.cat_name, 
                        'All Time' AS month_year, 
                        SUM(e.amount) AS total_amount
                        FROM expenses AS e
                        INNER JOIN categories AS c ON e.category_id = c.category_id
                        WHERE e.user_id = %s
                        GROUP BY e.category_id
                        Order by total_amount DESC;""", (user_id,))
    
    month_category_expenses = cursor.fetchall()
    return month_category_expenses or []

# total expenses
def get_total_expenses():
    user_id = session.get('id')
    conn = db.get_db()
    cursor = db.get_cursor()
    cursor.execute("""SELECT SUM(e.amount) AS total_amt
                    FROM expenses AS e
                    WHERE e.user_id = %s;""", (user_id,))
    row = cursor.fetchone()
    return row['total_amt'] or 0
# total expense by month
def total_expenses_by_month(user_id, month):
    user_id = session.get('id')
    cursor = db.get_cursor()
    if month and month != '':
        # If month is filtered, then include month in query
        cursor.execute("""SELECT DATE_FORMAT(e.date, '%%M-%%Y') AS month_year,
                        SUM(e.amount) AS total_amt
                        FROM expenses AS e
                        WHERE e.user_id = %s
                        AND DATE_FORMAT(e.date, '%%M-%%Y') = %s
                        GROUP BY month_year; """,(user_id, month,))
    else:
        # if no month filtered then show total expenses for all months
        cursor.execute("""SELECT DATE_FORMAT(MIN(e.date), '%%M-%%Y') AS month_year,
                            SUM(e.amount) AS total_amt
                        FROM expenses AS e
                        WHERE e.user_id = %s
                        GROUP BY YEAR(e.date), MONTH(e.date)
                        ORDER BY YEAR(e.date), MONTH(e.date); """,(user_id,))
    total_monthly_expenses = cursor.fetchall()
    return total_monthly_expenses


def selected_month():
    user_id = session.get('id')
    conn = db.get_db()
    cursor = db.get_cursor()
    cursor.execute("""SELECT DATE_FORMAT(date,'%%M-%%Y') as month_year
    FROM expenses WHERE user_id = %s 
    GROUP BY month_year ORDER BY MIN(date) DESC;""", (user_id,))
    filter_months = cursor.fetchall()
    print('Filter months fetched from DB:', filter_months)
    # Format dates so it can be passed on to frontend, if not error.
    # use month to pass into frontend and as parameter
    return [month['month_year'] for month in filter_months]

def get_user_expenses_by_month(user_id, month):
    cursor = db.get_cursor()
    cursor.execute("""SELECT e.expense_id, e.user_id, e.amount, e.category_id, e.description, 
                             e.date, c.cat_name 
                      FROM expenses AS e
                      LEFT JOIN categories AS c ON e.category_id = c.category_id
                      WHERE e.user_id = %s AND date_format( e.date, '%%M-%%Y') = %s
                      ORDER BY e.date DESC;""", (user_id, month))
    filtered_expenses = cursor.fetchall()
    # Format dates consistently with get_user_expenses function
    for expense in filtered_expenses:
        if expense['date']:
            expense['date'] = expense['date'].strftime('%d/%m/%Y')
    
    return filtered_expenses

