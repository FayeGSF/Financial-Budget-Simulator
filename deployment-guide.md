# Deployment Guide for PythonAnywhere

## Overview
This guide will help you deploy your Flask backend and React frontend to PythonAnywhere.

## Prerequisites
- PythonAnywhere account
- MySQL database on PythonAnywhere
- Git repository with your code

## Backend Deployment (PythonAnywhere)

### 1. Upload Your Code
1. Go to your PythonAnywhere dashboard
2. Navigate to the "Files" tab
3. Create a directory for your project (e.g., `/home/yourusername/expense-tracker`)
4. Upload your backend files or clone from Git

### 2. Set Up Virtual Environment
```bash
# In PythonAnywhere bash console
cd /home/yourusername/expense-tracker/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure Environment Variables
1. Copy `env.production` to `.env` in your backend directory
2. Edit `.env` with your actual PythonAnywhere credentials:
   ```bash
   # Database Configuration
   DB_USER=your_pythonanywhere_username
   DB_PASSWORD=your_database_password
   DB_HOST=your_pythonanywhere_username.mysql.pythonanywhere-services.com
   DB_NAME=your_pythonanywhere_username$expense_tracker
   DB_PORT=3306
   
   # Flask Configuration
   SECRET_KEY=your_very_secure_secret_key_here
   FLASK_DEBUG=False
   
   # CORS Configuration
   ALLOWED_ORIGINS=https://yourusername.pythonanywhere.com
   
   # Session Configuration
   SESSION_COOKIE_SECURE=True
   SESSION_COOKIE_SAMESITE=Lax
   ```

### 4. Set Up MySQL Database
1. Go to "Databases" tab in PythonAnywhere
2. Create a new MySQL database
3. Note the database name format: `yourusername$database_name`
4. Create the necessary tables (you'll need to run your database schema)

### 5. Configure Web App
1. Go to "Web" tab in PythonAnywhere
2. Click "Add a new web app"
3. Choose "Manual configuration"
4. Select Python version (3.9 or higher)
5. Set the source code directory to your backend folder
6. Set the WSGI configuration file to point to `wsgi.py`

### 6. Update WSGI Configuration
In the WSGI configuration file, make sure it points to your `wsgi.py`:
```python
import sys
path = '/home/yourusername/expense-tracker/backend'
if path not in sys.path:
    sys.path.append(path)

from wsgi import application
```

### 7. Set Up Static Files (if needed)
If you're serving static files, configure them in the Web app settings.

## Frontend Deployment

### Option 1: Deploy to Netlify/Vercel (Recommended)
1. Build your React app:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `build` folder to Netlify or Vercel
3. Update the `REACT_APP_API_URL` in your production environment to point to your PythonAnywhere backend

### Option 2: Deploy to PythonAnywhere (Static Files)
1. Build your React app:
   ```bash
   cd frontend
   npm run build
   ```
2. Upload the `build` folder contents to PythonAnywhere static files directory
3. Configure static files in your PythonAnywhere web app settings

## Environment Configuration

### Local Development
1. Copy `backend/env.local` to `backend/.env`
2. Copy `frontend/env.local` to `frontend/.env.local`
3. Update the values as needed for your local setup

### Production
1. Copy `backend/env.production` to `backend/.env` on PythonAnywhere
2. Update with your actual production values
3. For frontend, set environment variables in your hosting platform

## Testing Your Deployment

### Backend Testing
1. Visit your PythonAnywhere URL + `/test` (e.g., `https://yourusername.pythonanywhere.com/test`)
2. You should see: `{"message": "Backend is running!"}`

### Frontend Testing
1. Visit your frontend URL
2. Test the connection to your backend API
3. Check browser console for any CORS errors

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

## Maintenance

1. **Regular backups** of your database
2. **Monitor logs** for errors
3. **Update dependencies** regularly
4. **Test thoroughly** before deploying updates 