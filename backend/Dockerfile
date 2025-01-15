# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port the Flask app runs on
EXPOSE 5000

# Set the FLASK_APP environment variable
ENV FLASK_APP=run.py

# Command to start Flask
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]