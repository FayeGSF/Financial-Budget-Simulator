from flask import Flask
app = Flask(__name__)


import backend.db as db
import backend.connect as connect
import backend.auth as auth


db.init_db(app, connect.dbuser, connect.dbpass, connect.dbhost, connect.dbname)
import sys
print(sys.path)