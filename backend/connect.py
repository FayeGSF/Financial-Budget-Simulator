import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration
dbuser = os.getenv('DB_USER', 'root')
dbpass = os.getenv('DB_PASSWORD', 'MySQL1162340Lincoln')
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
SESSION_COOKIE_SAMESITE = os.getenv('SESSION_COOKIE_SAMESITE', 'None') 