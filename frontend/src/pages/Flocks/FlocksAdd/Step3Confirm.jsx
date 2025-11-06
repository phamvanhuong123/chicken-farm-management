import React from 'react';

export default function Step3Confirm({ data }) {
  if (!data) return null;

  return (
    <div>
      <h3 className='text-lg font-semibold mb-3'>Xác nhận thông tin</h3>
      <ul className='space-y-2 text-sm text-gray-700'>
        <li><strong>Ngày nhập:</strong> {data.importDate || '-'}</li>
        <li><strong>Nhà cung cấp:</strong> {data.supplier || '-'}</li>
        <li><strong>Giống gà:</strong> {data.species || '-'}</li>
        <li><strong>Số lượng:</strong> {data.quantity ?? '-'}</li>
        <li><strong>Trọng lượng ban đầu:</strong> {data.initialWeight ?? '-'} kg</li>
        <li><strong>Chi phí:</strong> {data.cost ?? 0} VNĐ</li>
        <li><strong>Khu nuôi:</strong> {data.area || '-'}</li>
      </ul>
    </div>
  );
}