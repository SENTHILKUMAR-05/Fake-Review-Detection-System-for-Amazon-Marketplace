# Fake Review Detection System (MERN Stack) 🕵️

A full-stack web application to detect fake Amazon reviews using **MongoDB, Express, React, Node.js (MERN)** and **Python Machine Learning**.

## System Architecture
- **Frontend**: React.js with Dark Mode Dashboard.
- **Backend**: Node.js & Express API.
- **Database**: MongoDB (Stores Users and Scan History).
- **ML Engine**: Scikit-learn (Python).

## Prerequisites
1.  **Node.js**: Installed.
2.  **Python**: Installed (with model trained).
3.  **MongoDB**: Installed and running locally.

## Setup Instructions

### 1. Train the Model (If not already done)
```bash
# In the root folder
pip install -r requirements.txt
python train_model.py
```

### 2. Setup Backend
Open a terminal in the `backend` folder:
```bash
cd backend
npm install
node server.js
```
*Server runs on http://localhost:5000*

### 3. Setup Frontend
Open a **new** terminal in the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on http://localhost:5173*

## Usage
1.  Open the local host link provided by Vite (e.g., `http://localhost:5173`).
2.  **Register** a new account.
3.  **Login** to access the Dashboard.
4.  Paste a review and click **Analyze**.
5.  View the results and your scan history in the charts!

## Troubleshooting
- **MongoDB Error**: Make sure MongoDB Compass or Service is running.
- **Python Error**: Ensure the backend can find `python`. If `python` command doesn't work, try changing `spawn('python', ...)` to `spawn('python3', ...)` in `backend/server.js`.
"# Fake-Review-Detection-System-for-Amazon-Marketplace" 
