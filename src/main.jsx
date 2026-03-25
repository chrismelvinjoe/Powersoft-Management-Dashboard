import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';
import App from './App';
import './styles/global.css';
import { fetchEmployees } from './store/employeeSlice';
import { fetchProjects } from './store/projectSlice';
import { fetchTasks } from './store/taskSlice';

// Initial data fetch from Mock DB
store.dispatch(fetchEmployees());
store.dispatch(fetchProjects());
store.dispatch(fetchTasks());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);