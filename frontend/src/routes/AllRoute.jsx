import { Navigate, Route, Routes } from 'react-router'
import LayoutDefault from '~/layout/LayoutDefault'
import Auth from '~/pages/Auth/Auth'
import Dashboard from '~/pages/Dashboard/Dashboard'
import FlockDetail from '~/pages/Flocks/FlockDetail/FlockDetail'
import Inventory from '~/pages/Inventory/Inventory'
function AllRoute() {
  return <Routes>
    <Route path='/' element={<Navigate to="/dashboard" replace={true} />}/>
    <Route path='/dashboard' element={<LayoutDefault/>}>
      <Route index element={<Dashboard/>}/>
      <Route path='flocks' element={<FlockDetail/>}/>
      <Route path='inventory' element={<Inventory/>}/>
    </Route>
    <Route path='/login' element={<Auth/>} />
    <Route path='/register' element={<Auth/>} />
  </Routes>
}
export default AllRoute