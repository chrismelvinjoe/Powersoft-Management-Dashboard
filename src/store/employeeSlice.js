import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/employees`;

export const fetchEmployees = createAsyncThunk('employees/fetchEmployees', async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

export const addEmployeeAsync = createAsyncThunk('employees/addEmployee', async (employee) => {
  const response = await axios.post(API_URL, employee);
  return response.data;
});

export const updateEmployeeAsync = createAsyncThunk('employees/updateEmployee', async (employee) => {
  const response = await axios.put(`${API_URL}/${employee.id}`, employee);
  return response.data;
});

export const deleteEmployeeAsync = createAsyncThunk('employees/deleteEmployee', async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const initialState = {
  employees: [],
  status: 'idle',
  error: null,
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addEmployeeAsync.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      .addCase(updateEmployeeAsync.fulfilled, (state, action) => {
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      .addCase(deleteEmployeeAsync.fulfilled, (state, action) => {
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
      });
  },
});

export default employeeSlice.reducer;
