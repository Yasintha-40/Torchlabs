# Full-Stack CRM Application

A robust, simple CRM (Customer Relationship Management) system built for small sales teams. This full-stack application allows users to manage sales leads, track pipeline progress, add notes, and view a top-level sales dashboard.

## Features Implemented
- **Authentication**: JWT-based secure login system with encrypted passwords.
- **Dashboard**: Real-time overview of total leads, pipeline value, win rate, and breakdown by status.
- **Lead Management (CRUD)**: Create, View, Edit, and Delete sales leads.
- **Pipeline Tracking**: Update the status of each lead (New, Contacted, Qualified, Proposal Sent, Won, Lost).
- **Filtering & Search**: Quickly filter leads by status and search by name, company, or email.
- **UI/UX**: Premium, dark-mode focused UI with modern aesthetics, animations, and responsive layout.

## Tech Stack
### Frontend
- **Framework**: React.js (via Vite)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Custom Design System with CSS Variables)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (Zero configuration needed)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs

## Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

## How to Run Locally

### 1. Backend Setup
Navigate to the `backend` folder and start the server:
```bash
cd backend
npm install
npm run dev
```
*Note: The SQLite database (`crm.sqlite`) will be automatically created on the first run, and the default admin user will be seeded.*

### 2. Frontend Setup
Open a new terminal window, navigate to the `frontend` folder, and start the development server:
```bash
cd frontend
npm install
npm run dev
```

The frontend will typically run on `http://localhost:5173` or `http://localhost:5174`. Open the provided link in your browser.

## Test Login Credentials
- **Email**: `admin@example.com`
- **Password**: `password123`

## Database Setup
The application uses SQLite. There is no external database to configure, host, or connect to! Running `npm run dev` in the backend will automatically generate the local `crm.sqlite` file and provision the necessary tables (`users`, `leads`, `notes`).

## Known Limitations
- The JWT secret is currently hardcoded for assignment simplicity. In production, this must be an environment variable.
- Notes management only supports adding and viewing notes. Deleting/editing notes is a potential future feature.
- File uploads (like attaching contracts) are not yet supported.

## Reflection
This project was a great opportunity to build a robust, end-to-end full-stack application without relying on bloated libraries. Building a custom CSS variable design system instead of relying heavily on Tailwind allowed for a deeper understanding of CSS architecture and performance. Choosing SQLite removed the friction of database hosting for the reviewer while still showcasing strong relational data modeling and backend REST API structuring. 

## Demo Video
https://drive.google.com/file/d/1VRyf12gi604zoeubUh7LtNST3WdT5Bsj/view?usp=drive_link
