import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from '~/apis/index'
import { jwtDecode } from "jwt-decode";

const getUserFromAuthToken = (token)=>{

  try {
    return token ? jwtDecode(token) : null;
  } catch {
    return null;
  }
}

export const fetchGetAllUserApi = createAsyncThunk(
  "users/fetchGetAllUserApi",
  async () => {
    const response = await axios.get("/auth");
    return response.data;
  }
);



const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, users : null },
  reducers: {
    setUser(state, action) {
      state.user = getUserFromAuthToken(action.payload)
      
    },
    clearUser(state) { state.user = null },

    updateUsers(state, action) {
      
      const index = state.users.findIndex(user => user._id == action.payload.id)
      console.log(index)
      state.users[index].parentId = action.payload.parentId

    }
  },
  extraReducers : (buider) =>{
    buider.addCase(fetchGetAllUserApi.fulfilled, (state, action) =>{
      state.users = action.payload.data
    }),
    buider.addCase(fetchGetAllUserApi.rejected, (state, action) =>{
      state.users = null
    })
  }
  
})

export const { setUser, clearUser, updateUsers } = authSlice.actions
export const getUserState = (state)=> {
  return state.auth.user
}
export const getUsersState = (state)=> {
  return state.auth.users
}
export default authSlice.reducer