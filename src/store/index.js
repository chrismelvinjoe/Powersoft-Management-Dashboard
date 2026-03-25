import { configureStore } from '@reduxjs/toolkit';
import employeeReducer from './employeeSlice';
import projectReducer from './projectSlice';
import taskReducer from './taskSlice';
import appReducer from './appSlice';

const store = configureStore({
  reducer: {
    employees: employeeReducer,
    projects: projectReducer,
    tasks: taskReducer,
    app: appReducer,
  },
});

export default store;
