# StudySync by Raza's Crew
 
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

## Demo Accounts 

[Not available yet]

## Features

- Authentication & Profile Management
- User Preferences & Inputs
- Schedule Generation
- Interactive Calender
- Dashboard

## Tech Stack

### Frontend
- React (Vite)
- JavaScript (ES6+)
- Bootstrap

### Backend
- Django
- Django REST Framework

### Tooling & Development Environment
- Git & Github - version control & collaboration
- npm - frontend dependency management
- Python virtal environment (venv) - backend dependency isolation

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

# Windows
venv\Scripts\Activate

# Mac/Linux
source venv\bin\activate
```
Install the backend dependencies:
```
pip install -r ../requirements.txt
```
Apply the database migrations:
```
python manage.py migrate
```
Start the backend server:
```
python manage.py runserver
```

#### 2.2 Frontend setup

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

## Testing

Run tests using:

- For backend: `python manage.py test`
- For frontend: `npm test`

## External Resources

The project relies on several external frameworks and libraries:
- React - https://react.dev/
- Django - https://www.djangoproject.com/
- Django REST Framework - https://www.django-rest-framework.org/
- Bootstrap - https://getbootstrap.com/
