import { useForm } from "react-hook-form";
import axiosInstance from "~/apis";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,50}$/;

export default function StepResetPassword({ email,otp }) {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await axiosInstance.post("auth/forgot-password/reset", {
        email,
        password: data.newPassword,
        otp : otp
      });

      toast.success("Đổi mật khẩu thành công");
      navigate("/login");
    } catch (e) {
      toast.error(e.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Label>Mật khẩu mới</Label>
      <Input
        type="password"
        {...register("newPassword", {
          required: "Vui lòng nhập mật khẩu mới",
          pattern: {
            value: PASSWORD_RULE,
            message:
              "8–50 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
          }
        })}
      />
      {errors.newPassword && (
        <p className="text-red-500 text-sm">
          {errors.newPassword.message}
        </p>
      )}

      <Button className="mt-4 w-full">Đổi mật khẩu</Button>
    </form>
  );
}
