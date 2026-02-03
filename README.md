# Financial Budget Simulator
## Setup
### 1. Pre-requisites / Software
* Python 3.9 or higher
* MySQL 8.0 or higher
* MySQL Workbench
* Node.js 16 or higher
* PythonAnywhere (at least Free-tier user account)
### 2. System Requirements
* Operating System - Windows 10/11, macOs
### 3. Clone repository onto 
* `git clone` https://github.com/COMP693-Projects-25S2/COMP693_25S2_project_Shu_Fen_Goh_1162340.git

* Navigate to project directory and open in IDE

### 4. Environment Setup
#### Backend
* create template for local & Production backend config 
    * backend/env.local
    * backend/env.production
* create actual .env file & both local and production .env files and copy these 

    ** Database Configuration **<br>
    *Note: Replace credentials*<br>
   `DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_NAME=expense_tracker
   DB_PORT=3306`

   **Flask Configuration** <br>
   `SECRET_KEY=your_very_secure_secret_key_here
   FLASK_DEBUG=True`

   **CORS Configuration**<br>
   *Note: URLs will be based on your local settings*<br>
   `ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`

   **Session Configuration**<br>
   `SESSION_COOKIE_SECURE=False
   SESSION_COOKIE_SAMESITE=Lax`


#### Frontend
* create .env file and a .env.production<br>
    * Navigate to frontend `cd frontend`

    * .env file contains these:*
    `REACT_APP_API_URL=http://localhost:5000
    REACT_APP_PRODUCTION_API_URL=https://fayegoh1162340.pythonanywhere.com`

    * .env.production contain this:
    `REACT_APP_API_URL=https://fayegoh1162340.pythonanywhere.com/`
* Install Node.js dependencies<br>
    * `npm install`

### 5. Database 
* Create `connect.py` file and update with these credentials: <br>
```import os
from dotenv import load_dotenv
load_dotenv()

dbuser = os.getenv('DB_USER', 'root')
dbpass = os.getenv('DB_PASSWORD', 'your_mysql_username')
dbhost = os.getenv('DB_HOST', 'localhost')
dbname = os.getenv('DB_NAME', 'expense_tracker')
dbport = os.getenv('DB_PORT', '3306')

# Flask configuration
SECRET_KEY = os.getenv('SECRET_KEY', 'EXPENSETRACKER')
DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

# CORS configuration
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,https://fayegoh1162340.pythonanywhere.com').split(',')

# Session configuration
SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
SESSION_COOKIE_SAMESITE = os.getenv('SESSION_COOKIE_SAMESITE', 'None')`
```
* Create database in MySQL workbench
    * Run `create_script.sql`
    * Import and run sample data  `populate.sql`
### 6. Start server 
* Create virtual environment and activate venv<br>

    * navigate to backend through bash: `cd backend`
    * `python -m venv venv` or `python3 -m venv venv`
    * `venv\Scripts\activate` or if on mac: `source venv/bin/activate`
* Install requirements
    * `pip install -r requirements.txt`
*Ensure virtual environment is activated*
* Backend: `python app.py`
    * The backend will be available at: `http://localhost:5000`
* Frontend(Local): `npm start`
    *    The frontend will be available at: `http://localhost:3000`

#### Ensure to add .env files and .connect.py into gitignore


### 7. Deployment
* Navigate [here](https://fayegoh1162340.pythonanywhere.com/) or URL: https://fayegoh1162340.pythonanywhere.com/



### 8. User Accounts

* Accounts with preset data <br>
| Username | Password|
|----------|---------|
|User01|Password123!|
|User02|Password123!|
|User03|Password123!|

* Other accounts<br>
| Username | Password|
|----------|---------|
|User04|Password123!|
|User05|Password123!|
|User06|Password123!|
|User07|Password123!|
|User08|Password123!|
|User09|Password123!|
|User10|Password123!|

### 9. Navigating the site
* Register or log in using one of the provided accounts in section 8 (recommend User01, User02 or User03)
* If using a new account, enter Income and Fixed expenses in the `Profile` tab
    * Edit Profile details
    * Add at least one or multiple income streams
    * Add at least one or multiple fixed expenses (eg.rent, power, mobile)
* Add expenses by navigating to the `Expenses` tab
    * Create a new category, if desired
    * With each expenses added, summary cards comparing spending from previous month( if available ) and remaining amount for the month.
* Navigate to `Dashboard` to view summary of user's savings/amount remaining for the month, tips, saved scenarios etc. 
    * Tips are generated based on user's input information
    * `Dismiss` or `Read` tips 
* Create personal goals in `Goals` and add savings in `Savings`
    * Completed goals will be filtered into the `Completed Goals` section
    * View details of your completed goals - if goals were completed on time early.
* In `Scenario Playground` tab, create scenario to visualise potential savings or additional spendings in the chosen month <br>

        **Note: Scenario Playground is disabled if there is no Income, Fixed Expenses or Expenses input. Users MUST have the required fields**<br>

    * Follow the steps as a guide. 
    * For additional tips, click on the need help tool on the right-hand of the screen for more helpful tips. 
    * Save a scenario you have created and view the details in Step 5 
* `Log out` when ready

### Additional Information : Manually Deploying from GitHub (GH) to PythonAnywhere (PA)
* If deploying from local to PA, `git commit` files/ changes
* On PA bash `git pull`
* Once files are uploaded on GH and pulled to PA, `cd frontend` run `npm run build` 
* Compress `build` file to zip
* Upload `build.zip` manually to PA in `backend` folder
* in PA bash -> `cd backend` then `unzip build.zip`
* Ensure WSGI on PA is configured example:
```
import sys
import os

venv_path = '/home/FayeGoh1162340/COMP693_25S2_project_Shu_Fen_Goh_1162340/backend/venv/lib/python3.10/site-packages'
if venv_path not in sys.path:
    sys.path.insert(0, venv_path)

project_path = '/home/FayeGoh1162340/COMP693_25S2_project_Shu_Fen_Goh_1162340/backend'
if project_path not in sys.path:
    sys.path.insert(0, project_path)

os.environ['FLASK_ENV'] = 'production'

from app import app
application = app
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your `ALLOWED_ORIGINS` includes your frontend domain
2. **Database Connection**: Verify your MySQL credentials and database name
3. **Import Errors**: Check that all required packages are installed in your virtual environment
4. **Static Files**: Ensure static file paths are correctly configured

### Debug Mode
For debugging, temporarily set `FLASK_DEBUG=True` in your `.env` file and check the error logs in PythonAnywhere.

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong secret keys** in production
3. **Enable HTTPS** for production deployments
4. **Regularly update dependencies** for security patches
