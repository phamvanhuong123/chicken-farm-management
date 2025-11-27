import { Navigate, Route, Routes } from 'react-router'
import LayoutDefault from '~/layout/LayoutDefault'
import Areas from '~/pages/Areas/Areas'
import Auth from '~/pages/Auth/Auth'
import Dashboard from '~/pages/Dashboard/Dashboard'
import Flocks from '~/pages/Flocks/Flocks'
import FlockTransactions from '~/pages/FlockTransactions/FlockTransactions'
import Inventory from '~/pages/Inventory/Inventory'
import Journal from '~/pages/Journal/Journal'
import Staff from '~/pages/Staff/Staff'
function AllRoute() {
  return <Routes>
    <Route path='/' element={<Navigate to="/dashboard/flocks" replace={true} />}/>
    <Route path='/dashboard' element={<LayoutDefault/>}>
      <Route index element={<Dashboard/>}/>
      <Route path='flocks' element={<Flocks/>}/>
      <Route path='inventory' element={<Inventory/>}/>
      <Route path='journal' element={<Journal/>}/>
      <Route path='flock-transactions' element={<FlockTransactions/>}/>
      <Route path='areas' element={<Areas/>}/>
      <Route path='staff' element={<Staff/>}/>
    </Route>
    <Route path='/login' element={<Auth/>}/>
    <Route path='/register' element={<Auth/>}/>
  </Routes>
}
export default AllRoute