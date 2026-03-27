import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, CheckSquare, Settings, AlertCircle } from 'lucide-react';
import BackendSettingsModal from './BackendSettingsModal';
import { getApiBaseUrl } from '../utils/apiConfig';
import './Sidebar.css';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const isLocal = getApiBaseUrl().includes('localhost');

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <FolderKanban size={32} color="#6366f1" />
          <span>PM Dash</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" onClick={closeSidebar} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/projects" onClick={closeSidebar} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <FolderKanban size={20} />
          <span>Projects</span>
        </NavLink>
        <NavLink to="/employees" onClick={closeSidebar} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <Users size={20} />
          <span>Employees</span>
        </NavLink>
        <NavLink to="/tasks" onClick={closeSidebar} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <CheckSquare size={20} />
          <span>My Tasks</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item settings-btn" onClick={() => setIsSettingsOpen(true)} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <Settings size={20} />
          <span>Backend Settings</span>
          {isLocal && <AlertCircle size={14} color="#ef4444" style={{ marginLeft: 'auto' }} />}
        </button>
        <p>© 2026 PowerSoft</p>
      </div>
      <BackendSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </aside>
  );
};

export default Sidebar;
