# Project Management Dashboard

A modern, high-performance Project Management Dashboard built with React, Redux Toolkit, and @hello-pangea/dnd. This project was developed as part of a technical interview task for PowerSoft.

## 🚀 Features

- **Employee Management (CRUD)**: Create, view, edit, and delete employees with profile images and unique email validation.
- **Project Management (CRUD)**: Manage projects with logos, date/time tracking, and multi-employee assignment.
- **Task Management (CRUD)**: Link tasks to projects with project-specific employee filtering and multiple reference images.
- **Interactive Kanban Board**: Visualize tasks across 5 columns (Need to Do, In Progress, Need for Test, Completed, Re-open) with smooth drag-and-drop support.
- **Data Persistence**: State is automatically persisted to LocalStorage, ensuring data survives page reloads.
- **Premium UI/UX**: Custom design system using Vanilla CSS with glassmorphism effects, responsive layouts, and smooth micro-animations.

## 🛠️ Tech Stack

- **Framework**: React (Vite)
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Forms**: React Hook Form + Yup
- **Drag-and-Drop**: @hello-pangea/dnd
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (CSS Modules approach)

## 📦 Setup Instructions

1.  **Clone the project** (or extract the files).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the development server**:
    ```bash
    npm run dev
    ```
4.  **Open the app**: Navigate to `http://localhost:5173` in your browser.

## 📊 Board View Guidelines

- **Drag and Drop**: Simply grab a task card and move it between columns to update its status.
- **Filtering**: Use the project dropdown at the top right to filter tasks by project.
- **Task Cards**: Each card displays the project tag, task title, main reference image, assignee, and ETA.

## 🛡️ Validation Rules

- All form fields are mandatory.
- Email addresses must be valid and unique across the employee directory.
- Project start date and time must be earlier than the end date and time.
- Only employees assigned to a project can be selected for tasks within that project.

---

*Developed by Chris Melvin Joe*
