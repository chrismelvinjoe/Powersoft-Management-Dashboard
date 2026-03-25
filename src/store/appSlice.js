import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isInitialized: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const { setInitialized } = appSlice.actions;
export default appSlice.reducer;
