// src/routes/AllRoute.jsx
import { Navigate, Route, Routes } from 'react-router'
import LayoutDefault from '~/layout/LayoutDefault'
import Dasboard from '~/pages/Dasboard/Dasboard'
import Flocks from '~/pages/Flocks/Flocks'
import Inventory from '~/pages/Inventory/Inventory'

function AllRoute() {
  return (
    <Routes>
      {/* Trang mặc định chuyển về /dasboard */}
      <Route path='/' element={<Navigate to='/dasboard' replace={true} />} />

      {/* Layout chính */}
      <Route path='/dasboard' element={<LayoutDefault />}>
        {/* Trang tổng quan */}
        <Route index element={<Dasboard />} />

        {/* Trang đàn gà (hiển thị danh sách + form thêm nổi lên) */}
        <Route path='flocks' element={<Flocks />} />

        {/* Trang kho vật tư */}
        <Route path='inventory' element={<Inventory />} />
      </Route>
    </Routes>
  )
}

export default AllRoute
