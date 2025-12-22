import { useFormContext } from "react-hook-form";
import { Input } from "~/components/ui/input";

export default function StepCostArea() {
  const { register, watch, formState: { errors } } = useFormContext();

  const total =
    (watch("initialCount") || 0) * (watch("price") || 0);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label>Giá/con (VNĐ) <span className="text-red-500">*</span></label>
        <Input
          type="number"
          {...register("price", {
            required: "Giá nhập bắt buộc",
            min: { value: 1, message: "Giá nhập phải lớn hơn 0." },
          })}
        />
        <p className="text-red-500 text-sm">{errors.price?.message}</p>
      </div>

      <div>
        <label>Tổng chi phí (VNĐ)</label>
        <Input readOnly value={total.toLocaleString()} />
      </div>

      <div className="col-span-2">
        <label>Khu nuôi <span className="text-red-500">*</span></label>
        <select
          {...register("areaId", { required: "Vui lòng chọn khu nuôi." })}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Chọn khu nuôi</option>
          <option value="A">Khu A</option>
        </select>
        <p className="text-red-500 text-sm">{errors.areaId?.message}</p>
      </div>

      <div className="col-span-2">
        <label>Ghi chú <span className="text-red-500">*</span></label>
        <textarea
          {...register("note", {
            minLength: { value: 10, message: "Tối thiểu 10 ký tự" },
            maxLength: { value: 255, message: "Tối đa 255 ký tự" },
          })}
          className="w-full border rounded px-3 py-2"
        />
        <p className="text-red-500 text-sm">{errors.note?.message}</p>
      </div>
    </div>
  );
}
