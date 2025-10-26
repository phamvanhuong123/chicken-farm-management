import { Route, Routes } from 'react-router'
import Home from '~/pages/Home/Home'
function AllRoute() {
  return <Routes>
    <Route path='/' element={<Home/>}></Route>
  </Routes>
}
export default AllRoute