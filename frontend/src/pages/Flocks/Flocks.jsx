import React, { useState } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import AddFlockModal from '../../components/flock/AddFlockModal';

export default function Flocks() {
  const [showModal, setShowModal] = useState(false);
  const [flocks] = useState([
    {
      id: 1,
      code: 'DG001',
      importDate: '2024-10-15',
      breed: 'Gà Ri',
      initialQuantity: 1000,
      currentQuantity: 950,
      avgWeight: 2.5,
      status: 'Đang nuôi',
    },
    {
      id: 2,
      code: 'DG002',
      importDate: '2024-09-20',
      breed: 'Gà Lương Phượng',
      initialQuantity: 800,
      currentQuantity: 780,
      avgWeight: 2.8,
      status: 'Đang nuôi',
    },
    {
      id: 3,
      code: 'DG003',
      importDate: '2024-08-10',
      breed: 'Gà Đông Tảo',
      initialQuantity: 500,
      currentQuantity: 0,
      avgWeight: 3.2,
      status: 'Đã bán',
    },
    {
      id: 4,
      code: 'DG004',
      importDate: '2024-07-05',
      breed: 'Gà Tre',
      initialQuantity: 1200,
      currentQuantity: 0,
      avgWeight: 2.3,
      status: 'Đã bán',
    },
    {
      id: 5,
      code: 'DG005',
      importDate: '2024-06-15',
      breed: 'Gà Mía',
      initialQuantity: 600,
      currentQuantity: 600,
      avgWeight: 2.7,
      status: 'Đang nuôi',
    },
    {
      id: 6,
      code: 'DG006',
      importDate: '2024-05-20',
      breed: 'Gà Đông Tảo',
      initialQuantity: 400,
      currentQuantity: 0,
      avgWeight: 3.0,
      status: 'Đã bán',
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status) => (
    <span
      className={`px-2 py-1 text-xs font-medium rounded ${
        status === 'Đang nuôi'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-200 text-gray-800'
      }`}
    >
      {status}
    </span>
  );

  const totalPages = Math.ceil(flocks.length / rowsPerPage);
  const currentFlocks = flocks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <>
      <h1
        className="text-5xl
        font-extrabold
        text-center
        bg-gradient-to-r
        from-indigo-500
        via-purple-500
        to-pink-500
        text-transparent
        bg-clip-text
        hover:scale-105
        transition-transform
        duration-300
        ease-in-out
        drop-shadow-lg
        mt-10"
      >
        Đây là Đàn gà
      </h1>
    </>
  )
}
export default Flocks
