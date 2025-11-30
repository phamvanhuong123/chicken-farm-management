import { useDispatch } from 'react-redux'
import AllRoute from './routes/AllRoute'
import { useEffect } from 'react'
import { setUser } from './slices/authSlice'
import { ToastContainer } from 'react-toastify'

function App() {
  const dispatch = useDispatch()
  useEffect(()=>{
      const token = localStorage.getItem("authToken")
      if(token){
        dispatch(setUser(token))
      }
    },[dispatch])

  return (
    <>
      <AllRoute/>
       <ToastContainer />
    </>
  )
}

export default App
