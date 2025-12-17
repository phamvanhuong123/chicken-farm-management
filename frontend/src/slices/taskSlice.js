import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { data } from "react-router";

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
export const fetchUpdateTaskApi = createAsyncThunk(
  "tasks/fetchUpdateTaskApi",
  async ({ id, updateData }) => {
    const response = await axios.put(`${API_ROOT}/v1/tasks/${id}`, updateData);
    return response.data;
  }
);


export const fetchDeleteTaskApi = createAsyncThunk(
  "tasks/fetchDeleteTaskApi",
  async ({taskId, areaId}) => {
    console.log("delete : " + taskId)
    await axios.delete(`${API_ROOT}/v1/tasks/${taskId}`);
    return {
      taskId,
      areaId
    }
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
    //Thêm công việc
    buider.addCase(fetchAddTaskApi.pending, (state, action) => {
      state.loading = true;
    }),
      buider.addCase(fetchAddTaskApi.fulfilled, (state, action) => {
       
        const index = state.tasks.findIndex(
          (item) => item._id === action.payload?.data?.areaId
        );
        
        //Làm sạch dữ liệu (Xoá đi các field không cần thiết)
        const addData = action.payload?.data
        Object.keys(data).forEach(fieldName => {
          if(["employeerId", "areaId"].includes(fieldName)){
            delete addData[fieldName]
          }
        })
        

        state.tasks[index]?.tasks?.push(action.payload?.data);
        state.loading = false;
      }),
      buider.addCase(fetchAddTaskApi.rejected, (state, action) => {
        state.loading = false;
      }),
      // Lấy toàn bộ danh sách
      
      buider.addCase(fetchGetAllTaskApi.fulfilled, (state, action) => {
        console.log(action.payload.data);
        state.tasks = action.payload.data;
      }),
      //Xoá công việc
      buider.addCase(fetchDeleteTaskApi.fulfilled, (state, action) => {
       const  {taskId,areaId} = action.payload

       const index = state.tasks.findIndex(item => item._id === areaId)
       console.log("index : " + index)
       state.tasks[index].tasks = state.tasks[index].tasks.filter(task => task._id != taskId) 
        
      }),
      //Cật nhât
      buider.addCase(fetchUpdateTaskApi.fulfilled, (state, action) => {
       const  {_id, areaId, status} = action.payload.data

       const index = state.tasks.findIndex(item => item._id === areaId)
       console.log("index : " + index)
       const task = state.tasks[index].tasks.find(task => task._id === _id)
       console.log("task : " + task)
       task.status = status
        
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
