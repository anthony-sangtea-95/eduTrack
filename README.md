# eduTrack

**eduTrack** is a web-based education and online assessment platform designed to manage tests, questions, assignments, student attempts, submissions, and results.

The system provides separate interfaces for **Administrators, Teachers, and Students**, with role-based access control and a complete test-taking workflow.

## ✨ Features

### 👨‍💼 Admin

- User management
- Create and manage users
- Assign user roles
- Manage subjects
- Manage the overall education platform

### 👨‍🏫 Teacher

- View assigned subjects
- Create and manage questions
- Create and edit tests
- Add/remove questions from tests
- Assign tests to students
- Configure test duration
- Configure test availability
- Set passing percentage
- Configure retake rules
- View student submissions and results

### 👨‍🎓 Student

- View assigned tests
- View test status and availability
- Start an online test
- Countdown timer during an attempt
- Submit answers
- Automatic score calculation
- View test results
- View pass/fail status
- Retake tests when permitted
- Track completed and pending tests

---

## 🔐 Authentication & Authorization

eduTrack uses **JWT-based authentication** with role-based authorization.

There are three main roles:

```text
Admin
Teacher
Student
```

Protected routes prevent users from accessing functionality outside their assigned role.

For example:

```text
Admin    → Admin features
Teacher  → Teacher features
Student  → Student features
```

The backend also validates authorization rather than relying only on frontend route protection.

---

## 🧪 Test & Assessment Workflow

A typical test workflow is:

```text
Teacher
   │
   ├── Create Questions
   │
   ├── Create Test
   │
   ├── Add Questions
   │
   ├── Assign Students
   │
   └── Publish Test
          │
          ▼
       Student
          │
          ├── View Test
          │
          ├── Start Attempt
          │
          ├── Answer Questions
          │
          ├── Submit Test
          │
          ▼
       Submission
          │
          ├── Calculate Score
          ├── Determine Pass/Fail
          └── Store Result
```

### Test configuration

Tests can contain:

- Title
- Description
- Subject
- Teacher
- Assigned students
- Questions
- Duration
- Due date
- Status
- Passing percentage
- Total marks
- Retake rules
- Maximum attempts

Example test states:

```text
Draft
Published
Closed
```

---

## ⏱️ Test Attempts

The system supports configurable attempt rules.

For example:

```text
Allow Retake: No
Maximum Attempts: 1
```

or:

```text
Allow Retake: Yes
Maximum Attempts: 3
```

The system tracks:

- Attempt count
- Remaining attempts
- Whether another attempt is allowed
- Submission time
- Time taken
- Score
- Pass/fail result

---

## 📊 Student Dashboard

The student dashboard provides an overview of assessment progress, including:

- Assigned tests
- Completed tests
- Pending tests
- Passed tests
- Failed tests
- Average score

Example:

```text
Assigned     12
Completed     8
Pending       4
Passed        6
Failed        2
Average      78%
```

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- React Toastify
- Tailwind CSS

### Backend

- Node.js
- Express.js
- JWT Authentication
- REST API

### Database

- MongoDB
- Mongoose

### Development Tools

- Git
- GitHub
- VS Code

---

## 📁 Project Structure

The project is organized into separate frontend and backend applications.

```text
eduTrack/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── jobs/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── ...
│   └── ...
│
├── frontend/
│   ├── admin-frontend/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── teacher-frontend/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── student-frontend/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── utils
│
└── README.md
```

---

## 🗄️ Main Data Models

The main entities in the system are:

```text
User
 │
 ├── Admin
 ├── Teacher
 └── Student

Subject
 │
 └── Tests

Test
 │
 ├── Questions
 ├── Assigned Students
 └── Submissions

Question
 │
 └── Test

Submission
 │
 ├── Student
 ├── Test
 └── Answers
```

### User

```text
_id
name
email
password
role
```

### Test

```text
_id
title
description
dueDate
durationMinutes
subject
teacher
assignedStudents
questions
status
startTime
totalMark
passPercentage
attemptRules
```

### Question

```text
_id
subject
questionText
options
correctOption
mark
createdBy
allowedTeachers
```

### Submission

