from flask import Flask, jsonify, session, send_from_directory, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import db, connect
from wrapper import login_required
from blueprints.auth import auth_bp
from blueprints.user import user_bp
from blueprints.expenses import expenses_bp
from blueprints.savings import savings_bp
from blueprints.goals import goals_bp
from blueprints.charts import charts_bp
from blueprints.whatif import whatif_bp
from blueprints.tips import analyze_income_expenses, analyze_savings_progress, analyze_expense_categories, analyze_weekend_spending, save_tips, get_general_saving_tips
import os


app = Flask(__name__)
app.secret_key = connect.SECRET_KEY
app.config['SESSION_COOKIE_SAMESITE'] = connect.SESSION_COOKIE_SAMESITE
app.config['SESSION_COOKIE_SECURE'] = connect.SESSION_COOKIE_SECURE
app.config['DEBUG'] = connect.DEBUG
app.config['SESSION_COOKIE_HTTPONLY'] = False

CORS(app, 
     supports_credentials=True,  # Allow credentials for session management
     origins=connect.ALLOWED_ORIGINS,  # Allow frontend origin
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'])
bcrypt = Bcrypt(app) 
print("ALLOWED_ORIGINS:", connect.ALLOWED_ORIGINS)
# Initialize DB connection parameters 
db.init_db(app,
           user=connect.dbuser,
           password=connect.dbpass,
           host=connect.dbhost,
           database=connect.dbname,
           port=int(connect.dbport))

app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(expenses_bp)
app.register_blueprint(savings_bp)
app.register_blueprint(goals_bp)
app.register_blueprint(charts_bp)
app.register_blueprint(whatif_bp)
#Dashboard endpoint should include these components:
    #Goal summary of user - all goals, number of goals, progress of goal, how much left to save
    #Total savings of user - total amount 
    #tip - always generate tips for user, even if there are no goals. 
    #scenario saved by user, with the best 3 most savings scenario. 
@app.route('/api/dashboard', methods=['GET'])   
@login_required()
def dashboard():
    user_id = session.get('id')
    username = session.get('username')
    print(f"Dashboard accessed by user_id: {user_id} : {username}")
    
    if not user_id:
        return jsonify({"error": "User not authenticated"}), 401
    
    response = None
    
    # retrieve all savings and goals for specific user
    try: 
        cursor = db.get_cursor()
        
        # check if the user has any goals
        cursor.execute("""SELECT COUNT(*) as goal_count FROM goals WHERE user_id = %s""", (user_id,))
        goal_count = cursor.fetchone()['goal_count']
        print(f"User has {goal_count} goals")
        
        if goal_count == 0:
            # Still generate tips even if no goals
            all_tips = []
            tips_info = []
            try:
                income_expense_tips = analyze_income_expenses(user_id)
                all_tips.extend(income_expense_tips)
                category_tips = analyze_expense_categories(user_id)
                all_tips.extend(category_tips)
                weekend_tips = analyze_weekend_spending(user_id)
                all_tips.extend(weekend_tips)
                
                # If no specific tips were generated, add general tips
                if len(all_tips) == 0:
                    general_tips = get_general_saving_tips()
                    all_tips.extend(general_tips)
                    print(f"No specific tips found, adding {len(general_tips)} general tips for user {user_id}")
                
                tips_info = save_tips(user_id, all_tips)
                print(f"Successfully generated {len(all_tips)} tips for user {user_id} (no goals)")
            except Exception as e:
                print(f"Error generating tips for user {user_id}: {str(e)}")
                all_tips = []
                tips_info = []
            
            response = jsonify({
                "message": "No goals found for user", 
                "data": [],
                "total_savings": 0,
                "goal_progress": [],
                "tips": tips_info,
                "tips_count": len(tips_info)
            }), 200
        
        # fetch user savings and goals
        cursor.execute("""SELECT s.*, g.amount as goal_amount, g.user_id, g.description, g.target_date, g.created_at,g.completed
                        FROM savings as s
                        INNER JOIN goals as g ON s.goal_id = g.goal_id
                        WHERE g.user_id = %s""", (user_id,))
        user_info = cursor.fetchall()
        
        # total savings per user
        cursor.execute("""SELECT COALESCE(SUM(s.amount), 0) AS total_savings
                        FROM savings as s 
                        INNER JOIN goals as g on s.goal_id=g.goal_id
                        WHERE g.user_id=%s""", (user_id,))
        total_savings_result = cursor.fetchone()
        total_savings = total_savings_result['total_savings'] if total_savings_result else 0
        
        # each goal progress
        cursor.execute("""SELECT g.goal_id, g.description, g.amount as goal_amount, 
                        COALESCE(SUM(s.amount), 0) as goal_saving, 
                        g.target_date, g.created_at,g.completed 
                        FROM goals as g
                        LEFT JOIN savings as s on s.goal_id = g.goal_id
                        WHERE g.user_id=%s
                        GROUP BY g.goal_id, g.description, g.amount, g.target_date, g.created_at
                        Order by g.target_date """, (user_id,))
        each_goal_progress = cursor.fetchall()
        # check if goal is completed
        cursor.execute("""SELECT g.*, COALESCE(SUM(s.amount), 0) as amount_saved FROM goals as g
                LEFT JOIN savings as s on s.goal_id = g.goal_id
                WHERE g.user_id = %s
                GROUP BY g.goal_id
                Order by g.target_date """, (user_id,))

        all_goals = cursor.fetchall()
        completed_goals = []

        for goal in all_goals:
            if goal['amount'] == goal['amount_saved']:
                completed_goals.append(goal)
        
        # Calculate percentage for each goal
        for goal in each_goal_progress:
            goal_saving = goal['goal_saving'] or 0
            goal_amount = goal['goal_amount'] or 0
            
            if goal_amount > 0:
                percentage = min((goal_saving / goal_amount) * 100, 100)
            else:
                percentage = 0
                
            goal['percentage'] = round(percentage, 1)
        # remaining amount to save
        for goal in each_goal_progress:
            goal_remaining =goal['goal_amount'] - goal['goal_saving']
            goal['goal_remaining'] = goal_remaining
        
        print("Each goal progress with percentages:", each_goal_progress)
        
    # summary of the best scenario (most savings) to least savings

        cursor.execute ("""SELECT 
                        wis.scenario_id,
                        wis.name,
                        wis.goal_id,
                        SUM(wia.original_amt - wia.new_amt) AS total_saving_amt,
                        wis.created_at AS formatted_date
                    FROM whatifadjustment AS wia
                    INNER JOIN whatifscenario AS wis 
                        ON wis.scenario_id = wia.scenario_id
                    WHERE wis.user_id = %s
                    GROUP BY wis.scenario_id, wis.name, wis.goal_id, wis.created_at
                    ORDER BY total_saving_amt DESC 
                    LIMIT 3; """, (user_id,))
        best_scenario = cursor.fetchall()
        if best_scenario == []:
            best_scenario = []

        # Always generate fresh tips every time user visits dashboard
        print(f"DEBUG: Generating fresh tips for user {user_id}")
        all_tips = []
        try:
            income_expense_tips = analyze_income_expenses(user_id)
            all_tips.extend(income_expense_tips)
            savings_tips = analyze_savings_progress(user_id)
            all_tips.extend(savings_tips)
            category_tips = analyze_expense_categories(user_id)
            all_tips.extend(category_tips)
            weekend_tips = analyze_weekend_spending(user_id)
            all_tips.extend(weekend_tips)
            # If no specific tips were generated, use general tips
            if len(all_tips) == 0:
                general_tips = get_general_saving_tips()
                print(f"DEBUG: No specific tips generated, using {len(general_tips)} general tips")
                all_tips.extend(general_tips)

            # Save all tips to db
            tips_info = save_tips(user_id, all_tips)

        except Exception as e:
            print(f"Error generating tips for user {user_id}: {str(e)}")
            tips_info = []  # Don't fail dashboard if tips generation fails
       
        if not user_info:
            return jsonify({
                "message": "No savings found for goals", 
                "data": [],
                "total_savings": total_savings,
                "goal_progress": each_goal_progress,
                "best_scenario": best_scenario,
                "tips": tips_info,
                "tips_count": len(tips_info),
                "completed_goals": completed_goals,
                "completed_goals_count": len(completed_goals)
                
            }), 200

        return jsonify({
            "message": "Data retrieved successfully", 
            "data": user_info,
            "total_savings": total_savings,
            "goal_progress": each_goal_progress,
            "goal_count": goal_count,
            "best_scenario": best_scenario,
            "tips": tips_info,
            "tips_count": len(tips_info),
            "completed_goals": completed_goals,
            "completed_goals_count": len(completed_goals)
            
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Dashboard data retrieval failed: {str(e)}"}), 500

# user can dismiss or read/complete the tip - this will save the interaction in the db
# users can choose to ignore the tips, it is just a general PSA feature.
@app.route('/api/tips/interact', methods=['POST'])
@login_required()
def interact_with_tip():
    try:
        user_id = session.get('id')
        data = request.get_json()
        tip_id = data.get('tip_id')
        action = data.get('action')

        cursor = db.get_cursor()
        cursor.execute("""INSERT INTO user_tip_interactions (tip_id, user_id, action)
                        VALUES (%s, %s, %s)
                        """, (tip_id, user_id, action))
        if action == 'dismissed':
            cursor.execute ("""UPDATE tips as t
            JOIN user_tip_interactions as ti on ti.tip_id = t.tip_id
            SET is_active = 0 
            where t.tip_id =%s; """, (tip_id,))
           
        return jsonify({'success': True, 'message': 'Tip interaction saved'})
    except Exception as e:
        print(f"Error saving tip interaction: {str(e)}")
        return jsonify({'error': f'Failed to save tip interaction: {str(e)}'}), 500


# reference: https://stackoverflow.com/questions/44209978/serving-a-front-end-created-with-create-react-app-with-flask
# https://flask.palletsprojects.com/en/latest/api/#flask.send_from_directory
# IMPT required for deployment
# Serve React static files - this must be the LAST route to avoid intercepting API calls
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # Skip API routes 
    if path.startswith('api/') or path.startswith('auth/'):
        return jsonify({"error": f"API route '{path}' not found"}), 404
    
    # For PA deployment - build folder should be in backend directory
    build_dir = 'build'
    
    # Try to find the build directory in different possible locations
    build_paths = [
        'build',  # If build is in the same directory as app.py (PA deployment)
        '../frontend/build',  # If build is in frontend directory (local development)
        '../../frontend/build',  # If we're deeper in the directory structure
        os.path.join(os.path.dirname(__file__), '..', 'frontend', 'build'),  # Absolute path
        os.path.join(os.path.dirname(__file__), 'build')  # Absolute path in same directory
    ]
    
    build_dir = None
    for build_path in build_paths:
        if os.path.exists(build_path):
            build_dir = build_path
            break
    
    # Fallback to default if no build directory found
    if build_dir is None:
        build_dir = 'build'  # Default for PA deployment
    
    if not os.path.exists(build_dir):
        # If no build directory found, return a helpful error
        return jsonify({
            "error": "React build files not found. Please ensure the frontend is built and the build directory is accessible.",
            "build_path": build_dir
        }), 500
    
    # Handle static files
    if path.startswith('static/'):
        return send_from_directory(build_dir, path)
    
    # Handle other files that exist
    if path != "" and os.path.exists(os.path.join(build_dir, path)):
        return send_from_directory(build_dir, path)
    
    # For all other routes, serve index.html (React Router)
    return send_from_directory(build_dir, 'index.html')


if __name__ == "__main__":
    app.run(debug=True, host='localhost', port=5000)
