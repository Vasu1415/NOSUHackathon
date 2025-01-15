import os
from datetime import timedelta

class Config:
    AWS_S3_BUCKET_NAME="nosuhackathonbucket"
    AWS_ACCESS_KEY_ID="AKIAUW4RBCCOUPF26FIQ"
    AWS_SECRET_ACCESS_KEY="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"
    AWS_DEFAULT_REGION="us-east-2"

    SQLALCHEMY_DATABASE_URI="postgresql://postgres.tqlrrlclqtlpbybwrxyv:meow%401234@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
    SQLALCHEMY_TRACK_MODIFICATIONS=False 

    SECRET_KEY = "64f90f69e49f87cbf3b123abf512c99d3c2a3e78"
    WTF_CSRF_ENABLED = False

    SESSION_COOKIE_HTTPONLY=True
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_SAMESITE = "Lax"
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)