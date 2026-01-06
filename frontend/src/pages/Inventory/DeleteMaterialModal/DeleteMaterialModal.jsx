// DeleteMaterialModal.jsx — TEAM-SUA-VAT-TU
import { materialAPI } from "~/apis/material.api";
import { toast } from "react-hot-toast";

export default function DeleteMaterialModal({ material, onClose, onSuccess }) {
  const handleDelete = async () => {
    try {
      await materialAPI.remove(material._id);
      toast.success("Xóa vật tư thành công");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể xóa vật tư.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        {/* HEADER */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          🗑️ Xóa vật tư
        </h2>

        {/* CONTENT */}
        <p className="text-sm text-gray-600 mb-6">
          Bạn có chắc chắn muốn xóa vật tư:
          <span className="font-semibold text-gray-800"> {material.name}</span>
          ?
          <br />
          <span className="text-red-500 text-xs">
            Hành động này không thể hoàn tác.
          </span>
        </p>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
