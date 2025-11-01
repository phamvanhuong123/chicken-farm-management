import React, { useState } from 'react'
import AddFlockModal from '../../components/flock/AddFlockModal'

export default function Flocks() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className='p-6'>
      {/* Hàng tiêu đề + nút thêm */}
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-semibold'>Danh sách đàn</h1>
        <button
          onClick={() => setShowModal(true)}
          className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700'
        >
          + Thêm đàn
        </button>
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
