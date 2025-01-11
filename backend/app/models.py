from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    profile_picture = db.Column(db.String(200))
    documents = db.relationship('Document', backref='user', lazy=True)
    tests = db.relationship('Test', backref='user', lazy=True)

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