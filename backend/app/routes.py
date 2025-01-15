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

# Signup route with logging
@api_blueprint.route("/signup", methods=["POST"])
def signup():
    current_app.logger.info("Signup endpoint hit")
    form = SignupForm(data=request.form)
    if not form.validate():
        current_app.logger.warning(f"Signup form validation failed: {form.errors}")
        return jsonify({"errors": form.errors}), 400

    first_name = form.first_name.data
    last_name = form.last_name.data
    email = form.email.data
    password = form.password.data
    profile_picture = request.files.get("profile_picture")
    folder = "profilepictures"  

    current_app.logger.info(f"Creating user: {email}")
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(first_name=first_name, last_name=last_name, email=email, password=hashed_password)
    db.session.add(new_user)

    try:
        db.session.commit()
        current_app.logger.info(f"User {email} created successfully")
    except IntegrityError as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating user {email}: {str(e)}")
        return jsonify({"message": "Error creating user"}), 500

    user_id = new_user.user_id
    if profile_picture:
        try:
            file_url = upload_to_s3(profile_picture, user_id, folder, current_app)
            new_user.profile_picture = file_url
            db.session.commit()
            current_app.logger.info(f"Profile picture uploaded for user {email}")
        except Exception as e:
            current_app.logger.error(f"Error uploading profile picture for user {email}: {str(e)}")
            return jsonify({"message": f"Error uploading profile picture: {str(e)}"}), 500

    return jsonify({"message": "Signup successful", "profile_picture_url": new_user.profile_picture}), 201

from itsdangerous import URLSafeTimedSerializer, BadData

def validate_static_csrf(csrf_token, secret_key):
    serializer = URLSafeTimedSerializer(secret_key)
    try:
        token = serializer.loads(csrf_token, max_age=3600)  # Token expires after 1 hour
        return token == 'csrf-token'
    except BadData:
        return False

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
    current_app.logger.info(f"User authenticated: {current_user.is_authenticated}")
    if current_user.is_authenticated:
        return jsonify({"logged_in": True, "user": {"name": current_user.name, "email": current_user.email}}), 200
    return jsonify({"logged_in": False}), 401


# Protected Dashboard Route
@api_blueprint.route("/dashboard", methods=["GET"])
@login_required
def dashboard():
    return jsonify({"message": f"Welcome {current_user.name} to the Dashboard!"}), 200

