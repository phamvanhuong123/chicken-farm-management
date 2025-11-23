import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea"
function FormStep2() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {/* Các Input, Select của shadcn cho Ngày nhập, Giống gà... */}
        <div className="col-span-1 grid w-full max-w-sm items-center gap-3">
          <Label>
            Giá/con <span className="text-red-500">*</span>
          </Label>
          <Input type="number" placeholder="Nhập giá" />
        </div>
        <div className="col-span-1 grid w-full max-w-sm items-center gap-3">
          <Label>
            Tổng chi phí <span className="text-red-500">*</span>
          </Label>
          <Input disabled type={"number"} placeholder="Tự động tính" />
        </div>
        <div className="col-span-2 grid w-full max-w-sm items-center gap-3">
          <Label>
            Khu nuôi <span className="text-red-500">*</span>
          </Label>
          <Select>
            <SelectTrigger className={"w-full"}>
              <SelectValue placeholder="Chọn khu nuôi" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Chọn khu nuôi</SelectLabel>
                <SelectItem value="1">Khu A</SelectItem>
                <SelectItem value="2">Khu B</SelectItem>
                <SelectItem value="2">Khu C</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 grid w-full max-w-sm items-center gap-3">
          <Label>
            Ghi chú <span className="text-red-500">*</span>
          </Label>
          <Textarea placeholder="Nhập ghi chú" />
        </div>
      </div>
    </>
  );
}
export default FormStep2;
