import { useEffect, useState } from "react";
import { PlusIcon, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";

import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "~/components/ui/select";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { formatDate } from "~/utils/formatter";
import { getAreaList } from "~/services/areaService";

function ButtonJobAdd() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      title: "",
      detail: "",
      areaId: "",
      userId: "",
      dueDate: null,
    },
  });

  // Watch giá trị khu nuôi để disable người phụ trách
  const selectedFarm = watch("areaId");
  const [dataArea, setDataArea] = useState([]);
  const employeesByFarm = () => {
    const index = dataArea.findIndex((item) => item._id === selectedFarm);
    return dataArea[index]?.staff;
  };

  const onSubmit = (data) => {
    console.log(data);
    // Close dialog
    setOpen(false);
    // Reset form
    reset();
    
  };

  useEffect(() => {
    const fetchAreas = async () => {
      const res = await getAreaList();
      setDataArea(res?.data);
    };
    fetchAreas();
  }, [open]);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-green-400 hover:bg-green-500">
            <PlusIcon className="mr-2" size={16} />
            Thêm công việc
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm công việc</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 mt-2"
          >
            {/* Tiêu đề */}
            <div>
              <label className="text-sm font-medium">Tiêu đề công việc</label>
              <Input placeholder="Nhập tiêu đề..." {...register("title")} />
            </div>

            {/* Chi tiết */}
            <div>
              <label className="text-sm font-medium">Chi tiết công việc</label>
              <Textarea
                placeholder="Mô tả..."
                rows={3}
                {...register("detail")}
              />
            </div>

            {/* Khu nuôi */}
            <div>
              <label className="text-sm font-medium">Khu nuôi</label>
              <Select
                onValueChange={(value) => {
                  setValue("areaId", value);
                  setValue("userId", ""); // Reset nhân viên
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khu nuôi" />
                </SelectTrigger>
                <SelectContent>
                  {dataArea.map((area) => (
                    <SelectItem key={area._id} value={area._id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Người phụ trách */}
            <div>
              <label className="text-sm font-medium">Người phụ trách</label>
              <Select
                onValueChange={(value) => {
                  setValue("userId", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn người phụ trách" />
                </SelectTrigger>
                <SelectContent>
                  {employeesByFarm()?.map((emp) => (
                    <SelectItem key={emp.staffId} value={emp.staffId}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker */}
            <div>
              <label className="text-sm font-medium">Ngày hoàn thành</label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch("dueDate")
                      ? formatDate(watch("dueDate"))
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={watch("dueDate")}
                    onSelect={(date) => {setValue("dueDate", date.getTime());}}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Huỷ
              </Button>
              <Button className="bg-green-500 hover:bg-green-600" type="submit">
                Thêm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
export default ButtonJobAdd;
