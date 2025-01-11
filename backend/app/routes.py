from flask import Blueprint, jsonify
from sqlalchemy.sql import text  # Import the `text` function
from app import db  

# Define the blueprint
api_blueprint = Blueprint('api', __name__)

# Home route
@api_blueprint.route('/')
def home():
    return jsonify({"message": "Hello, World!"})

