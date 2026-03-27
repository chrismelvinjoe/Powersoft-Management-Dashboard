import { getApiBaseUrl } from '../utils/apiConfig';

const API_BASE_URL = getApiBaseUrl();
console.log("Current API Base URL:", API_BASE_URL);
const API_URL = `${API_BASE_URL}/projects`;

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

export const addProjectAsync = createAsyncThunk('projects/addProject', async (project) => {
  const response = await axios.post(API_URL, project);
  return response.data;
});

export const updateProjectAsync = createAsyncThunk('projects/updateProject', async (project) => {
  const response = await axios.put(`${API_URL}/${project.id}`, project);
  return response.data;
});

export const deleteProjectAsync = createAsyncThunk('projects/deleteProject', async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const initialState = {
  projects: [],
  status: 'idle',
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addProjectAsync.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      })
      .addCase(updateProjectAsync.fulfilled, (state, action) => {
        const index = state.projects.findIndex(proj => proj.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
      })
      .addCase(deleteProjectAsync.fulfilled, (state, action) => {
        state.projects = state.projects.filter(proj => proj.id !== action.payload);
      })
      .addCase(deleteProjectAsync.rejected, (state, action) => {
        // Optimistic/Resilient delete
        if (action.meta.arg) {
          state.projects = state.projects.filter(proj => proj.id !== action.meta.arg);
        }
      });
  },
});

export default projectSlice.reducer;
