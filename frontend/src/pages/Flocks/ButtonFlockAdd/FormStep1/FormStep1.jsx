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

function FormStep1() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {/* Các Input, Select của shadcn cho Ngày nhập, Giống gà... */}
        <div className="col-span-1 grid w-full max-w-sm items-center gap-3">
          <Label>
            Ngày nhập <span className="text-red-500">*</span>
          </Label>
          <Input placeholder="Chọn ngày nhập" />
        </div>
        <div className="col-span-1 grid w-full max-w-sm items-center gap-3">
          <Label>
            Nhà cung cấp <span className="text-red-500">*</span>
          </Label>
          <Select>
            <SelectTrigger className={"w-full"}>
              <SelectValue placeholder="Chọn nhà cung cấp" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Chọn nhà cung cấp</SelectLabel>
                <SelectItem value="1">Trang trại abc</SelectItem>
                <SelectItem value="2">Công ty Xyz</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1 grid w-full max-w-sm items-center gap-3">
          <Label>
            Giống gà <span className="text-red-500">*</span>
          </Label>
          <Select>
            <SelectTrigger className={"w-full"}>
              <SelectValue placeholder="Chọn giống gà" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Chọn giống gà</SelectLabel>
                <SelectItem value="apple">Gà ta</SelectItem>
                <SelectItem value="banana">Gà công nghiệp</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1 grid w-full max-w-sm items-center gap-3">
          <Label>
            Số lượng <span className="text-red-500">*</span>
          </Label>
          <Input type={'number'} placeholder="Nhập số lượng" />
        </div>
        <div className="col-span-1 grid w-full max-w-sm items-center gap-3">
          <Label>
            Trọng lượng trung bình <span className="text-red-500">*</span>
          </Label>
          <Input placeholder='Trọng lượng trung bình' type={'number'}  />
        </div>
      </div>
    </>
  );
}
export default FormStep1;
