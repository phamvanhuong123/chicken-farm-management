import { useForm } from "react-hook-form";
import axiosInstance from "~/apis";
import { toast } from "react-toastify";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

export default function StepEmail({ onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await axiosInstance.post("auth/forgot-password/send-otp", data);
      toast.success("OTP đã được gửi tới email");
      onSuccess(data.email);
    } catch (e) {
      toast.error(e.response?.data?.message || "Gửi OTP thất bại");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Label>Email</Label>
      <Input
        {...register("email", { required: "Vui lòng nhập email" })}
      />
      {errors.email && (
        <p className="text-red-500 text-sm">{errors.email.message}</p>
      )}

      <Button className="mt-4 w-full">Gửi OTP</Button>
    </form>
  );
}