```text
_id
test
student
answers
correct
wrong
startedAt
timeTakenInSeconds
score
submittedAt
```

---

## 🔌 API Structure

The backend exposes RESTful APIs organized by role and resource.

Example:

```text
/api/auth
/api/admin
/api/teacher
/api/student
```

Example endpoints:

```text
POST   /api/auth/login
POST   /api/auth/register

GET    /api/student/tests
GET    /api/student/tests/:testId
POST   /api/student/tests/:testId/submit

GET    /api/teacher/tests
POST   /api/teacher/tests
PUT    /api/teacher/tests/:testId

GET    /api/teacher/questions
POST   /api/teacher/questions

GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/:id
```

> Endpoint names may change as the project evolves.

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB or MongoDB Atlas
- Git

### 1. Clone the repository

```bash
git clone <your-repository-url>

cd eduTrack
```

### 2. Install dependencies

Install dependencies for each application:

```bash
cd server
npm install
```

Then install dependencies for the frontend applications:

```bash
cd ../admin
npm install

cd ../teacher
npm install

cd ../student
npm install
```

### 3. Configure environment variables

Create a `.env` file in the backend:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Frontend applications can use their own environment configuration:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Do not commit `.env` files or other secrets to GitHub.**

### 4. Start the backend

```bash
cd server
npm run dev
```

### 5. Start the frontend

Run the appropriate frontend application:

```bash
cd student
npm run dev
```

The same approach can be used for the Admin and Teacher applications.

---

## 🔒 Security Considerations

eduTrack implements several basic security practices:

- JWT-based authentication
- Role-based authorization
- Protected frontend routes
- Backend authorization checks
- Password hashing
- Request validation
- Environment variables for secrets
- Ownership/permission checks for teacher resources
- Student access validation for submissions and tests

Frontend protection is treated as a user-experience feature; **authorization is enforced on the backend**.

---

## 🧮 Scoring

Test scores are calculated based on the marks assigned to questions.

The system can determine:

```text
Score
Percentage
Pass / Fail
```

For example:

```text
Total Marks:       50
Student Score:     42

Percentage:
42 / 50 × 100 = 84%

Passing Percentage: 50%

Result: PASSED
```

---

## 🚦 Test Availability

Tests can have different states depending on their lifecycle:

```text
Draft
   │
   ▼
Published
   │
   ▼
Closed
```

Students can only interact with tests when the test's availability and attempt rules allow it.

The backend performs the final access validation to prevent students from bypassing restrictions through direct API requests.

---

## 🎯 Project Goals

The main goals of eduTrack are to:

- Provide a practical online assessment platform
- Demonstrate full-stack web development skills
- Implement role-based application architecture
- Practice REST API design
- Handle authentication and authorization
- Design relational-style relationships using MongoDB
- Implement real-world assessment rules
- Build a maintainable React application
- Practice production-oriented error handling and validation

---

## 📚 What This Project Demonstrates

This project demonstrates experience with:

- Full-stack JavaScript development
- React application architecture
- REST API development
- Authentication and authorization
- MongoDB schema design
- Mongoose relationships and population
- Role-based access control
- State management
- Form validation
- Error handling
- Asynchronous API communication
- Test/assessment business logic
- Git and GitHub workflow
- Environment configuration
- Responsive UI development

---

## 🚀 Future Improvements

Possible future improvements include:

- Email notifications
- More advanced analytics
- Question randomization
- Question banks
- Multiple question types
- Bulk student assignment
- Teacher performance reports
- Student performance charts
- Export results to Excel/PDF
- Automated testing
- CI/CD pipeline
- Production deployment
- Improved accessibility

---

## 📸 Screenshots

Add screenshots of the main interfaces here.

### Student Dashboard

_Add screenshot here._

### Test Taking

_Add screenshot here._

### Test Result

_Add screenshot here._

### Teacher Test Management

_Add screenshot here._

### Admin User Management

_Add screenshot here._

---

## 👨‍💻 Author

**HRANG THAN SANGA (Hein Thet Soe)**

Web Developer

GitHub: `anthony-sangtea-95`

---

## 📄 License

This project is currently for educational and portfolio purposes.