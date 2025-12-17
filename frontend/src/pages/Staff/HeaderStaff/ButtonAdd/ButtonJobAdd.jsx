import { useEffect, useState } from "react";
import { PlusIcon, CalendarIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

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
import FieldErrorAlert from "~/components/FieldErrorAlert";
import { useDispatch, useSelector } from "react-redux";
import { getUserState } from "~/slices/authSlice";
import { fetchAddTaskApi, fetchGetAllTaskApi, getLoadingState } from "~/slices/taskSlice";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

function ButtonJobAdd() {
  const [open, setOpen] = useState(false);
  const user = useSelector(state => getUserState(state))
  const loading = useSelector(state => getLoadingState(state))
  const dispatch = useDispatch()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      areaId: "",
      userId: "",
      dueDate: null,
      employeerId : user.id
    },
  });

  // Watch giá trị khu nuôi để disable người phụ trách
  const selectedFarm = watch("areaId");
  const [dataArea, setDataArea] = useState([]);
  const employeesByFarm = () => {
    const index = dataArea.findIndex((item) => item._id === selectedFarm);
    return dataArea[index]?.staff;
  };

  const onSubmit = async(data) => {
    console.log(data);
    try{
      await dispatch(fetchAddTaskApi(data)).unwrap()
      await dispatch(fetchGetAllTaskApi(user.id)).unwrap();
      
      toast.success("Thêm công việc thành công");
      setOpen(false);
      reset();
    }
    catch (e){
      console.log(e)
      toast.error("Thêm công việc thất bại" + e.message);

    }

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

        <DialogContent
          onCloseAutoFocus={() => {
            reset();
          }}
          className="max-w-lg"
        >
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
              <Input
                placeholder="Nhập tiêu đề..."
                {...register("title", {
                  required: "Bắt buộc nhập",
                  minLength: {
                    value: 10,
                    message: "Tối thiểu 10 kí tự",
                  },
                  maxLength: {
                    value: 255,
                    message: "Tối đa 255 kí tự",
                  },
                })}
              />
              <FieldErrorAlert errors={errors} fieldName={"title"} />
            </div>

            {/* Chi tiết */}
            <div>
              <label className="text-sm font-medium">Chi tiết công việc</label>
              <Textarea
                placeholder="Mô tả..."
                rows={3}
                {...register("description", {
                  required: "Bắt buộc nhập",
                  minLength: {
                    value: 10,
                    message: "Tối thiểu 10 kí tự",
                  },
                  maxLength: {
                    value: 255,
                    message: "Tối đa 255 kí tự",
                  },
                })}
              />
              <FieldErrorAlert errors={errors} fieldName={"description"} />
            </div>

            {/* Khu nuôi */}
            <div>
              <label className="text-sm font-medium">Khu nuôi</label>
              <Controller
                name="areaId"
                control={control}
                rules={{
                  required: "Bắt buộc nhập",
                }}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue("userId", "");
                    }}
                    value={field.value}
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
                )}
              />
              <FieldErrorAlert errors={errors} fieldName={"areaId"} />
            </div>

            {/* Người phụ trách */}
            <div>
              <label className="text-sm font-medium">Người phụ trách</label>
              <Controller
                name="userId"
                control={control}
                rules={{
                  required: "Bắt buộc nhập",
                }}
                render={({ field }) => (
                  <Select
                    disabled={!selectedFarm}
                    onValueChange={field.onChange}
                    value={field.value}
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
                )}
              />
              <FieldErrorAlert errors={errors} fieldName={"userId"} />
            </div>

            {/* Date Picker */}
            <div>
              <label className="text-sm font-medium">Ngày hoàn thành</label>
              <input
                type="hidden"
                {...register("dueDate", {
                  required: "Vui lòng chọn ngày hoàn thành",
                  validate: (value) => {
                    if (!value) return "Vui lòng chọn ngày hoàn thành";

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    return (
                      value >= today.getTime() ||
                      "Ngày hoàn thành phải lớn hơn hoặc bằng ngày hiện tại"
                    );
                  },
                })}
              />
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
                    onSelect={(date) => {
                      setValue("dueDate", date?.getTime());
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FieldErrorAlert errors={errors} fieldName={"dueDate"} />

            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
              >
                Huỷ
              </Button>
              <Button disabled={loading} className="bg-green-500 hover:bg-green-600" type="submit">
                Thêm
                {loading && <ClipLoader color="white" size={15} />}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
export default ButtonJobAdd;
