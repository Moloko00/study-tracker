# Personal Study Tracker

A clean and simple **dashboard-first study tracker** for university students.

This app helps you log study sessions quickly and monitor your daily and weekly progress toward a **7-hour daily goal**.

---

# Live Demo

You can access the deployed website here:

http://moloko-study-tracker.s3-website.eu-north-1.amazonaws.com

The application is hosted using **AWS S3 Static Website Hosting**.

---

# Features

## Dashboard (home page)

Displays key statistics at a glance:

- Total study hours for **today**
- Total study hours for **this week**
- Progress toward the **7-hour daily goal**
- Average study hours per day (weekly)
- Best study day this week
- Most studied subject
- Total number of study sessions
- Study streak (consecutive study days)

---

## Study Session Tracking

Add and manage study sessions easily.

Each session includes:

- Subject
- Topic covered
- Date
- Start time
- End time
- Optional notes

Additional functionality:

- Automatic duration calculation
- Edit existing sessions
- Delete sessions
- Filter session history by subject

---

## Weekly Insights

Provides visual feedback on your study habits.

Includes charts for:

- Daily hours (last 7 days)
- Weekly hours (last 6 weeks)
- Weekly summary grouped by subject

---

## UX & Design

- Minimal and modern interface
- Mobile-friendly responsive layout
- Light/Dark mode toggle
- Fast, single-page workflow

---

# Default Subjects

- Mathematics
- Computer Science
- Cloud / DevOps

---

# Validation Rules

The application ensures clean and valid data:

- Prevents negative session durations
- Displays an error if **end time is earlier than start time**
- Requires mandatory fields before saving

---

# Data Persistence

All study sessions and theme preferences are stored in browser **localStorage**.

This ensures your data remains available even after closing and reopening the app.

---

# Tech Stack

Frontend:
- HTML
- CSS
- Vanilla JavaScript

Cloud & Deployment:
- AWS S3 Static Website Hosting
- Amazon S3 Bucket Policies
- AWS S3 Versioning
- Git & GitHub for version control

---

# Cloud Deployment Architecture

The application is deployed using the following workflow:

VS Code  
↓  
GitHub 
↓  
AWS S3 Bucket  
↓  
Static Website Hosting  
↓  
Public Internet

---
# Project Structure
.
├── index.html
├── styles.css
├── script.js
└── README.md


---

# What This Project Demonstrates

This project demonstrates the ability to:

- Build a frontend web application using **HTML, CSS, and JavaScript**
- Deploy static websites using **AWS S3**
- Configure **bucket policies for public access**
- Enable **S3 static website hosting**
- Implement **S3 versioning for recovery**
- Use **Git and GitHub for version control**