import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  projects: [],
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    addProject: (state, action) => {
      state.projects.push(action.payload);
    },
    updateProject: (state, action) => {
      const index = state.projects.findIndex(proj => proj.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    deleteProject: (state, action) => {
      state.projects = state.projects.filter(proj => proj.id !== action.payload);
    },
    setProjects: (state, action) => {
      state.projects = action.payload;
    }
  },
});

export const { addProject, updateProject, deleteProject, setProjects } = projectSlice.actions;
export default projectSlice.reducer;
