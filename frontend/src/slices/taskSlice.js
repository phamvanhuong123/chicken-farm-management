import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_ROOT = "http://localhost:8071";

export const fetchGetAllTaskApi = createAsyncThunk(
  "tasks/fetchGetAllTaskApi",
  async (id) => {
    const response = await axios.get(`${API_ROOT}/v1/tasks/${id}`);
    return response.data;
  }
);


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

        const index = state.tasks.findIndex(item => {item._id === action.payload?.data?.areaId})
        state.tasks[index]?.tasks?.push(action.payload?.data);
        state.loading = false;
      }),
      buider.addCase(fetchAddTaskApi.rejected, (state, action) => {
        state.loading = false;
      }),
      buider.addCase(fetchGetAllTaskApi.pending, (state, action) => {
        
        
        state.loading = true
      }),
      buider.addCase(fetchGetAllTaskApi.fulfilled, (state, action) => {
        console.log(action.payload.data)
        state.tasks = action.payload.data
        state.loading = false
      })
  },
});

export const getTaskState = (state) => {
  return state.taskReducer.tasks;
};
export const getLoadingState = (state) => {
  return state.taskReducer.loading;
};
export const taskReducer = taskSlice.reducer;
