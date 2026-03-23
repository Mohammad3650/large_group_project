# StudySync
 
## Description

StudySync is a productivity web application designed to help students manage their time more effectively. The system generates personalised weekly study schedules by taking into account lectures, labs, personal commitments and individual preferences, ultimately promoting a sustainable balance between academic and personal life

## Team Members

The members of this team are:

- _Abdulrahman  Sharif_
- _Mohammed Ijaj Ahmed_
- _Ahmed Nabil_
- _Muhammad Iyaad Islam_
- _Omar Mohammed Kassam_
- _Shahmeer Khalid_
- _Hamza Khan_
- _Mohammad Raza Khan_

## Deployment

Live URL: [currently not available]

## Features

- Authentication & User Management
- User Preferences & Inputs
- Schedule Generation
- Interactive Timetable
- Dashboard

## Setup Instructions (Quick Start)

### 1. Clone the repository
```
git clone https://github.com/Mohammad3650/large_group_project.git
```
### 2. Local setup

To run the project on your own machine, you need to set up the backend and frontend separately. The backend uses Python and Django, and the frontend uses React + JavaScript. Start from the project root and follow the steps below.

#### 2.1 Backend setup

Move into backend folder first
```
cd backend
```
Create a virtual environment for the backend and activate it:
```
python -m venv venv
venv\Scripts\Activate
```
Install the backend dependencies:
```
pip install -r requirements.txt
```
Apply the database migrations:
```
python manage.py seed
```
Start the backend server:
```
python manage.py runserver
```

#### 2.1 Frontend setup

Open a new terminal and go to the frontend folder:
```
cd frontend
```
Install the frontend packages
```
npm install
```
Run the frontend development server
```
npm run dev
```


