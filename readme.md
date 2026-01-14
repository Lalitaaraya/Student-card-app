# Techoon Student Signup Form

This project contains a responsive student signup form built with HTML, CSS, and JavaScript.

## Features

- Collects student details: First Name, Middle Name (optional), Last Name, Phone Number, Email, Company (optional) and optional Photo.
- Validates inputs strictly:
  - Names allow letters and spaces only.
  - Phone number must be exactly 10 digits.
  - Email is validated for a simple correct format.
- Displays total number of registered students.
- Highlights missing or invalid fields with red outlines.
- Shows success message upon successful registration.
- Responsive design for mobile and desktop screens.

## Files

- `form.html` — Main HTML file containing the form structure.
- `style.css` — CSS styling for layout and appearance.
- `script.js` — JavaScript handling validation and form submission.

## How to run

1. Open `form.html` in a web browser.
2. Fill in the form and submit.
3. Registered students are stored temporarily in the browser session.

## Backend (Optional): MySQL + Express (API)

This project can be run with a small Node/Express backend that persists registrations in a MySQL database and exposes simple APIs under `/api`.

### What the backend provides
- GET `/api/students` — returns all registered students
- POST `/api/students` — accepts `multipart/form-data` (fields + optional `photo` file) and stores the record in MySQL
- DELETE `/api/students` — deletes all (development/testing only)
- Serves the frontend static files so you can open `http://localhost:3000/form.html` and use the API from the page

### Setup
1. Install MySQL and create a user (if needed).
2. Copy `server/.env.example` to `server/.env` and set DB connection values (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, PORT).
3. Run the schema script to create the database and table:

   mysql -u root -p < server/db_schema.sql

4. Start the server:

   cd server
   npm install
   npm run dev   # or `npm start` for production

4. Open `http://localhost:3000/form.html` in your browser to register students (after registration you'll be redirected to `http://localhost:3000/students.html` to view the saved facecards and total count). Note: when you upload a human photo, the page performs client-side face detection (BlazeFace) and derives a deterministic seed from the face crop; a DiceBear Human avatar is then generated from that seed and stored/used as the student's avatar. The original photo file is not saved or displayed. If no valid face is detected, the upload will be rejected and you will be asked for a clear headshot. To make detection resilient when CDNs are blocked, you can bundle the BlazeFace model artifacts by placing `model.json` and shard `.bin` files under `models/blazeface/` so they are served at `/models/blazeface/model.json`. The app will try the local model first and fall back to public CDNs if needed.

Notes:
- Uploaded photos are saved as Base64 in the database (suitable for demo/small images). For production, store files on disk or object storage and save paths/URLs in the DB.
- If the backend is unreachable, the app falls back to client-side localStorage for offline testing.

---

*Created by [Your Name or Team Name]*  
*Date: 2026-01-14*
