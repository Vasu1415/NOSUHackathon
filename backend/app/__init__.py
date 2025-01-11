from flask import Flask
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Register routes
    with app.app_context():
        from app.routes import api_blueprint
        app.register_blueprint(api_blueprint)

    return app
