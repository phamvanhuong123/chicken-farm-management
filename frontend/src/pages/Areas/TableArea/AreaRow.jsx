import React from "react";
import { Edit, Trash } from "lucide-react";

function AreaRow({ item }) {
  const statusColor = {
    ACTIVE: "bg-green-100 text-green-700",
    EMPTY: "bg-blue-100 text-blue-700",
    MAINTENANCE: "bg-orange-100 text-orange-700",
    INCIDENT: "bg-red-100 text-red-700",
  }[item.status];

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-2">{item.name}</td>

      <td className="p-2">
        {item.currentCapacity}/{item.maxCapacity}
      </td>

      <td className="p-2">
        <div className="flex flex-col">
          {item.staff.map((s) => (
            <div key={s.name} className="flex items-center gap-2 mb-1">
              <img
                src={s.avatarUrl}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      </td>

      <td className="p-2">
        <span className={`px-2 py-1 rounded text-sm ${statusColor}`}>
          {item.status}
        </span>
      </td>

      <td className="p-2">{item.note || "—"}</td>

      <td className="p-2 flex gap-3">
        <button
          className="p-2 rounded cursor-pointer hover:bg-blue-200"
          title="Chỉnh sửa"
        >
          <Edit size={16} className="w-4 h-4 text-blue-500" />
        </button>

        <button
          className="p-2 rounded cursor-pointer hover:bg-red-200"
          title="Xóa"
        >
          <Trash size={16} className="w-4 h-4 text-red-500" />
        </button>
      </td>
    </tr>
  );
}

export default AreaRow;