@api_blueprint.route('/test-grader', methods=["POST"])
def document_pipeline():
    # Debugging: Log the route hit
    print("DEBUG: Document pipeline endpoint hit.")

    # Debugging: Log raw request data
    print(f"DEBUG: Raw request.form: {request.form}")
    print(f"DEBUG: Raw request.files: {request.files}")

    # Initialize the form and validate
    form = DocumentTestGraderForm()
    if not form.validate_on_submit():
        print(f"DEBUG: Form validation failed: {form.errors}")
        return jsonify({"errors": form.errors}), 400

    # Extract form data
    try:
        document = form.document.data
        document_name = document.filename
        model_selected = form.model.data
        print(f"DEBUG: Received document: {document_name} with model: {model_selected}")
    except Exception as e:
        print(f"ERROR: Error extracting form data: {e}")
        return jsonify({"error": "Invalid form data"}), 400

    # Read file bytes
    try:
        file_bytes = io.BytesIO(document.read())
        print(f"DEBUG: File bytes successfully read for document: {document_name}")
    except Exception as e:
        print(f"ERROR: Error reading file bytes for document: {document_name}. Error: {e}")
        return jsonify({"error": str(e)}), 500

    # S3 folder name
    folder = "documents"

    # Upload the document to S3
    try:
        document.seek(0)  # Reset the file pointer
        file_url = upload_to_s3(document, 1, folder, current_app)  # Replace `1` with a generic user ID or logic
        print(f"DEBUG: Document successfully uploaded to S3: {file_url}")
    except Exception as e:
        print(f"ERROR: Error uploading document to S3: {document_name}. Error: {e}")
        return jsonify({"error": str(e)}), 500
    
    feedback_service = FeedbackService()
    try:
        user_feedback_result_dict = feedback_service.feedback_route(file_bytes, model_selected)
    except Exception as e:
        print(f"ERROR: Feedback service failed. Error: {e}")

    # Process feedback service
    # try:
    #     feedback_service = FeedbackService()
    #     user_feedback_result_dict = feedback_service.feedback_route(file_bytes, model_selected)
    #     print(f"DEBUG: Feedback service processed successfully for document: {document_name}")
    # except Exception as e:
    #     print(f"ERROR: Error processing feedback for document: {document_name}. Error: {e}")
    #     return jsonify({"error": str(e)}), 500

    # # Categorize topics
    # try:
    #     wrong_topics = user_feedback_result_dict.get("wrong_topics", [])
    #     correct_topics = user_feedback_result_dict.get("correct_topics", [])

    #     wrong_question_topics = set(t.strip() for topic_list in wrong_topics for t in topic_list)
    #     correct_question_topics = set(t.strip() for topic_list in correct_topics for t in topic_list)

    #     unique_topics = wrong_question_topics.union(correct_question_topics)
    #     controversial_topics = wrong_question_topics.intersection(correct_question_topics)
    #     wrong_topics = wrong_question_topics - controversial_topics
    #     correct_topics = correct_question_topics - controversial_topics

    #     user_feedback_result_dict["controversial_topics"] = list(controversial_topics)
    #     user_feedback_result_dict["wrong_topics"] = list(wrong_topics)
    #     user_feedback_result_dict["correct_topics"] = list(correct_topics)

    #     print(f"DEBUG: Topics successfully categorized for document: {document_name}")
    # except Exception as e:
    #     print(f"ERROR: Error categorizing topics for document: {document_name}. Error: {e}")
    #     return jsonify({"error": str(e)}), 500

    # # Store document in the database
    # try:
    #     new_document = Document(
    #         user_id=1,  # Replace `1` with a generic or placeholder user ID
    #         document_name=document_name,
    #         document_topic=",".join(unique_topics),
    #         document_url=file_url,
    #         time_stamp=datetime.now()
    #     )
    #     db.session.add(new_document)
    #     db.session.commit()
    #     print(f"DEBUG: Document successfully stored in database: {document_name}")
    # except Exception as e:
    #     print(f"ERROR: Error storing document in database: {document_name}. Error: {e}")
    #     return jsonify({"error": str(e)}), 500

    # # Store user progress in the database
    # try:
    #     new_progress = UserProgress(
    #         user_id=1,  # Replace `1` with a generic or placeholder user ID
    #         date=datetime.utcnow(),
    #         current_topics=",".join(unique_topics),
    #         strong_topics=",".join(correct_topics),
    #         weak_topics=",".join(wrong_topics),
    #         feedback=user_feedback_result_dict["feedback"]
    #     )
    #     db.session.add(new_progress)
    #     db.session.commit()
    #     print(f"DEBUG: User progress successfully updated.")
    # except Exception as e:
    #     print(f"ERROR: Error saving user progress to database. Error: {e}")
    #     return jsonify({"error": str(e)}), 500

    # # Return result
    # print("DEBUG: Document pipeline completed successfully.")
    # return jsonify(user_feedback_result_dict), 200

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
def generate_questions():
    data = request.json
    topic = data.get("topic")
    if not topic:
        return jsonify({"error": "Topic is required"}), 400

    print(f"Generating questions for topic: {topic}")
    feedback_service = FeedbackService()

    q_prompt = f"Generate 3 multiple choice questions based on the topic {topic} without any introduction or commentary.\
#         Only provide an array of 3 questions with their respective answer choices in the following JSON format: \
#         [{{'question': '...', 'choices': {{'A': '...', 'B': '...', 'C': '...', 'D': '...'}}, 'answer': '...'}}, {{'question': '...', 'choices': {{'A': '...', 'B': '...', 'C': '...', 'D': '...'}}, 'answer': '...'}}]"
    questions_response = feedback_service.response_4o(q_prompt, [], 350)
    
    questions = [q['question'] for q in questions_response]
    answer_choices = [q['choices'] for q in questions_response]
    answers = [q['answer'] for q in questions_response]
    
    return jsonify({"questions": questions, "choices": answer_choices, "answers": answers}), 200

from flask_wtf.csrf import generate_csrf

@api_blueprint.route("/get-csrf-token", methods=["GET"])
def get_csrf_token():
    csrf_token = generate_csrf()
    return jsonify({"csrf_token": csrf_token}), 200

