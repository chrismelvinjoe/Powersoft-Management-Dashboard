import { configureStore } from '@reduxjs/toolkit';
import employeeReducer from './employeeSlice';
import projectReducer from './projectSlice';
import taskReducer from './taskSlice';
import appReducer from './appSlice';
import { loadState, saveState } from '../utils/localStorage';

const PERSISTED_STATE_KEY = 'pm-dashboard-state';

const preloadedState = loadState(PERSISTED_STATE_KEY);

const store = configureStore({
  reducer: {
    employees: employeeReducer,
    projects: projectReducer,
    tasks: taskReducer,
    app: appReducer,
  },
  preloadedState,
});

store.subscribe(() => {
  saveState(PERSISTED_STATE_KEY, store.getState());
});

export default store;
