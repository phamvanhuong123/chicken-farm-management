import { configureStore } from '@reduxjs/toolkit'
import authReducer from '~/slices/authSlice'
import { employeeReducer } from '~/slices/employeeSlice'
import { taskReducer } from '~/slices/taskSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employeeReducer : employeeReducer,
    taskReducer : taskReducer
  }
})

export default store