import { useState } from "react";
import DeleteImportModal from "./Modal/DeleteImportModal";
import swal from "sweetalert";

export default function ImportItem({ item, onEdit, onDelete }) {
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    try {
      const date = parseDateFromImport(dateString);
      return date ? date.toLocaleDateString('vi-VN') : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('vi-VN').format(number);
  };

  const parseDateFromImport = (dateValue) => {
    if (!dateValue) return null;
    
    try {
      if (typeof dateValue === 'object' && dateValue.$date) {
        return new Date(dateValue.$date);
      }
      if (typeof dateValue === 'string') {
        return new Date(dateValue);
      }
      if (dateValue instanceof Date) {
        return dateValue;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleEdit = () => {
    if (onEdit && !loading) {
      onEdit(item);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      if (onDelete) {
        const success = await onDelete(id);
        return success;
      }
      return false;
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      swal("Lỗi", "Không thể xóa đơn nhập!", "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getShortId = () => {
    if (!item._id) return 'N/A';
    return item._id.substring(0, 8).toUpperCase();
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4 font-medium text-gray-900">
        {getShortId()}
      </td>
      <td className="py-4 px-4 text-gray-700">
        {formatDate(item.importDate)}
      </td>
      <td className="py-4 px-4 text-gray-700">
        {item.supplier}
      </td>
      <td className="py-4 px-4 text-gray-700">
        {item.breed}
      </td>
      <td className="py-4 px-4 text-right text-gray-700">
        {formatNumber(item.quantity)}
      </td>
      <td className="py-4 px-4 text-right text-gray-700">
        {item.avgWeight} kg
      </td>
      <td className="py-4 px-4 text-gray-700">
        {item.barn}
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          item.status === "Đang nuôi" 
            ? "bg-blue-100 text-blue-800" 
            : "bg-green-100 text-green-800"
        }`}>
          {item.status}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          {/* Nút Chỉnh sửa */}
          <button
            title="Chỉnh sửa"
            onClick={handleEdit}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          {/* Modal Xóa */}
          <DeleteImportModal 
            importItem={item} 
            onDeleteSuccess={handleDelete}
            loading={loading}
          />
        </div>
      </td>
    </tr>
  );
}