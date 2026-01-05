import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from "~/utils/validators";
import { useState } from "react";
import axiosInstance from "~/apis";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordForm({ dataUser }) {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log("Password submit:", data);
    try {
      setLoading(true);
      await axiosInstance.put(`/auth/user/${dataUser._id}`, data);
      toast.success("Cật nhật mật khẩu thành công");
      reset();
    } catch (e) {
      toast.error("Cật nhật mật khẩu thất bại : " + e.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
          <div>
            <Label>Mật khẩu hiện tại</Label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                {...register("currentPassword", {
                  required: "Vui lòng nhập mật khẩu hiện tại",
                })}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.currentPassword && (
              <p className="text-sm text-red-500 mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label>Mật khẩu mới</Label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                {...register("newPassword", {
                  required: "Vui lòng nhập mật khẩu mới",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                  pattern: {
                    value: PASSWORD_RULE,
                    message: PASSWORD_RULE_MESSAGE,
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.newPassword && (
              <p className="text-sm text-red-500 mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <Button disabled={loading} type="submit" variant="destructive">
            Đổi mật khẩu
            {loading && <ClipLoader color="white" size={15} />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
