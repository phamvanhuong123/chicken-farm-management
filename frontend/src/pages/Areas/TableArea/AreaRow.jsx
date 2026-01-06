import React from "react";
import { Edit, Trash } from "lucide-react";
import DeleteArea from "../../../components/Areas/DeleteArea";
import { useIsEmployer } from "~/hooks/useIsEmployer";

function AreaRow({ item, onEdit, refreshAll, employees }) {
  const isEmployer = useIsEmployer();
  const statusColor = {
    ACTIVE: "bg-green-100 text-green-700",
    EMPTY: "bg-blue-100 text-blue-700",
    MAINTENANCE: "bg-orange-100 text-orange-700",
    INCIDENT: "bg-red-100 text-red-700",
  }[item.status];

  const statusText = {
    ACTIVE: "Đang hoạt động",
    EMPTY: "Trống",
    MAINTENANCE: "Bảo trì",
    INCIDENT: "Sự cố",
  };
  console.log(employees)
  const filterNameEmployees = ()=> {
    return employees?.map(employee => employee.username)
  }
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-2">{item.name}</td>

      <td className="p-2">
        {item.currentCapacity}/{item.maxCapacity}
      </td>

      <td className="p-2">
        <div className="flex flex-col">
          {item.staff.map((s) => (
            filterNameEmployees().includes(s.name) &&
            <div key={s.name} className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                {s.name.charAt(0).toUpperCase()}
              </div>
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      </td>

      <td className="p-2">
        <span className={`px-2 py-1 rounded text-sm ${statusColor}`}>
          {statusText[item.status]}
        </span>
      </td>

      <td className="p-2">{item.note || "—"}</td>

      <td className="p-2 flex gap-3">
        {isEmployer&&  <button
          className="p-2 rounded cursor-pointer hover:bg-blue-200"
          title="Chỉnh sửa"
          onClick={() => onEdit(item)} //Chinh sửa khu nuôi
        >
          <Edit size={16} className="w-4 h-4 text-blue-500" />
        </button>}
       
        {isEmployer && <DeleteArea
          area={item}
          onDeleted={() => refreshAll?.()} // reload danh sách + KPI
        />}
        
      </td>
    </tr>
  );
}

export default AreaRow;
