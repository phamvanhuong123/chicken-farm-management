// src/routes/AllRoute.jsx
import { Navigate, Route, Routes } from 'react-router'
import LayoutDefault from '~/layout/LayoutDefault'
import Auth from '~/pages/Auth/Auth'
import Dasboard from '~/pages/Dasboard/Dasboard'
import Flocks from '~/pages/Flocks/Flocks'
import Inventory from '~/pages/Inventory/Inventory'

function AllRoute() {
  return <Routes>
    <Route path='/' element={<Navigate to="/dasboard" replace={true} />}/>
    <Route path='/dasboard' element={<LayoutDefault/>}>
      <Route index element={<Dasboard/>}/>
      <Route path='flocks' element={<Flocks/>}/>
      <Route path='inventory' element={<Inventory/>}/>
    </Route>
    <Route path='/login' element={<Auth/>} />
    <Route path='/register' element={<Auth/>} />
  </Routes>
}

export default AllRoute
