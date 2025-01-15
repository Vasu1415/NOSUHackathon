from flask import Blueprint, request, jsonify, current_app
from sqlalchemy.exc import IntegrityError
from flask_bcrypt import Bcrypt
from app import db
from app.models import User, Document, UserProgress
from app.forms import SignupForm, LoginForm, ForgotPasswordForm, DocumentTestGraderForm
from flask_login import login_user, logout_user, current_user, login_required
from app.utils import upload_to_s3
from werkzeug.utils import secure_filename
from app.services.feedback_route import FeedbackService
import os, json, io
import datetime
from app.services.feedback_route import FeedbackService

bcrypt = Bcrypt()
api_blueprint = Blueprint('api', __name__)

# Home route
@api_blueprint.route("/", methods=["POST"])
def redirect_to_signup():
    return jsonify({"message": "Redirect to /signup handled by React"}), 301

@api_blueprint.route("/signup", methods=["POST"])
def signup():
    form = SignupForm(data=request.form)
    if not form.validate():
        return jsonify({"errors": form.errors}), 400

    first_name = form.first_name.data
    last_name = form.last_name.data
    email = form.email.data
    password = form.password.data
    profile_picture = request.files.get("profile_picture")
    folder = "profilepictures"  
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    new_user = User(first_name=first_name,last_name=last_name,email=email, password=hashed_password)
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
@api_blueprint.route("/login", methods=["POST"])
def login():
    form = LoginForm(data=request.form)
    if not form.validate():
        return jsonify({"errors": form.errors}), 400

    email = form.email.data
    password = form.password.data

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid email or password"}), 401
    login_user(user)
    return jsonify({"message": "Login successful", "redirect": "/dashboard"}), 200

# Forgot password route
@api_blueprint.route("/forgot-password", methods=["POST"])
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

# Logout Route
@api_blueprint.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logout successful"}), 200


@api_blueprint.route("/is_logged_in", methods=["GET"])
def is_logged_in():
    if current_user.is_authenticated:
        return jsonify({"logged_in": True, "user": {"name": current_user.name, "email": current_user.email}}), 200
    return jsonify({"logged_in": False}), 200

# Protected Dashboard Route
@api_blueprint.route("/dashboard", methods=["GET"])
@login_required
def dashboard():
    return jsonify({"message": f"Welcome {current_user.name} to the Dashboard!"}), 200

@api_blueprint.route('/test-grader', methods=["POST"])
@login_required
def document_pipeline():
    form = DocumentTestGraderForm()
    if not form.validate_on_submit():
        return jsonify({"errors": form.errors}), 400
    
    document = form.document.data
    document_name = document.filename
    model_selected = form.model.data

    file_bytes = io.BytesIO(document.read())

    # S3 folder name
    folder = "documents"

    # Attempt to upload the document to S3
    try:
        document.seek(0)
        file_url = upload_to_s3(document, current_user.id, folder, current_app)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Pass a copy of the bytes to your feedback service
    feedback_service = FeedbackService()
    user_feedback_result_dict = feedback_service.feedback_route(file_bytes, model_selected)

    wrong_topics = user_feedback_result_dict.get("wrong_topics", [])
    correct_topics = user_feedback_result_dict.get("correct_topics", [])

    wrong_question_topics = set()
    for topic_list in wrong_topics:
        for t in topic_list:
            wrong_question_topics.add(t.strip())

    correct_question_topics = set()
    for topic_list in correct_topics:
        for t in topic_list:
            correct_question_topics.add(t.strip())

    # Combine them to get unique topics
    unique_topics = wrong_question_topics.union(correct_question_topics)
    controversial_topics = wrong_question_topics.intersection(correct_question_topics)
    wrong_topics = wrong_question_topics - controversial_topics
    correct_topics = correct_question_topics - controversial_topics

    # Find controversial topics = intersection of wrong + correct topics
    user_feedback_result_dict["controversial_topics"] = list(controversial_topics)
    user_feedback_result_dict["wrong_topics"] = list(wrong_topics)
    user_feedback_result_dict["correct_topics"] = list(correct_topics)

    # Store the document in your database
    new_document = Document(
        user_id=current_user.id,
        document_name=document_name,
        document_topic=",".join(unique_topics),
        document_url=file_url,
        time_stamp=datetime.now()
    )
    db.session.add(new_document)
    db.session.commit()

    new_progress = UserProgress(
        user_id=current_user.user_id,
        date=datetime.utcnow(),
        current_topics=",".join(unique_topics),
        strong_topics=",".join(correct_topics),
        weak_topics=",".join(wrong_topics),
        feedback=user_feedback_result_dict["feedback"]
    )
    db.session.add(new_progress)
    db.session.commit()

    # Return the full result
    return jsonify(user_feedback_result_dict), 200

