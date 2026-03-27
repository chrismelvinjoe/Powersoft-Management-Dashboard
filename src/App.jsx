import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import EmployeesPage from './pages/EmployeesPage';
import TasksPage from './pages/TasksPage';
import { fetchTasks } from './store/taskSlice';
import { fetchProjects } from './store/projectSlice';
import { fetchEmployees } from './store/employeeSlice';
import { Menu, X } from 'lucide-react';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    // Pre-warm Render backend as soon as app loads
    dispatch(fetchTasks());
    dispatch(fetchProjects());
    dispatch(fetchEmployees());
  }, [dispatch]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-container">
      <button 
        className="mobile-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle Navigation"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
