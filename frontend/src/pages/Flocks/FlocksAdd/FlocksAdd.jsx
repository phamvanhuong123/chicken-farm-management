import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddFlockModal from "./AddFlockModal";

export default function FlocksAdd() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // Khởi tạo

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-semibold'>Danh sách đàn</h1>
        <button
          onClick={() => setShowModal(true)}
          className='bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition'
        >
          + Thêm đàn
        </button>
      </div>

      <div className='bg-white rounded-lg shadow p-4'>
        <p className='text-gray-500 italic'>Chưa có dữ liệu đàn nào.</p>
      </div>

      {showModal && (
        <AddFlockModal
          onClose={() => setShowModal(false)}
          onSave={(data) => {
            console.log("Đã lưu:", data);
            navigate("/flocks"); // Quay lại danh sách
          }}
        />
      )}
    </div>
  );
}