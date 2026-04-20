# 🚀 CodeCrack — Full Stack Coding Practice Platform

CodeCrack is a full-stack coding platform designed to help users practice problems in different modes like Bug Fixing, Output Prediction, Timed Challenges, and more. It includes authentication, leaderboard tracking, and real-time progress updates.

---

## 🌐 Live Demo

* 🔗 Frontend: https://codecrack-1.onrender.com
* 🔗 Backend: https://codecrack-irqj.onrender.com

---

## 🧰 Tech Stack

### Frontend

* React (CRA)
* Tailwind CSS
* Axios
* Clerk Authentication

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* Clerk (Auth Middleware)

---

## ✨ Features

* 🔐 Authentication using Clerk
* 🧠 Multiple problem modes:

  * Bug Fix Mode
  * Output Prediction
  * Puzzle Mode
  * Timed Mode
* 🏆 Leaderboard with XP ranking
* 📈 XP tracking & rank system
* ⚡ Real-time updates using events
* 💻 Code editor integration
* 🌐 Fully deployed (Frontend + Backend)

---

## 📁 Project Structure

```
CodeCrack/
│
├── client/         # React frontend
├── server/         # Express backend
├── README.md
```

---

## ⚙️ Environment Variables

### 🔹 Frontend (`client/.env`)

```
REACT_APP_API_URL=https://codecrack-irqj.onrender.com
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

---

### 🔹 Backend (`server/.env`)

```
MONGO_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
FRONTEND_URL=https://codecrack-1.onrender.com
```

---

## 🚀 Getting Started (Local Setup)

### 1️⃣ Clone the repository

```
git clone https://github.com/Kshitij-C-04/CodeCrack.git
cd CodeCrack
```

---

### 2️⃣ Install dependencies

#### Frontend

```
cd client
npm install
```

#### Backend

```
cd ../server
npm install
```

---

### 3️⃣ Run the project

#### Start backend

```
node server.js
```

#### Start frontend

```
cd ../client
npm start
```

---

## 🔗 API Endpoints

### User

* `POST /api/users/sync` → Sync user from Clerk
* `GET /api/users/:clerkId` → Get user data
* `GET /api/users/leaderboard` → Get leaderboard

### Problems

* `GET /api/problems/:mode` → Fetch problems

### Submission

* `POST /api/submission` → Run/submit code

---

## 🧠 How It Works

1. User logs in via Clerk
2. Frontend sends user data to backend (`/sync`)
3. Backend stores user in MongoDB
4. XP updates on solving problems
5. Leaderboard ranks users by XP

---

## 🚀 Deployment

* Frontend deployed on Render (Static Site)
* Backend deployed on Render (Web Service)
* MongoDB hosted on MongoDB Atlas
* Authentication handled by Clerk

---

## 📌 Future Improvements

* 👤 User profile page
* 🏅 Advanced ranking system
* 📊 Analytics dashboard
* 🧪 More problem types
* 🌍 Custom domains

---


## 👨‍💻 Author

**Kshitij Chaware**

---

⭐ If you like this project, consider giving it a star!
