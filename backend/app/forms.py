from flask_wtf import FlaskForm
from flask_wtf.file import FileRequired, FileAllowed
from wtforms import StringField, SubmitField, PasswordField, FileField
from wtforms.validators import InputRequired, Email, Length, EqualTo
from .utils import password_complexity, validate_email_unique 

class SignupForm(FlaskForm):
    first_name = StringField('first_name',validators=[InputRequired(message="First name is required")])
    last_name = StringField('last_name',validators=[InputRequired(message="Last name is required")])
    email = StringField('email', validators=[InputRequired(message="Email is required"),
                                             Email(message="Invalid email address"),
                                             Length(max=120, message="Email must be 120 characters or fewer"),
                                             validate_email_unique])
    password = PasswordField('password', validators=[InputRequired(message="Password is required"),
                                                     Length(min=8, max=64, message="Password must be between 8 and 64 characters"),
                                                     password_complexity])
    # confirm_password = PasswordField('confirm_password', validators=[InputRequired(message="Please confirm your password"),
    #                                                                  EqualTo('password', message="Passwords must match")])
    picture = FileField('profile_picture', validators=[FileAllowed(['jpg', 'png'], 'Images only!')])
    submit = SubmitField('signup')

class LoginForm(FlaskForm):  # Changed from FlaskForm to Form
    email = StringField('email', validators=[
        InputRequired(message="Email is required"),
        Email(message="Invalid email address")
    ])
    password = PasswordField('password', validators=[
        InputRequired(message="Password is required")
    ])
    submit = SubmitField('login')

class ForgotPasswordForm(FlaskForm):
    email = StringField('email', validators=[InputRequired(message="Email is required"),
                                             Email(message="Invalid email address")])
    new_password = PasswordField('new_password', validators=[InputRequired(message="New password is required"),
                                                             Length(min=8, max=64, message="Password must be between 8 and 64 characters"),
                                                             password_complexity])
    submit = SubmitField('reset_password')

class DocumentTestGraderForm(FlaskForm):
    document = FileField('file-upload', validators=[FileAllowed(['pdf'], 'PDF files only!'), InputRequired()])
    model = StringField('model-select', validators=[InputRequired(message="Feedback Model Selection is required!")])
