import { useFormContext } from "react-hook-form";

export default function StepConfirm() {
  const { getValues } = useFormContext();
  const d = getValues();

  return (
    <div className="bg-gray-50 p-4 rounded space-y-2">
      <h3 className="font-semibold">Xác nhận thông tin</h3>
      <p>Ngày nhập: {d.importDate}</p>
      <p>Nhà cung cấp: {d.supplierName}</p>
      <p>Giống: {d.speciesId}</p>
      <p>Số lượng: {d.initialCount} con</p>
      <p>Trọng lượng: {d.avgWeight} kg</p>
      <p>Khu nuôi: {d.areaId}</p>
      <p className="font-semibold text-green-600">
        Tổng chi phí: {(d.initialCount * d.price).toLocaleString()} VNĐ
      </p>
    </div>
  );
}
