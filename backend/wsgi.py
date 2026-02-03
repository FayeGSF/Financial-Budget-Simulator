#!/usr/bin/env python3
"""
WSGI configuration for PythonAnywhere deployment
"""

import sys
import os

# Add the backend directory to the Python path
backend_path = os.path.dirname(os.path.abspath(__file__))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Set environment to production
os.environ['FLASK_ENV'] = 'production'

# Import the Flask app
from app import app

# For PythonAnywhere, the application object should be named 'application'
application = app

if __name__ == "__main__":
    app.run() 