from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_cors import CORS

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    from app.models import User
    return User.query.get(int(user_id))

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    # Set the login view (where users are redirected if not logged in)
    login_manager.login_view = "api.login"
    login_manager.login_message = "Please log in to access this page."

    # Register blueprints
    from app.routes import api_blueprint
    app.register_blueprint(api_blueprint, url_prefix="/api")

    return app