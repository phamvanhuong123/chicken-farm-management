import { createSlice,createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
const API_ROOT = "http://localhost:8071"
// Khởi tạo giá trị ban đầu



const initialState = {
    employees : null
}

// Gọi api
export const fetchEmployeeApi = createAsyncThunk(
    "employees/fetchEmployeeApi", async(parentId) =>{
        const response = await axios.get(`${API_ROOT}/v1/auth/${parentId}`)
        return response.data
    }
)
// 
const employeeSlice = createSlice({
    name : "employees",
    initialState,
    reducers : {

    },
    extraReducers : (buider) =>{
        buider.addCase(fetchEmployeeApi.fulfilled, (state, action) =>{
            // console.log(action.payload)
            state.employees = action.payload.data
        })
    }

})

export const employeeReducer = employeeSlice.reducer