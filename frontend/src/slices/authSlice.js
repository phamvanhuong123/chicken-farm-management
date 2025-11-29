import { createSlice } from '@reduxjs/toolkit'
import { jwtDecode } from "jwt-decode";


const getUserFromAuthToken = (token)=>{

  try {
    return token ? jwtDecode(token) : null;
  } catch {
    return null;
  }
}
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null },
  reducers: {
    setUser(state, action) {
      state.user = getUserFromAuthToken(action.payload)
      
    },
    clearUser(state) { state.user = null }
  }
  
})

export const { setUser, clearUser } = authSlice.actions
export const getUserState = (state)=> {
  return state.auth.user
}
export default authSlice.reducer