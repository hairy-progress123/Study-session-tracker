# 📚 Study Session Tracker

> A modern, elegant web application to help you track your study sessions, visualize your progress, and maintain daily streaks.

Built with **Flask** (Python), **SQLite**, and vanilla **HTML/CSS/JavaScript**, this project provides a premium user experience with responsive design, dynamic charts, and smooth animations.

![Project Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-Web_Framework-lightgrey?style=flat-square&logo=flask)

## Features

- **Accurate Timer**: Start, pause, and end sessions. Survives page reloads!
- **Dashboard Statistics**: Total hours, today's hours, and current streak.
- **Weekly Graphs**: Interactive Chart.js graph displaying the last 7 days of study habits.
- **Modern UI**: Glassmorphism design system with smooth animations.
- **Dark/Light Mode**: Toggle between themes seamlessly.
- **Session History**: View and delete past sessions.
- **Authentication**: Secure user login/registration system protecting your data.

## Project Structure (MVC)

- **Model**: `app/models.py` (SQLAlchemy definitions for `User` and `StudySession`)
- **View**: `app/templates/` (Jinja2 HTML templates) & `app/static/` (CSS/JS)
- **Controller**: `app/routes/` (`auth.py`, `api.py`, `views.py`)

## Setup Instructions

### Prerequisites
- Python 3.8+
- pip (Python package installer)

### Installation

1. First, navigate to the project directory:
   ```bash
   cd "study session tracker"
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```

3. Install the dependencies from `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```

4. Add a notification sound (Optional):
   Place an mp3 file named `notification.mp3` inside `app/static/sounds/` to hear a chime when bringing your session to an end!

### Running the App

1. Run the application:
   ```bash
   python run.py
   ```
   *(Note: The database `app.db` and tables will be automatically created on the first run of the app).*

2. Open your web browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

### Future Improvements / Next Steps
- Implement email verification or OAuth (Google Login).
- Provide more advanced statistics (e.g., breakdown by subjects/categories).
- Add user-adjustable daily goal settings.

## Built With
- **Backend:** Flask, Flask-SQLAlchemy, Flask-Login
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Chart.js
- **Database:** SQLite
