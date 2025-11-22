import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FieldErrorAlert from "~/components/FieldErrorAlert";
import { useForm } from "react-hook-form";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  FIELD_REQUIRED_MESSAGE,
  PASSWORD_RULE,
  PASSWORD_RULE_MESSAGE,
  PHONE_RULE,
  PHONE_RULE_MESSAGE
} from "~/utils/validators";
import {
  register as apiRegister,
  verifyOtp as apiVerifyOtp,
  resendOtp as apiResendOtp
} from "~/services/authService";
import { MoonLoader } from "react-spinners";

function RegisterForm() {
  const { register: formRegister, handleSubmit, formState: { errors }, reset } = useForm();
  const navigate = useNavigate();
  const INPUT_STYLE = "w-full rounded-[6px] px-3 py-2.5 text-[#646464] outline-none border-[#e5e9ec] border-[1px] focus:border-[#80bdff]";
  
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [verifLoading, setVerifLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [loading,setLoading] = useState(false)
  
  const registerSubmit = async (data) => {
    try {
      setStatusMessage(null);
      setLoading(true)
      console.log('Sending register request with data:', data);
      const res = await apiRegister(data);
      console.log('Register response:', res);
      setOtpSent(true);
      setRegisteredEmail(data.email);
      setStatusMessage({ type: "success", text: res.message || "Đã gửi OTP đến email" });
    } catch (err) {
      console.error('Register error:', err);
      const text = err?.response?.data?.message || err.message || "Lỗi khi đăng ký";
      setStatusMessage({ type: "error", text });
    }
    finally{
      setLoading(false)
    }
  };

  const handleVerifyOtp = async (values) => {
    try {
      setVerifLoading(true);
      setStatusMessage(null);
      
      const otp = values.verification_code;
      const res = await apiVerifyOtp(registeredEmail, otp);
      setStatusMessage({ type: "success", text: res.message || "Xác thực thành công" });
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const text = err?.response?.data?.message || err.message || "Lỗi khi xác thực OTP";
      setStatusMessage({ type: "error", text });
    } finally {
      setVerifLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) {
      setStatusMessage({ type: "error", text: "Vui lòng nhập email và đăng ký trước." });
      return;
    }
    try {
      setResendLoading(true);
      const res = await apiResendOtp(registeredEmail);
      setStatusMessage({ type: "success", text: res.message || "Đã gửi lại OTP" });
    } catch (err) {
      const text = err?.response?.data?.message || err.message || "Lỗi khi gửi lại OTP";
      setStatusMessage({ type: "error", text });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-14">
      <div className="w-[70%] py-11">
        <h1 className="font-bold text-2xl mb-3.5">Nhập thông tin đăng ký</h1>

        <form onSubmit={handleSubmit(registerSubmit)}>
          <div className="mb-3">
            <label htmlFor="username" className="block mb-2.5">Họ và tên <span className="text-red-600">*</span></label>
            <input
              type="text"
              id="username"
              placeholder="Họ và tên"
              className={INPUT_STYLE}
              {...formRegister("username", { required: FIELD_REQUIRED_MESSAGE })}
            />
            <FieldErrorAlert errors={errors} fieldName={'username'} />
          </div>

          <div className="mb-3">
            <label htmlFor="phone" className="block mb-2.5">Số điện thoại (tùy chọn)</label>
            <input
              type="text"
              id="phone"
              placeholder="09..."
              className={INPUT_STYLE}
              {...formRegister('phone', {
                pattern: { value: PHONE_RULE, message: PHONE_RULE_MESSAGE }
              })}
            />
            <FieldErrorAlert errors={errors} fieldName={'phone'} />
            <p className="text-[11px] mt-3.5">
              Số điện thoại cần chính xác nếu bạn muốn dùng làm ID đăng nhập.
            </p>
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="block mb-2.5">Email <span className="text-red-600">*</span></label>
            <input
              type="text"
              id="email"
              placeholder="Email"
              className={INPUT_STYLE}
              {...formRegister('email', {
                required: FIELD_REQUIRED_MESSAGE,
                pattern: { value: EMAIL_RULE, message: EMAIL_RULE_MESSAGE }
              })}
            />
            <FieldErrorAlert errors={errors} fieldName={'email'} />
          </div>

          <div className="mb-3 relative">
            <label className="block mb-2.5">Mật khẩu <span className="text-red-600">*</span></label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Nhập mật khẩu"
              className={INPUT_STYLE}
              {...formRegister('password', {
                required: FIELD_REQUIRED_MESSAGE,
                pattern: { value: PASSWORD_RULE, message: PASSWORD_RULE_MESSAGE }
              })}
            />
            {!showPassword
              ? <LuEye onClick={() => setShowPassword(true)} className="absolute right-2 top-[50px] cursor-pointer" />
              : <LuEyeClosed onClick={() => setShowPassword(false)} className="absolute right-2 top-[50px] cursor-pointer" />
            }
            <FieldErrorAlert errors={errors} fieldName={'password'} />
            <p className="text-[11px] mt-3.5">
              Mật khẩu phải có độ dài từ 8 - 50 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt.
            </p>
          </div>

          {otpSent && (
            <form onSubmit={handleSubmit(handleVerifyOtp)} className="mb-4">
              <div className="mb-3">
                <label className="block mb-2.5">Mã xác minh (đã gửi tới email)</label>
                <input
                  type="text"
                  id="verification_code"
                  placeholder="Nhập mã xác minh"
                  className="w-[60%] rounded-[6px] px-3 py-2.5 text-[#646464] outline-none border-[#e5e9ec] border-[1px] focus:border-[#80bdff] max-[900px]:w-full max-[900px]:text-[12px]"
                  {...formRegister('verification_code', { required: FIELD_REQUIRED_MESSAGE })}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleSubmit(handleVerifyOtp)}
                    disabled={verifLoading}
                    className="text-[14px] bg-[#019788] p-[10px] text-[#FFF] rounded-[6px] font-[500] cursor-pointer"
                  >
                    {verifLoading ? 'Đang xác thực...' : 'Xác thực'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="text-[14px] bg-[#027d72] p-[10px] text-[#FFF] rounded-[6px] font-[500] cursor-pointer"
                  >
                    {resendLoading ? 'Đang gửi...' : 'Gửi lại mã'}
                  </button>
                </div>
                <FieldErrorAlert errors={errors} fieldName={'verification_code'} />
              </div>
            </form>
          )}

          {!otpSent && (
            <div className="flex gap-3">
              <button
              disabled={loading}
              className="disabled:cursor-not-allowed disabled:opacity-30 block mb-3.5 py-1.5 px-4 bg-[#019788] text-[#fff] font-bold text-[1rem] rounded-[6px] cursor-pointer hover:bg-[#027d72] transition-all "
              type="submit"
            >
              Tạo tài khoản
            </button>
           <MoonLoader loading={loading} size={30} color={'#019788'} />

            </div>
          )}

          {statusMessage && (
            <div className={`p-3 rounded ${statusMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {statusMessage.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 mt-4">
            <p className=" text-[14px]">Bạn đã có tài khoản ?</p>
            <Link to={'/login'} className="text-[#019788] underline text-[14px]">Đăng nhập</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;