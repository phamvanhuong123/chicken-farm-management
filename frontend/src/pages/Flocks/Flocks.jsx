import React, { useState } from 'react'
import AddFlockModal from '../../components/flock/AddFlockModal'

export default function FlockList() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className='p-6'>
      {/* Gom tiêu đề và nút trong cùng 1 hàng */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-semibold'>Danh sách đàn</h1>
        <button
          onClick={() => setShowModal(true)}
          className='bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition'
        >
          + Thêm đàn
        </button>
      </div>

      {/* Khu vực danh sách */}
      <div className='bg-white rounded-lg shadow p-4'>
        <p className='text-gray-500 italic'>Chưa có dữ liệu đàn nào.</p>
      </div>

      {/* Modal thêm đàn */}
      {showModal && (
        <AddFlockModal
          onClose={() => setShowModal(false)}
          onSave={(data) => console.log('Dữ liệu lưu:', data)}
        />
      )}
    </div>
  )
}
