import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectTrigger, SelectValue,
} from "~/components/ui/select";

function FormStep1() {
  const methods = useFormContext();
  const { register, setValue, watch, formState: { errors } } = methods;

  // 🚨 ĐĂNG KÝ 2 FIELD SELECT BẮT BUỘC
  useEffect(() => {
    methods.register("supplier", { required: "Vui lòng chọn nhà cung cấp." });
    methods.register("speciesId", { required: "Vui lòng chọn giống gà." });
  }, [methods]);

  const supplier = watch("supplier");
  const speciesId = watch("speciesId");

  return (
    <div className="grid grid-cols-2 gap-4">

      {/* Nhà cung cấp */}
      <div className="flex flex-col gap-1">
        <Label>Nhà cung cấp <span className="text-red-500">*</span></Label>

        <Select
          value={supplier || ""}
          onValueChange={(v) =>
            setValue("supplier", v, {
              shouldValidate: true,
              shouldTouch: true,
              shouldDirty: true
            })
          }
        >
          <SelectTrigger className={`${errors.supplier ? "border-red-500" : ""}`}>
            <SelectValue placeholder="Chọn nhà cung cấp" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="Trang trại ABC">Trang trại ABC</SelectItem>
              <SelectItem value="Công ty XYZ">Công ty XYZ</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {errors.supplier && (
          <p className="text-red-500 text-sm">{errors.supplier.message}</p>
        )}
      </div>

      {/* Giống gà */}
      <div className="flex flex-col gap-1">
        <Label>Giống gà <span className="text-red-500">*</span></Label>

        <Select
          value={speciesId || ""}
          onValueChange={(v) =>
            setValue("speciesId", v, {
              shouldValidate: true,
              shouldTouch: true,
              shouldDirty: true
            })
          }
        >
          <SelectTrigger className={`${errors.speciesId ? "border-red-500" : ""}`}>
            <SelectValue placeholder="Chọn giống gà" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="Gà ta">Gà ta</SelectItem>
              <SelectItem value="Gà công nghiệp">Gà công nghiệp</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {errors.speciesId && (
          <p className="text-red-500 text-sm">{errors.speciesId.message}</p>
        )}
      </div>

      {/* Số lượng */}
      <div className="flex flex-col gap-1">
        <Label>Số lượng <span className="text-red-500">*</span></Label>

        <Input
          type="number"
          className={`${errors.initialCount ? "border-red-500" : ""}`}
          {...register("initialCount", {
            required: "Vui lòng nhập số lượng.",
            min: { value: 1, message: "Số lượng phải lớn hơn 0." }
          })}
        />

        {errors.initialCount && (
          <p className="text-red-500 text-sm">{errors.initialCount.message}</p>
        )}
      </div>

      {/* Trọng lượng trung bình */}
      <div className="flex flex-col gap-1">
        <Label>Trọng lượng trung bình <span className="text-red-500">*</span></Label>

        <Input
          type="number"
          step="0.1"
          className={`${errors.avgWeight ? "border-red-500" : ""}`}
          {...register("avgWeight", {
            required: "Vui lòng nhập trọng lượng trung bình.",
            min: { value: 0.1, message: "Giá trị phải lớn hơn 0." }
          })}
        />

        {errors.avgWeight && (
          <p className="text-red-500 text-sm">{errors.avgWeight.message}</p>
        )}
      </div>

    </div>
  );
}

export default FormStep1;
