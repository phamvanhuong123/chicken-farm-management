import { Navigate, Route, Routes } from 'react-router'
import LayoutDefault from '~/layout/LayoutDefault'
import Dashboard from '~/pages/Dashboard/Dashboard'
import FlocksAdd from '~/pages/Flocks/FlocksAdd/FlocksAdd'
import Inventory from '~/pages/Inventory/Inventory'
function AllRoute() {
  return <Routes>
    <Route path='/' element={<Navigate to="/dashboard" replace={true} />}/>
    <Route path='/dashboard' element={<LayoutDefault/>}>
      <Route index element={<Dashboard/>}/>
      <Route path='flocks' element={<FlocksAdd/>}/>
      <Route path='inventory' element={<Inventory/>}/>
    </Route>
  </Routes>
}
export default AllRoute