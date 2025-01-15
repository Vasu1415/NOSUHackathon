from app import db
from datetime import datetime
from flask_login import UserMixin

class User(UserMixin,db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100),nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    profile_picture = db.Column(db.String(200))
    documents = db.relationship('Document', backref='user', lazy=True)
    tests = db.relationship('Test', backref='user', lazy=True)
    progress_records = db.relationship("UserProgress", backref="user", lazy=True)


    def get_id(self):
        return str(self.user_id)
    
    @property
    def name(self):
        return f"{self.first_name} {self.last_name}"

class UserProgress(db.Model):
    __tablename__ = "user_progress"
    progress_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)    
    date = db.Column(db.DateTime, default=datetime.utcnow)    
    current_topics = db.Column(db.Text, nullable=True)    
    strong_topics = db.Column(db.Text, nullable=True)    
    weak_topics = db.Column(db.Text, nullable=True)    
    feedback = db.Column(db.Text, nullable=True)

class Document(db.Model):
    __tablename__ = "documents"
    document_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    document_name = db.Column(db.String(100), nullable=False)
    document_topic = db.Column(db.String(200), nullable=False)
    document_url = db.Column(db.String(200), nullable=False)  
    time_stamp = db.Column(db.DateTime, nullable=True) 
    tests = db.relationship('Test', backref='document', lazy=True)


class Test(db.Model):
    __tablename__ = "tests"
    test_id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.document_id'), nullable=False)  
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)  
    test_score = db.Column(db.Integer, nullable=True)