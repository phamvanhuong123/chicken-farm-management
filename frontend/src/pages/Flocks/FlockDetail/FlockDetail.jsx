import React, { useState } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import FlockDetailModal from "./FlockDetailModal";

export default function Flocks() {
  const [flocks] = useState([
    {
      id: "A001",
      code: "A001",
      date: "2024-01-15",
      breed: "Gà Ri",
      initial: 1500,
      current: 1485,
      weight: 1.8,
      status: "Raising",
    },
    {
      id: "B002",
      code: "B002",
      date: "2024-01-20",
      breed: "Gà Tam Hoàng",
      initial: 2000,
      current: 1950,
      weight: 2.1,
      status: "Raising",
    },
    {
      id: "C003",
      code: "C003",
      date: "2024-02-01",
      breed: "Gà Ai Cập",
      initial: 1200,
      current: 0,
      weight: 2.5,
      status: "Sold",
    },
  ]);

  const [selectedFlock, setSelectedFlock] = useState(null);

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-4">Danh sách đàn gà</h1>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-700">
              <th className="py-2 px-3 text-left">Mã lứa</th>
              <th className="py-2 px-3 text-left">Ngày nhập</th>
              <th className="py-2 px-3 text-left">Giống</th>
              <th className="py-2 px-3 text-right">SL ban đầu</th>
              <th className="py-2 px-3 text-right">SL hiện tại</th>
              <th className="py-2 px-3 text-right">Trọng lượng TB</th>
              <th className="py-2 px-3 text-center">Trạng thái</th>
              <th className="py-2 px-3 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {flocks.map((f) => (
              <tr
                key={f.id}
                className="border-t hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="py-2 px-3 font-medium text-gray-800">{f.code}</td>
                <td className="py-2 px-3">{f.date}</td>
                <td className="py-2 px-3">{f.breed}</td>
                <td className="py-2 px-3 text-right">
                  {f.initial.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right font-semibold text-gray-700">
                  {f.current.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right">{f.weight}kg</td>
                <td className="py-2 px-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      f.status === "Raising"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {f.status === "Raising" ? "Đang nuôi" : "Đã bán"}
                  </span>
                </td>

                {/* === Cột Hành động === */}
                <td className="py-2 px-3 text-center">
                  <div className="flex items-center justify-center gap-4">
                    {/* Xem chi tiết */}
                    <button
                      onClick={() => setSelectedFlock(f.id)}
                      title="Xem chi tiết"
                      className="text-gray-500 hover:text-blue-600 hover:scale-110 transition-all duration-150"
                    >
                      <Eye size={18} strokeWidth={1.8} />
                    </button>

                    {/* Chỉnh sửa */}
                    <button
                      title="Chỉnh sửa"
                      className="text-gray-500 hover:text-blue-600 hover:scale-110 transition-all duration-150"
                    >
                      <Edit size={18} strokeWidth={1.8} />
                    </button>

                    {/* Xóa */}
                    <button
                      title="Xóa"
                      className="text-gray-500 hover:text-blue-600 hover:scale-110 transition-all duration-150"
                    >
                      <Trash2 size={18} strokeWidth={1.8} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-sm text-gray-500 mt-3">
          Hiển thị {flocks.length} trong tổng số {flocks.length} đàn
        </p>
      </div>

      {/* Popup chi tiết đàn */}
      {selectedFlock && (
        <FlockDetailModal
          flockId={selectedFlock}
          onClose={() => setSelectedFlock(null)}
        />
      )}
    </div>
  );
}