import { useFormContext } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";

function FormStep2() {
  const { register, watch, setValue } = useFormContext();

  const price = watch("price");
  const quantity = watch("quantity");

  const totalCost = price && quantity ? price * quantity : 0;
  setValue("totalCost", totalCost);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">

        <div className="col-span-1 grid max-w-sm gap-3">
          <Label>Giá/con <span className="text-red-500">*</span></Label>
          <Input type="number" {...register("price", { required: true })}/>
        </div>

        <div className="col-span-1 grid max-w-sm gap-3">
          <Label>Tổng chi phí <span className="text-red-500">*</span></Label>
          <Input disabled value={totalCost} />
        </div>

        <div className="col-span-2 grid max-w-sm gap-3">
          <Label>Khu nuôi <span className="text-red-500">*</span></Label>
          <Select onValueChange={(v) => setValue("area", v)}>
            <SelectTrigger className="w-full">
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
        </div>

        <div className="col-span-2 grid max-w-sm gap-3">
          <Label>Ghi chú <span className="text-red-500">*</span></Label>
          <Textarea {...register("note", { required: true })}/>
        </div>

      </div>
    </>
  );
}
export default FormStep2;
