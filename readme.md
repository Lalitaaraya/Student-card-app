# Techoon Student Signup Form

A responsive **Student Signup & Facecard Management** application built using **HTML, CSS, and JavaScript**, with an optional **Node.js + Express + MySQL** backend.

The application collects student details, validates inputs strictly, and displays registered students with automatically generated human-style avatars.

---

## 🚀 Features

### ✅ Student Registration
- Collects:
  - First Name
  - Middle Name (optional)
  - Last Name
  - Phone Number
  - Email
  - Company (optional)
  - Optional Photo Upload

### ✅ Strict Input Validation
- Names: letters and spaces only
- Phone numbers: exactly **10 digits**
- Email: basic valid email format
- Highlights missing or invalid fields with **red outlines**

### ✅ User Experience
- Displays total number of registered students
- Shows success message upon successful registration
- Redirects to student list after form submission
- Fully responsive for **mobile and desktop**

### ✅ Avatar Generation
- Uses **DiceBear Human / Avataaars** avatars
- When a photo is uploaded:
  - Client-side **face detection using BlazeFace**
  - Generates a **deterministic avatar seed**
  - Original photo is **not stored or displayed**
- If no valid face is detected, the upload is rejected

---

## 📁 Project Structure

```

Student-card-app-main/
│
├── image/
│   └── pexels-rquiros-1848731.jpg
│
├── models/
│   └── blazeface/
│       ├── model.json
│       └── *.bin
│
├── server/
│   ├── node_modules/
│   ├── .env
│   ├── db_schema.sql
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── form.html
├── students.html
├── style.css
├── script.js
├── students.js
└── readme.md

````

---

## 🧑‍💻 Frontend Files

| File | Description |
|---|---|
| `form.html` | Student registration form |
| `students.html` | Displays registered students and total count |
| `style.css` | Styling and responsive layout |
| `script.js` | Form validation and API calls |
| `students.js` | Handles student list rendering |

---

## ▶️ How to Run (Frontend Only)

You can run the project **without the backend** for testing:

1. Open `form.html` in a browser
2. Fill in the form and submit
3. Data is temporarily stored using `localStorage`

---

## 🖥 Backend (Optional): Express + MySQL API

The backend persists registrations in a MySQL database and exposes REST APIs under `/api`.

### 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/students` | Fetch all students |
| GET | `/api/students/count` | Get total count |
| POST | `/api/students` | Create a new student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

---

## ⚙️ Backend Setup

### 1️⃣ Install Dependencies
```bash
cd server
npm install
````

---

### 2️⃣ Environment Configuration

Create a `.env` file inside `server/`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=techoon
PORT=3000
```

---

### 3️⃣ Create Database

```bash
mysql -u root -p < server/db_schema.sql
```

---

### 4️⃣ Start Server

```bash
npm run dev
# or
npm start
```

---

## 🌐 Access the Application

* Student Registration
  👉 [http://localhost:3000/form.html](http://localhost:3000/form.html)

* Student Cards View
  👉 [http://localhost:3000/students.html](http://localhost:3000/students.html)

---

## 🧠 Face Detection & Avatar Notes

* Uses **BlazeFace** for client-side face detection
* BlazeFace models can be served locally from:

  ```
  /models/blazeface/
  ```
* App attempts local model first, then falls back to CDN
* DiceBear avatars are generated from a deterministic seed
* Uploaded photos are **never saved or displayed**

---

## ⚠️ Notes & Limitations

* Uploaded photos are stored as **Base64 strings** (demo use only)
* For production:

  * Store images on disk or cloud storage
  * Save URLs in the database
* If backend is unreachable:

  * App falls back to `localStorage` for offline testing

---

## 🛠 Tech Stack

* Frontend: HTML, CSS, JavaScript
* Backend: Node.js, Express
* Database: MySQL
* Avatar Generation: DiceBear API
* Face Detection: BlazeFace

---

## 👤 Author

**Created by:** Lalita
**Date:** 2026-01-14

---

## 📜 License

This project is intended for educational and demo purposes.


