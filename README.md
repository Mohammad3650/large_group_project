# StudySync by Raza's Crew
 
## Description

StudySync is a productivity web application designed to help students manage their time more effectively. The system generates personalised weekly study schedules by taking into account lectures, labs, personal commitments and individual preferences, ultimately promoting a sustainable balance between academic and personal life.

## Team Members

The members of this team are:

- _Abdulrahman  Sharif_
- _Mohammed Ijaj Ahmed_
- _Nabil Ahmed_
- _Muhammad Iyaad Islam_
- _Omar Mohammed Kassam_
- _Shahmeer Khalid_
- _Hamza Khan_
- _Mohammad Raza Khan_

## Deployment

Live URL: https://razas-crew.netlify.app/

## Demo Accounts 

Email: seeded_johndoe@example.net

Password: password123

Note: On the deployed version, only the pre-configured demo subscription (KCL Timetable) is fully functional. This is due to PythonAnywhere blocking external HTTP requests on their free plan.

## Features

- Authentication & Profile Management
- User Preferences & Inputs
- Schedule Generation
- Interactive Calendar
- Dashboard
- Subscriptions
- Export Functionality

## Tech Stack

### Frontend
- React (Vite)
- JavaScript (ES6+)
- Bootstrap

### Backend
- Django
- Django REST Framework

### Tooling & Development Environment
- Git & GitHub - version control & collaboration
- npm - frontend dependency management
- Python virtual environment (venv) - backend dependency isolation

## Setup Instructions 

### Recommended: Nix Setup (One-Step)

This project uses Nix to provide a fully reproducible development environment. All dependencies are handled automatically.

The initial Nix flake configuration was generated with the assistance of AI.

```bash
nix run .#init     - to initialise the project
nix run .#tests    - to execute the test suite
nix run .#run      - to start the frontend and backend servers
```
For detailed setup, Nix configuration and troubleshooting, please see the Developer Manual.

### Manual Setup 

#### 1. Clone the repository
```
git clone https://github.com/Mohammad3650/large_group_project.git
```
#### 2. Local setup

To run the project on your own machine, you need to set up the backend and frontend separately. The backend uses Python and Django, and the frontend uses React + JavaScript. Start from the project root and follow the steps below.

##### 2.1 Backend setup

Move into the backend folder first
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
pip install -r requirements.txt
```
Apply the database migrations:
```
python manage.py migrate
```
Start the backend server:
```
python manage.py runserver
```

##### 2.2 Frontend setup

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

Run tests using the following commands:

- For backend: `python manage.py test`
- For frontend: `npm test`

## External Resources

The project relies on several external resources, frameworks and libraries:

### Frontend Libraries & Frameworks
- React - https://react.dev/
- React Router - https://reactrouter.com/
- Axios - https://axios-http.com/
- React Icons – https://react-icons.github.io/react-icons/
- jwt-decode – https://www.npmjs.com/package/jwt-decode
- Schedule-X – https://schedule-x.dev/ (used for interactive calendar and scheduling features)
- Temporal Polyfill – https://github.com/tc39/proposal-temporal
- Bootstrap - https://getbootstrap.com/

 ### Backend Libraries & Frameworks
- Django - https://www.djangoproject.com/
- Django REST Framework - https://www.django-rest-framework.org/
- djangorestframework-simplejwt – https://django-rest-framework-simplejwt.readthedocs.io/
- django-cors-headers – https://pypi.org/project/django-cors-headers/
- psycopg2 – https://www.psycopg.org/
- python-dotenv – https://pypi.org/project/python-dotenv/
- Faker – https://faker.readthedocs.io/
- icalendar – https://pypi.org/project/icalendar/

 ### Tools & Development
- Vite – https://vitejs.dev/
- Vitest – https://vitest.dev/
- React Testing Library – https://testing-library.com/
- ESLint – https://eslint.org/
- Prettier – https://prettier.io/
- Git & GitHub – version control & collaboration
- npm – frontend dependency management
- PythonAnywhere (backend deployment) – https://www.pythonanywhere.com/
- Netlify (frontend deployment) – https://www.netlify.com/
