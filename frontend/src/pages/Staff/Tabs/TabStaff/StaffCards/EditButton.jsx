import { NotebookPen } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import FieldErrorAlert from "~/components/FieldErrorAlert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { fetchUpdateEmployeeApi, getLoadingState } from "~/slices/employeeSlice";

function EditButton({ employee }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
   const loading = useSelector((state) => getLoadingState(state));
  const {
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      roleId: employee?.roleId,
      status: employee?.status,
      salary: employee?.salary,
    },
  });
  const handleSubmitUpdateEmployee = async (data) => {
    try{
       await dispatch(fetchUpdateEmployeeApi({id : employee._id, updateData : data })).unwrap()
       toast.success("Cật nhật thành công");
       setOpen(false)
    }
    catch (error) {
        toast.error("Cật nhật thất bại " + error.message);
    }
  };
  useEffect(() => {
    if (open) {
      reset({
        roleId: employee.roleId,
        status: employee.status,
        salary: employee.salary,
      });
    }
  }, [open, employee, reset]);
  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button
            className="cursor-pointer hover:bg-gray-100 p-1.5 rounded-[7px]"
            onClick={() => setOpen(true)}
          >
            <NotebookPen size={18} />
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Chỉnh sửa thông tin nhân viên</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng cập nhật thông tin cần thiết bên dưới.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* FORM */}
          <form onSubmit={handleSubmit(handleSubmitUpdateEmployee)}>
            <div className="grid gap-4 py-2">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Họ tên</label>
                <Input value={employee?.username} disabled />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">
                  Trạng thái làm việc
                </label>
                <Select
                  defaultValue={employee?.status}
                  onValueChange={(value) => setValue("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="working">Đang làm</SelectItem>
                    <SelectItem value="onLeave">Nghỉ phép</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Số điện thoại</label>
                <Input value={employee?.phone} disabled />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Email</label>
                <Input value={employee?.email} disabled />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Tiền lương</label>
                <Input
                  type="number"
                  placeholder="Nhập tiền lương"
                  {...register("salary", {
                    valueAsNumber: true,
                    required: "Lương không được bỏ trống",
                    min: {
                      value: 0,
                      message: "Lương phải lớn hơn hoặc bằng 0",
                    },
                    max: { value: 2000000000, message: "Dự liệu nhập quá lớn" },
                  })}
                />
                <FieldErrorAlert errors={errors} fieldName={"salary"} />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>

              <Button
              disabled={loading}
                type="submit"
                className="bg-green-500 hover:bg-green-600 transition text-white cursor-pointer"
              >
                Lưu thay đổi
                {loading && <ClipLoader color="white" size={15} />}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default EditButton;