@api_blueprint.route("/documents", methods=["GET"])
@login_required
def get_documents():
    user_documents = Document.query.filter_by(user_id=current_user.user_id).order_by(Document.time_stamp.desc()).all()
    
    documents_data = []
    for doc in user_documents:
        doc_topics = doc.document_topic.split(",") if doc.document_topic else []
        documents_data.append({
            "document_id": doc.document_id,
            "document_name": doc.document_name,
            "document_topic": doc_topics,
            "document_url": doc.document_url,
            "time_stamp": doc.time_stamp.isoformat() if doc.time_stamp else None
        })

    return jsonify(documents_data), 200

@api_blueprint.route("/progress", methods=["GET"])
@login_required
def get_progress():
    user_progress_records = UserProgress.query.filter_by(user_id=current_user.user_id).order_by(UserProgress.date.desc()).all()
    progress_data = []
    for record in user_progress_records:
        current_topics = record.current_topics.split(",") if record.current_topics else []
        strong_topics = record.strong_topics.split(",") if record.strong_topics else []
        weak_topics = record.weak_topics.split(",") if record.weak_topics else []
        progress_data.append({
            "progress_id": record.progress_id,
            "date": record.date.isoformat() if record.date else None,
            "current_topics": current_topics,
            "strong_topics": strong_topics,
            "weak_topics": weak_topics,
            "feedback": record.feedback
        })

    return jsonify(progress_data), 200

@api_blueprint.route("/update-password", methods=["POST"])
@login_required
def update_password():
    new_password = request.form.get("new_password")
    if not new_password:
        return jsonify({"error": "New password is required"}), 400

    hashed_password = bcrypt.generate_password_hash(new_password).decode("utf-8")
    
    # Update the current user's password
    current_user.password = hashed_password
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200

@api_blueprint.route("/user-profile", methods=["GET"])
@login_required
def user_profile():
    """
    Returns the user's current data:
      - user_id, name, email, profile_picture, etc.
    """
    user_data = {
        "user_id": current_user.user_id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "profile_picture": current_user.profile_picture,
    }
    return jsonify(user_data), 200

# Update profile picture route
@api_blueprint.route("/update-profile-picture", methods=["GET", "POST"])
@login_required
def update_profile_picture():
    profile_picture = request.files.get("profile_picture")
    folder = "profilepictures"

    if not profile_picture:
        return jsonify({"error": "Profile picture is required"}), 400

    try:
        file_url = upload_to_s3(profile_picture, current_user.id, folder, current_app)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    current_user.profile_picture = file_url
    db.session.commit()

    return jsonify({"message": "Profile picture updated", "profile_picture_url": file_url}), 200

# Mini-Test submit route
@api_blueprint.route("/mini-test", methods=["POST"])
@login_required
def mini_test():
    data = request.get_json()
    
    # expecting input like  {"topic": ..., "correct": [{"question":,"student_answer":, "actual_answer":}], "incorrect":[{"questions":"student_answer":, "actual_answer":}]}
    topic = data.get("topic")
    correct_answers = data.get("correct", [])
    incorrect_answers = data.get("incorrect", [])
    
    if not topic or not correct_answers or not incorrect_answers:
        return jsonify({"message": "Invalid input"}), 400

    total_questions = len(correct_answers) + len(incorrect_answers)
    correct_count = len(correct_answers)
    score = (correct_count / total_questions) * 100

    if correct_count >= 6:
        message = f"Well done! You scored {score}%"
    else:
        message = "Try again! You scored {score}%"

    return jsonify({"score": score, "message": message}), 200

@api_blueprint.route("/generate-questions", methods=["POST"])
@login_required
def generate_questions():
    data = request.json
    topic = data.get("topic")
    feedback_service = FeedbackService()

    q_prompt = f"Generate 7 multiple choice questions based on the topic {topic} without any introduction or commentary.\
        Only provide an array of 7 questions and their respective answer choices as a letter (A, B, C, D) as an array at their respoective indices."
    questions = feedback_service.response_4o(q_prompt, [], 350)

    a_prompt = f"Provide the correct answer for each question as an array of 7 letters (A, B, C, D) at their respective indices. Here are the questions {questions}"
    answers = feedback_service.response_4o(a_prompt, [], 350)
    
    return jsonify({"questions": questions, "answers": answers}), 200
