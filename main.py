import json
from flask import Flask, request
from flask_jwt import JWT, jwt_required, current_identity
from sqlalchemy.exc import IntegrityError
from datetime import timedelta 

from models import db, User, Course

''' Begin boilerplate code '''
def create_app():
  app = Flask(__name__, template_folder='templates')
  app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
  app.config['SECRET_KEY'] = "MYSECRET"
  app.config['JWT_EXPIRATION_DELTA'] = timedelta(days = 7) 
  db.init_app(app)
  return app

app = create_app()

app.app_context().push()
db.create_all(app=app)
''' End Boilerplate Code '''

''' Set up JWT here '''
def authenticate(uname, password):
  #search for the specified user
  user = User.query.filter_by(username=uname).first()
  #if user is found and password matches
  if user and user.check_password(password):
    return user

#Payload is a dictionary which is passed to the function by Flask JWT
def identity(payload):
  return User.query.get(payload['identity'])

jwt = JWT(app, authenticate, identity)

''' End JWT Setup '''

@app.route('/identify')
@jwt_required()
def protected():
    return json_dumps(current_identity.username)

@app.route('/signup', methods=['POST'])
def signup():
  userdata = request.get_json() # get userdata
  newuser = User(username=userdata['username'], email=userdata['email']) # create user object
  newuser.set_password(userdata['password']) # set password
  try:
    db.session.add(newuser)
    db.session.commit() # save user
  except IntegrityError: # attempted to insert a duplicate user
    db.session.rollback()
    return 'username or email already exists' # error message
  return 'user created' # success


@app.route('/course', methods=['POST'])
@jwt_required()
def create_course():
  data = request.get_json()
  course = Course(code=data['code'], date=data['date'], contacthours=data['contacthours'], numhours=data['numhours'], userid=current_identity.id, done=False)
  db.session.add(course)
  db.session.commit()
  return json.dumps(course.id), 201 


@app.route('/course/<id>', methods=['GET'])
@jwt_required()
def get_course(id):
  course = Course.query.filter_by(userid=current_identity.id, id=id).first()
  if course == None:
    return 'Invalid id or unauthorized'
  return json.dumps(course.toDict())


@app.route('/course/<id>', methods=['PUT'])
@jwt_required()
def update_course(id):
  course = Course.query.filter_by(userid=current_identity.id, id=id).first()
  if course == None:
    return 'Invalid id or unauthorized'
  data = request.get_json()
  if 'code' in data: 
    course.code = data['code']
  if 'date' in data: 
    course.date = data['date']
  if 'contacthours' in data: 
    course.contacthours = data['contacthours']
  if 'numhours' in data: 
    course.numhours = data['numhours']
  if 'done' in data:
    course.done = data['done']
  db.session.add(course)
  db.session.commit()
  return 'Updated', 201

@app.route('/course/<id>', methods=['DELETE'])
@jwt_required()
def delete_course(id):
  course = Course.query.filter_by(userid=current_identity.id, id=id).first()
  if course == None:
    return 'Invalid id or unauthorized'
  db.session.delete(course) # delete the object
  db.session.commit()
  return 'Deleted', 204


app.run(host='0.0.0.0', port=8080)

  
