import React, { useState } from "react";
import { Trash2, X } from "lucide-react";
import swal from "sweetalert";

/** Modal xác nhận xóa */
function ConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl p-5">

        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-full bg-amber-100 p-2">⚠️</div>

          <div className="grow">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-slate-600">{message}</p>
          </div>

          <button onClick={onCancel} className="p-1 hover:bg-slate-100 rounded">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-3 py-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Hủy
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? "Đang xóa..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DeleteImportModal({ importItem, onDeleteSuccess }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openModal = () => {
    if (!isDeleting) setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      await onDeleteSuccess(importItem._id);
      setModalOpen(false); 
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <>
      <button
        title="Xóa đơn nhập"
        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
        onClick={openModal}
        disabled={isDeleting}
      >
        <Trash2 size={16} />
      </button>

      <ConfirmModal
        open={modalOpen}
        title="Xóa đơn nhập chuồng"
        message={`Bạn có chắc muốn xóa đơn nhập ngày ${new Date(
          importItem.importDate
        ).toLocaleDateString("vi-VN")}? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDelete}
        onCancel={() => setModalOpen(false)}
        loading={isDeleting}
      />
    </>
  );
}
