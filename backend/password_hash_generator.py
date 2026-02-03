from collections import namedtuple
from flask import Flask
from extensions import bcrypt


UserAccount= namedtuple('UserAccount',['username','password'])
app = Flask(__name__)
bcrypt.init_app(app)
flask_bcrypt = bcrypt

users =[UserAccount('User01', 'Password123!'),
        UserAccount('User02', 'Password123!'),
        UserAccount('User03', 'Password123!'),
        UserAccount('User04', 'Password123!'),
        UserAccount('User05', 'Password123!'),
        UserAccount('User06', 'Password123!'),
        UserAccount('User07', 'Password123!'),
        UserAccount('User08', 'Password123!'),
        UserAccount('User09', 'Password123!'),
        UserAccount('User10', 'Password123!')



 ]
print('Username | Password | Hash | Password Matches Hash')

for user in users:
    password_hash=flask_bcrypt.generate_password_hash(user.password)
    password_matches_hash = flask_bcrypt.check_password_hash(password_hash, user.password)
    print(f'{user.username} | {user.password} | {password_hash.decode()} | {password_matches_hash}')
