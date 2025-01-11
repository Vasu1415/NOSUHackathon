from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from app.models import User

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)  # Create the Flask app instance
    app.config.from_object(Config)  # Load the app configuration

    # Initialize extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)

    # Import and register blueprints here (after initializing `db`)
    from app.routes import api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')

    return app
