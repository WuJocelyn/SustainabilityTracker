# Sustainability Tracker

A full-stack web application for tracking sustainability actions using a Django REST API and a React frontend. Users can log sustainability actions, assign point values, edit or delete entries, and visualize their progress over time using an interactive chart.

---

## Project Objective

The goal of this project is to build a RESTful API using Django and Django REST Framework to manage sustainability actions. The API supports creating, retrieving, updating, and deleting actions. A React frontend is used to interact with the API and display the data dynamically.

---

## Features

- Create sustainability actions with a date and point value
- View all actions in a table
- Edit existing actions inline
- Delete actions instantly
- RESTful API with JSON responses
- Interactive time-series chart of total points
- Group data by day, month, or year
- Optional date range filtering
- Frontend communicates with backend using Axios

---

## Tech Stack

- Backend: Python, Django, Django REST Framework
- Frontend: React, Axios, Plotly (`react-plotly.js`, `plotly.js`)

More details in the Prerequisites section below

---

## API Endpoints

| Method | Endpoint | Description |
|------|--------|------------|
| GET | `/api/actions/` | Retrieve all sustainability actions |
| POST | `/api/actions/create/` | Create a new action |
| PUT | `/api/actions/<id>/` | Update an existing action |
| DELETE | `/api/actions/<id>/` | Delete an action |
| GET | `/api/actions/points-timeseries/` | Retrieve total points over a given time period (by day, month, or year) |

---

## Sample POST Payload

```json
{
  "action": "Recycling",
  "date": "2025-01-08",
  "points": 25
}
```


## Prerequisites

Before running this project, ensure the following are installed on your system:

- Python 3.x
- pip
- Node.js
- Yarn
- Git

### Verify Python and pip Installation

Run the following commands in your terminal:
```bash
python --version
pip --version
```

---

## Backend Setup (Django)

The backend is built using Django and Django REST Framework and provides a RESTful API for managing sustainability actions.

### Step 1: Navigate to the Backend Directory
```bash
cd SustainabilityTracker/server
```

### Step 2: Install Backend Dependencies
```bash
pip install django djangorestframework
```

### Step 3: Navigate to the Django Project Directory
The Django manage.py file is located inside the newproject folder. Navigate there:
```bash
cd newproject
```

### Step 4: Run the Django Development Server
```bash
python manage.py runserver
```


If successful, you should see:
```text
Starting development server at http://127.0.0.1:8000/
```

### Backend URL

The backend API will be available at:
```
http://127.0.0.1:8000/
```

---

## Step 1: Frontend Setup (React)

The frontend is built using React and Vite and communicates with the backend API to display and manage sustainability actions.

### Step 2: Navigate to the Frontend Directory
```bash
cd SustainabilityTracker/client/app
```

### Step 3: Install Frontend Dependencies
```bash
yarn add axios
yarn add react-plotly.js plotly.js
```

### Step 4: Run the Frontend Development Server
```bash
yarn dev
```

If successful, you should see:
```text
Local: http://localhost:5173/
```

### Frontend URL

The frontend application will be available at:
```
http://localhost:5173/
```

---

## Using the Application

Once both the backend and frontend servers are running, you can use the application as follows:

- Enter a sustainability action (e.g., Recycling)
- Select a date
- Assign a point value
- Click Add Action
- View all actions in the table
- Edit actions inline using Edit
- Remove actions using Delete

### Chart Interaction

The chart allows you to:

- Group data by day, month, or year
- Apply optional date range filtering
- Visualize total sustainability points over time

---

## Testing

### Backend Testing

- API endpoints were tested using Postman

### Frontend Testing

- Frontend functionality was tested manually in the browser