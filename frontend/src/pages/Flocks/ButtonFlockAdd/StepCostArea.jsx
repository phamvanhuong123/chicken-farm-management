import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { areaApi } from "~/apis/areaApi";

export default function StepCostArea() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  const total =
    (watch("initialCount") || 0) * (watch("price") || 0);

  useEffect(() => {
    areaApi
      .getList()
      .then((res) => {
        // backend trả: { status, data, pagination }
        setAreas(res.data.data || []);
      })
      .catch((err) => {
        console.error("Load areas failed:", err);
        setAreas([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Giá */}
      <div>
        <label>
          Giá/con (VNĐ) <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          {...register("price", {
            required: "Giá nhập bắt buộc",
            min: { value: 1, message: "Giá nhập phải lớn hơn 0." },
          })}
        />
        <p className="text-red-500 text-sm">
          {errors.price?.message}
        </p>
      </div>

      {/* Tổng */}
      <div>
        <label>Tổng chi phí (VNĐ)</label>
        <Input readOnly value={total.toLocaleString("vi-VN")} />
      </div>

      {/* Khu nuôi */}
      <div className="col-span-2">
        <label>
          Khu nuôi <span className="text-red-500">*</span>
        </label>
        <select
          {...register("areaId", {
            required: "Vui lòng chọn khu nuôi.",
          })}
          disabled={loading}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">
            {loading ? "Đang tải khu nuôi..." : "Chọn khu nuôi"}
          </option>

          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
        <p className="text-red-500 text-sm">
          {errors.areaId?.message}
        </p>
      </div>

      {/* Ghi chú */}
      <div className="col-span-2">
        <label>Ghi chú</label>
        <textarea
          {...register("note", {
            minLength: { value: 10, message: "Tối thiểu 10 ký tự" },
            maxLength: { value: 255, message: "Tối đa 255 ký tự" },
          })}
          className="w-full border rounded px-3 py-2"
        />
        <p className="text-red-500 text-sm">
          {errors.note?.message}
        </p>
      </div>
    </div>
  );
}
