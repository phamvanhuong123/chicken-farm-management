import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectTrigger, SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";

function FormStep2() {
  const methods = useFormContext();
  const { register, watch, setValue, formState: { errors } } = methods;

  const price = watch("price");
  const initialCount = watch("initialCount");
  const totalCost = price && initialCount ? price * initialCount : 0;
  setValue("totalCost", totalCost);

  // BẮT BUỘC: đăng ký field Select area
  useEffect(() => {
    methods.register("areaId", { required: "Vui lòng chọn khu nuôi." });
  }, [methods]);

  const area = watch("areaId");

  return (
    <div className="grid grid-cols-2 gap-4">

      {/* Giá/con */}
      <div className="flex flex-col gap-1">
        <Label>Giá/con <span className="text-red-500">*</span></Label>

        <Input
          type="number"
          className={`${errors.price ? "border-red-500" : ""}`}
          {...register("price", {
            required: "Vui lòng nhập giá."
          })}
        />

        {errors.price && (
          <p className="text-red-500 text-sm">{errors.price.message}</p>
        )}
      </div>

      {/* Tổng chi phí */}
      <div className="flex flex-col gap-1">
        <Label>Tổng chi phí </Label>
        <Input disabled value={totalCost} />
      </div>

      {/* Khu nuôi */}
      <div className="flex flex-col col-span-2 gap-1">
        <Label>Khu nuôi <span className="text-red-500">*</span></Label>

        <Select
          value={area || ""}
          onValueChange={(v) =>
            setValue("areaId", v, {
              shouldValidate: true,
              shouldTouch: true,
              shouldDirty: true
            })
          }
        >
          <SelectTrigger className={`${errors.area ? "border-red-500" : ""}`}>
            <SelectValue placeholder="Chọn khu nuôi" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="Khu A">Khu A</SelectItem>
              <SelectItem value="Khu B">Khu B</SelectItem>
              <SelectItem value="Khu C">Khu C</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {errors.areaId && (
          <p className="text-red-500 text-sm">{errors.area.message}</p>
        )}
      </div>

      {/* Ghi chú */}
      <div className="flex flex-col col-span-2 gap-1">
        <Label>Ghi chú <span className="text-red-500">*</span></Label>

        <Textarea
          className={`${errors.note ? "border-red-500" : ""}`}
          {...register("note", {
            required: "Vui lòng nhập ghi chú.",
            minLength: { value: 10, message: "Ghi chú phải ít nhất 10 ký tự." }
          })}
        />

        {errors.note && (
          <p className="text-red-500 text-sm">{errors.note.message}</p>
        )}
      </div>

    </div>
  );
}

export default FormStep2;
