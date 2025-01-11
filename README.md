
# **Backend Setup**

## **Steps to Run the Project**
1. Navigate to the `/backend` folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv {virtual_environment_name}
   ```
3. Activate the virtual environment:
   - **Linux/Mac**:
     ```bash
     source {virtual_environment_name}/bin/activate
     ```
   - **Windows**:
     ```bash
     {virtual_environment_name}\Scripts\activate
     ```
4. Install the necessary requirements:
   ```bash
   python -m pip install -r requirements.txt
   ```
5. Run the application locally:
   ```bash
   python run.py
   ```

---

## **Project Structure**

| **File/Folder**        | **Purpose**                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| `app/`                 | Core of the Flask application, containing routes, models, and services.    |
| `app/__init__.py`      | Initializes the Flask app and loads configurations.                        |
| `app/routes.py`        | Defines API endpoints for handling HTTP requests.                          |
| `app/models.py`        | (Optional) Contains database models/schema definitions.                   |
| `app/services/`        | Modular folder for business logic, such as extraction, validation, etc.    |
| `static/`              | Placeholder for static files (e.g., CSS, JS, images).                      |
| `tests/`               | Contains test files for API routes and services.                          |
| `tests/test_routes.py` | Unit tests for API endpoints in `routes.py`.                              |
| `tests/test_services.py` | Unit tests for business logic in the `services/` folder.                |
| `.env`                 | Stores sensitive environment variables (e.g., API keys).                  |
| `config.py`            | Application configurations (e.g., database URI, secret keys).             |
| `requirements.txt`     | Lists the dependencies required for the project.                          |
| `run.py`               | Entry point to run the Flask application locally.                         |

---

## **Environment Variables**

Add the key variables to your `.env` file:

