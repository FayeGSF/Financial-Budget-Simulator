from flask import Flask,g
import MySQLdb
import connect
from MySQLdb.cursors import DictCursor

# Pool of reusable database connections

# create connection with MySQL using these args
connection_params = {}

def init_db(app: Flask, user: str, password: str, host: str, database: str,
            port: int = 3306, autocommit: bool = True):
 # Save connection details.
    connection_params['user'] = user
    connection_params['password'] = password
    connection_params['host'] = host
    connection_params['database'] = database
    connection_params['port'] = port
    connection_params['autocommit'] = autocommit
    
    app.teardown_appcontext(close_db)

# checks if a connection to the db is already set. 
# and set a connection if there isnt an existing connection.
# def get_db():
#     if 'db' not in g:
#         g.db = MySQLdb.connect(**connection_params)

#     return g.db


def get_db():
    if 'db' not in g:
        params = {
            'host': connection_params.get('host'),
            'user': connection_params.get('user'),
            'passwd': connection_params.get('password'),  
            'db': connection_params.get('database'),      
            'port': connection_params.get('port', 3306),
        }
        print("Connecting with params:", params) 
        g.db = MySQLdb.connect(**params)  # make sure of the **
        g.db.autocommit(connection_params.get('autocommit', True))
    return g.db

# execute SQL queries and fetch results
def get_cursor(): 
    return get_db().cursor(cursorclass=DictCursor)


# close connection after the request
def close_db(exception=None):
    db = g.pop('db', None)
    
    if db is not None:
        try:
            db.close()
        except Exception as e:
            print(f"Error closing database connection: {e}")
            # Don't raise the exception as it might interfere with the response
