import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalRows, 
  rowsPerPage, 
  onPageChange, 
  onRowsPerPageChange,
  className = ''
}) => {
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  
  if (totalRows === 0) return null;
  
  const startRow = (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalRows);
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Nút trang đầu
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          className="px-3 py-1 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
    }
    
    // Các trang giữa
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            currentPage === i
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Nút trang cuối
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
      
      pages.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className="px-3 py-1 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border"
        >
          {totalPages}
        </button>
      );
    }
    
    return pages;
  };
  
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg border ${className}`}>
      {/* Thông tin kết quả - CẬP NHẬT HIỂN THỊ */}
      <div className="mb-3 sm:mb-0">
        <span className="text-sm text-gray-600">
          Hiển thị <span className="font-medium">{startRow} - {endRow}</span> trên tổng <span className="font-medium">{totalRows}</span> kết quả
        </span>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
        {/* Chọn số dòng trên trang */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">
            Số dòng/trang:
          </label>
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="border rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        
        {/* Điều hướng trang */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Trước
          </button>
          
          {/* Số trang */}
          <div className="flex space-x-1">
            {renderPageNumbers()}
          </div>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-100 border disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Sau
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;