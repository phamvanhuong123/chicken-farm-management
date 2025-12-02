import { createSlice,createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
const API_ROOT = "http://localhost:8071"
// Khởi tạo giá trị ban đầu



const initialState = {
    employees : [],
    loading : false
}

// Gọi api
export const fetchEmployeeApi = createAsyncThunk(
    "employees/fetchEmployeeApi", async(parentId) =>{
        const response = await axios.get(`${API_ROOT}/v1/auth/${parentId}`)
        return response.data
    }
)
export const fetchAddEmployeeApi = createAsyncThunk(
    "employees/fetchAddEmployeeApi", async({parentId, body}) =>{
        console.log(parentId,body)
        const response = await axios.post(`${API_ROOT}/v1/auth/addEmployee/${parentId}`,body)
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
        }),
        buider.addCase(fetchEmployeeApi.rejected, (state, action) =>{
            // console.log(action.payload)
            state.employees = []
        }),
        buider.addCase(fetchAddEmployeeApi.pending, (state, action) =>{
            state.loading = true
        })
        buider.addCase(fetchAddEmployeeApi.fulfilled, (state, action) => {
            console.log(action.payload.data)
            // THêm danh sách nhân viên

            state.employees.push(action.payload?.data)
            state.loading = false

        })
        buider.addCase(fetchAddEmployeeApi.rejected, (state, action) => {
            state.loading = false
        })
    }

})

export const getLoadingState = (state) =>{
    return state.employeeReducer.loading
}

export const employeeReducer = employeeSlice.reducer