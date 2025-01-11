from wtforms import ValidationError
import re
from .models import User
import boto3
import mimetypes
from botocore.exceptions import NoCredentialsError

def password_complexity(form, field):
    password = field.data
    if not re.search(r'[A-Z]', password):
        raise ValidationError("Password must include at least one uppercase letter")
    if not re.search(r'[a-z]', password):
        raise ValidationError("Password must include at least one lowercase letter")
    if not re.search(r'\d', password):
        raise ValidationError("Password must include at least one number")
    if not re.search(r'[!@#$%^&*(),.?\":{}|<>]', password):
        raise ValidationError("Password must include at least one special character")

def validate_email_unique(form, field):
    user = User.objects(email=field.data).first()
    if user is not None:
        raise ValidationError('Email already taken')

def upload_to_s3(file, user_id, folder, app):
    debug_logs = []

    try:
        bucket_name = app.config.get("AWS_S3_BUCKET_NAME")
        aws_access_key_id = app.config.get("AWS_ACCESS_KEY_ID")
        aws_secret_access_key = app.config.get("AWS_SECRET_ACCESS_KEY")
        aws_region = app.config.get("AWS_DEFAULT_REGION", "us-east-2")  
        if not bucket_name or not aws_access_key_id or not aws_secret_access_key:
            debug_logs.append("AWS S3 configuration is incomplete.")
            raise Exception("AWS S3 configuration is incomplete.")

        debug_logs.append(f"Bucket name: {bucket_name}")
        s3 = boto3.client(
            "s3",
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            region_name=aws_region,
        )
        debug_logs.append("S3 client initialized successfully.")

        object_name = f"{folder}/{user_id}/{file.filename}"
        debug_logs.append(f"Object name: {object_name}")

        # Guess the file content type
        content_type, _ = mimetypes.guess_type(file.filename)
        if not content_type:
            content_type = "application/octet-stream"

        file.seek(0)  
        s3.upload_fileobj(
            file,
            bucket_name,
            object_name,
            ExtraArgs={
                "ContentType": content_type,
                "ContentDisposition": "inline",
            },
        )
        debug_logs.append("File uploaded successfully.")
        file_url = f"https://{bucket_name}.s3.{aws_region}.amazonaws.com/{object_name}"
        debug_logs.append(f"File URL: {file_url}")
        return file_url

    except NoCredentialsError:
        debug_logs.append("AWS credentials not available.")
        raise Exception("AWS credentials not available.")
    except Exception as e:
        debug_logs.append(f"Error uploading file to S3: {str(e)}")
        raise Exception(f"Error uploading file to S3: {str(e)}")
    finally:
        print("\n".join(debug_logs))
