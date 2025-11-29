import { useFormContext } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "~/components/ui/select";

function FormStep1() {
  const { register, setValue } = useFormContext();

  return (
    <>
      <div className="grid grid-cols-2 gap-3">

        <div className="col-span-1 grid max-w-sm gap-3">
          <Label>Ngày nhập <span className="text-red-500">*</span></Label>
          <Input type="date" {...register("importDate", { required: true })} />
        </div>

        <div className="col-span-1 grid max-w-sm gap-3">
          <Label>Nhà cung cấp <span className="text-red-500">*</span></Label>
          <Select onValueChange={(v) => setValue("supplier", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn nhà cung cấp" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Trang trại ABC">Trang trại ABC</SelectItem>
                <SelectItem value="Công ty XYZ">Công ty XYZ</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1 grid max-w-sm gap-3">
          <Label>Giống gà <span className="text-red-500">*</span></Label>
          <Select onValueChange={(v) => setValue("breed", v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn giống gà" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Gà ta">Gà ta</SelectItem>
                <SelectItem value="Gà công nghiệp">Gà công nghiệp</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1 grid max-w-sm gap-3">
          <Label>Số lượng <span className="text-red-500">*</span></Label>
          <Input type="number" {...register("quantity", { required: true })} />
        </div>

        <div className="col-span-1 grid max-w-sm gap-3">
          <Label>Trọng lượng trung bình <span className="text-red-500">*</span></Label>
          <Input type="number" step="0.1" {...register("avgWeight", { required: true })} />
        </div>

      </div>
    </>
  );
}
export default FormStep1;
