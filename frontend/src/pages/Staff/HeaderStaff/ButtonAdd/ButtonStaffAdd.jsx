import { PlusIcon } from "lucide-react";
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
import SearchUser from "./SearchUser/SearchUser";
import { useForm, Controller } from "react-hook-form";
import FieldErrorAlert from "~/components/FieldErrorAlert";
import { useDispatch, useSelector } from "react-redux";
import { fetchAddEmployeeApi, getLoadingState } from "~/slices/employeeSlice";
import { getUserState, updateUsers } from "~/slices/authSlice";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { useState } from "react";
import { useIsEmployer } from "~/hooks/useIsEmployer";

function ButtonStaffAdd() {
  const isEmployer = useIsEmployer()
  const dispatch = useDispatch();
  const user = useSelector((state) => getUserState(state));
  const loading = useSelector((state) => getLoadingState(state));
  const [dataAddEmployee, setDataAddEmployee] = useState(null);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    unregister,
    control,
    clearErrors,
    resetField,
  } = useForm({
    defaultValues: {
      roleId: "",
    },
  });

  // Sự kiến button Thêm nhân viên
  const handleAddEmployee = async (data) => {
    try {
      await dispatch(
        fetchAddEmployeeApi({ parentId: user.id, body: data })
      ).unwrap();
      toast.success("Thêm nhân viên thành công");
      resetField("idEmployee");
      resetField("salary");
      resetField("roleId");
      setDataAddEmployee(null);
      dispatch(updateUsers({ id: data.idEmployee, parentId: user.id }));
    } catch (error) {
      toast.error("Thêm thất bại " + error.message);
    }
  };
  //Đóng của sổ
  const handleClosed = () => {
    resetField("idEmployee");
    resetField("salary");
    resetField("roleId");
  };
  if(!isEmployer) return null
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className={"bg-green-400 hover:bg-green-500 cursor-pointer"}>
            {" "}
            <PlusIcon />
            Thêm nhân viên
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <form onSubmit={handleSubmit(handleAddEmployee)}>
            <AlertDialogHeader>
              <AlertDialogTitle>Thêm nhân viên mới</AlertDialogTitle>
              <AlertDialogDescription>
                <SearchUser
                  setValueForm={setValue}
                  unregisterForm={unregister}
                  registerForm={register}
                  errors={errors}
                  clearErrors={clearErrors}
                  dataAddEmployee={dataAddEmployee}
                  setDataAddEmployee={setDataAddEmployee}
                />

                <div className="flex gap-2">
                  <div className="mb-3.5">
                    <Label className="mb-2.5">
                      Vai trò <span className="text-red-600">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="roleId"
                      rules={{ required: "Vui lòng chọn vai trò" }}
                      render={({ field }) => (
                        <div>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Vai trò</SelectLabel>
                                <SelectItem value="employee">
                                  Nhân viên
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FieldErrorAlert
                            errors={errors}
                            fieldName={"roleId"}
                          />
                        </div>
                      )}
                    />
                  </div>
                  <div className="mb-3.5 flex-1">
                    <Label className="mb-2.5">
                      Lương <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      min={0}
                      className={`focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px] `}
                      {...register("salary", {
                        required: "Bắt buộc nhập",
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: "Lương phải lớn hơn hoặc bằng 0",
                        },
                        max: {
                          value: 2000000000,
                          message: "Dự liệu nhập quá lớn",
                        },
                      })}
                      type="number"
                      placeholder="Nhập mức lương"
                    />
                    <FieldErrorAlert errors={errors} fieldName={"salary"} />
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button
                  variant="outline"
                  onClick={handleClosed}
                  className="cursor-pointer"
                >
                  Huỷ
                </Button>
              </AlertDialogCancel>
              <Button
                disabled={loading}
                className="cursor-pointer bg-green-600 text-white hover:bg-green-700"
              >
                Thêm
                {loading && <ClipLoader color="white" size={15} />}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
export default ButtonStaffAdd;
