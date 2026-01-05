import { useFormContext } from "react-hook-form";

export default function StepConfirm() {
  const { getValues } = useFormContext();
  const d = getValues();

  return (
    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2">
        Xác nhận thông tin
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-gray-600">Ngày nhập:</span>
          <p className="font-medium">{d.importDate || "Chưa có"}</p>
        </div>

        <div>
          <span className="text-gray-600">Nhà cung cấp:</span>
          <p className="font-medium">{d.supplierName || "Chưa có"}</p>
        </div>

        <div>
          <span className="text-gray-600">Giống:</span>
          <p className="font-medium">{d.speciesId || "Chưa chọn"}</p>
        </div>

        <div>
          <span className="text-gray-600">Số lượng:</span>
          <p className="font-medium">{d.initialCount || 0} con</p>
        </div>

        <div>
          <span className="text-gray-600">Trọng lượng trung bình:</span>
          <p className="font-medium">{d.avgWeight || 0} kg/con</p>
        </div>

        <div>
          <span className="text-gray-600">Khu nuôi:</span>
          <p className="font-medium">
            {d.areaName || d.areaId || "Chưa chọn khu nuôi"}
            {d.areaId && !d.areaName && (
              <span className="text-xs text-gray-500 block mt-1">
                ID: {d.areaId}
              </span>
            )}
          </p>
        </div>

        <div className="col-span-2 pt-4 border-t">
          <span className="text-gray-600">Tổng chi phí:</span>
          <p className="font-semibold text-green-600 text-xl">
            {((d.initialCount || 0) * (d.price || 0)).toLocaleString("vi-VN")} VNĐ
          </p>
          <p className="text-sm text-gray-500">
            {d.initialCount || 0} con × {(d.price || 0).toLocaleString("vi-VN")} VNĐ/con
          </p>
        </div>
      </div>

      {/* Thông tin bổ sung nếu có */}
      {d.note && (
        <div className="mt-4 pt-4 border-t">
          <span className="text-gray-600">Ghi chú:</span>
          <p className="font-medium text-gray-700 bg-white p-3 rounded border">
            {d.note}
          </p>
        </div>
      )}
    </div>
  );
}