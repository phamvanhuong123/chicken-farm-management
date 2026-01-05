import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { PHONE_RULE } from "~/utils/validators";
import axiosInstance from "~/apis";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { updateuser } from "~/slices/authSlice";
import { ClipLoader } from "react-spinners";

export default function ProfileForm({ dataUser }) {
  const dispath = useDispatch()
  const [loading,setLoading] = useState(false)
  const form = useForm({
    defaultValues: {
      username: "",
      phone: "",
      email: "",
    },
    mode: "onBlur", // validate khi blur (UX tốt)
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (dataUser) {
      reset({
        username: dataUser.username || "",
        phone: dataUser.phone || "",
        email: dataUser.email || "",
      });
    }
  }, [dataUser, reset]);

  const onSubmit = async (data) => {
    try{
      setLoading(true)
      const res = await axiosInstance.put(`/auth/user/${dataUser._id}`,data)
      dispath(updateuser(res.data.data))
      toast.success("Cật nhật thông tin thành công")
    }
    catch(error){
      toast.error("Chưa cật nhật được người dùng : " + error )
    }
    finally{
      setLoading(false)
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
      </CardHeader>
    

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* USERNAME */}
            <div>
              <Label className="mb-1.5">Tên người dùng</Label>
              <Input
                {...register("username", {
                  required: "Tên người dùng không được để trống",
                })}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <Label className="mb-1.5">Số điện thoại</Label>
              <Input
                {...register("phone", {
                  required: "Số điện thoại không được để trống",
                  pattern: {
                    value: PHONE_RULE,
                    message: "Số điện thoại không hợp lệ",
                  },
                })}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div className="md:col-span-2">
              <Label className="mb-1.5">Email</Label>
              <Input disabled {...register("email")} />
            </div>
          </div>

          <Button disabled={loading} className={'cursor-pointer'} type="submit">Lưu thay đổi {loading && <ClipLoader color="white" size={15} />}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
