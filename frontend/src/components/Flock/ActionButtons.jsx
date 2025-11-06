import React from "react";
import { Eye, Edit2, Trash2 } from "lucide-react";

export default function ActionButtons({ onView, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={onView}
        title="Xem chi tiết"
        className="text-gray-500 hover:text-blue-500 transition-colors"
      >
        <Eye size={18} />
      </button>

      <button
        onClick={onEdit}
        title="Chỉnh sửa"
        className="text-gray-500 hover:text-yellow-500 transition-colors"
      >
        <Edit2 size={18} />
      </button>

      <button
        onClick={onDelete}
        title="Xóa"
        className="text-gray-500 hover:text-red-500 transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
