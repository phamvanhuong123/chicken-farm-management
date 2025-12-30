import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "~/apis";
import { toast } from "react-toastify";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

export default function StepOtp({ email, onSuccess }) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60); 

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);


  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await axiosInstance.post("/auth/forgot-password/verify-otp", {
        email,
        otp: data.otp
      });
      toast.success("OTP hợp lệ");
      onSuccess(data.otp); 
    } catch (e) {
      toast.error(e.response?.data?.message || "OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await axiosInstance.post("/auth/forgot-password/send-otp", { email });
      toast.success("OTP mới đã được gửi");
      setCountdown(30); 
    } catch (e) {
      toast.error(e.response?.data?.message || "Không thể gửi lại OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>OTP</Label>
        <Input
          {...register("otp", { required: "Vui lòng nhập OTP" })}
        />
        {errors.otp && (
          <p className="text-red-500 text-sm mt-1">
            {errors.otp.message}
          </p>
        )}
      </div>

      <Button disabled={loading} className="w-full">
        Xác thực OTP
      </Button>

   
      <div className="text-center text-sm text-gray-500">
        Không nhận được OTP?{" "}
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={countdown > 0 || loading}
          className={`font-medium ${
            countdown > 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-blue-600 hover:underline"
          }`}
        >
          {countdown > 0
            ? `Gửi lại (${countdown}s)`
            : "Gửi lại OTP"}
        </button>
      </div>
    </form>
  );
}
