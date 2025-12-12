import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_ROOT = "http://localhost:8071";

export const fetchAddTaskApi = createAsyncThunk(
  "tasks/fetchAddTaskApi",
  async (data) => {
    const response = await axios.post(`${API_ROOT}/v1/tasks`, data);
    return response.data;
  }
);

const initialState = {
  tasks: [],
  loading: false,
};

const taskSlice = createSlice({
  name: "task",
  initialState: initialState,
  extraReducers: (buider) => {
    buider.addCase(fetchAddTaskApi.pending, (state, action) => {
      state.loading = true;
    }),
      buider.addCase(fetchAddTaskApi.fulfilled, (state, action) => {
        state.tasks.push(action.payload.data);
        state.loading = false;
      }),
      buider.addCase(fetchAddTaskApi.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export const getTaskState = (state) => {
  return state.taskReducer.tasks;
};
export const getLoadingState = (state) => {
  return state.taskReducer.loading;
};
export const taskReducer = taskSlice.reducer;
