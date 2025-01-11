from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.exc import IntegrityError
from flask_bcrypt import Bcrypt
from app import db
from app.models import User
from app.forms import SignupForm, LoginForm, ForgotPasswordForm
from app.utils import upload_to_s3

bcrypt = Bcrypt()
api_blueprint = Blueprint('api', __name__)

# Home route
@api_blueprint.route("/", methods=["POST"])
def redirect_to_signup():
    return jsonify({"message": "Redirect to /signup handled by React"}), 301

@api_blueprint.route("/api/signup", methods=["POST"])
def signup():
    form = SignupForm(data=request.form)
    if not form.validate():
        return jsonify({"errors": form.errors}), 400

    email = form.email.data
    password = form.password.data
    profile_picture = request.files.get("profile_picture")
    folder = "profilepictures"  
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Error creating user"}), 500

    user_id = new_user.user_id
    if profile_picture:
        try:
            file_url = upload_to_s3(profile_picture, user_id, folder, current_app)
            new_user.profile_picture = file_url
            db.session.commit()
        except Exception as e:
            return jsonify({"message": f"Error uploading profile picture: {str(e)}"}), 500

    return jsonify({"message": "Signup successful", "profile_picture_url": new_user.profile_picture}), 201

# Login route
@api_blueprint.route("/api/login", methods=["POST"])
def login():
    form = LoginForm(data=request.form)
    if not form.validate():
        return jsonify({"errors": form.errors}), 400

    email = form.email.data
    password = form.password.data

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid email or password"}), 401

    return jsonify({"message": "Login successful", "redirect": "/dashboard"}), 200

# Forgot password route
@api_blueprint.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    form = ForgotPasswordForm(data=request.form)
    if not form.validate():
        return jsonify({"errors": form.errors}), 400

    email = form.email.data
    new_password = form.new_password.data

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    user.password = hashed_password
    db.session.commit()

    return jsonify({"message": "Password reset successful"}), 200

# Dashboard route
@api_blueprint.route("/api/dashboard", methods=["GET"])
def dashboard():
    return jsonify({"message": "Welcome to the Dashboard!"}), 200
