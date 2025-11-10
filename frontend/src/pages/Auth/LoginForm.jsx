import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import FieldErrorAlert from "~/components/FieldErrorAlert";
import { FIELD_REQUIRED_MESSAGE } from "~/utils/validators";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import { login as apiLogin } from "~/services/authService";
import { MoonLoader} from "react-spinners"
function LoginForm() {
  const [loading,setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const INPUT_STYLE = "w-full rounded-[6px] px-3 py-2.5 text-[#646464] outline-none border-[#e5e9ec] border-[1px] focus:border-[#80bdff]";
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const submitLogin = async (data) => {
    try {
      setStatusMessage(null);
      setLoading(true)
      const res = await apiLogin(data);
      // res should contain token
      
      const token = res.token;
      if (token) {
        localStorage.setItem("authToken", token);
        setStatusMessage({ type: "success", text: "Đăng nhập thành công" });
        // navigate to home or dashboard
        setTimeout(() => navigate("/"), 800);
      } else {
        setStatusMessage({ type: "error", text: res.message || "Không nhận được token" });
      }
      
    } catch (err) {
      const text = err?.response?.data?.message || err.message || "Lỗi đăng nhập";
      setStatusMessage({ type: "error", text });
    }
    finally{
      setLoading(false)
    }
  };

  return (
    <div className="flex justify-center mt-14">
      <div className="w-[70%]">
        <h1 className="font-bold text-2xl mb-3.5">Thông tin đăng nhập</h1>
        <form onSubmit={handleSubmit(submitLogin)}>
          <div className="mb-4">
            <label htmlFor="idName" className="block mb-2.5">ID đăng nhập</label>
            <input
              type="text"
              id="idName"
              placeholder="Nhập email hoặc số điện thoại"
              className={INPUT_STYLE}
              {...register('idName', { required: FIELD_REQUIRED_MESSAGE })}
            />
            <FieldErrorAlert errors={errors} fieldName={'idName'} />
          </div>

          <div className="mb-4 relative">
            <label className="block mb-2.5">Mật khẩu</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              {...register('password', { required: FIELD_REQUIRED_MESSAGE })}
              placeholder="Nhập mật khẩu"
              className={INPUT_STYLE}
            />
            {!showPassword ? <LuEye onClick={() => setShowPassword(true)} className="absolute right-2 top-[50px] cursor-pointer" /> : <LuEyeClosed onClick={() => setShowPassword(false)} className="absolute right-2 top-[50px] cursor-pointer" />}
            <FieldErrorAlert errors={errors} fieldName={'password'} />
          </div>

          <div className="mb-4">
            <label className="inline-flex items-center">
              <input type="checkbox" className="w-4 h-4 border-2 border-gray-400 rounded mr-2.5" />
              Ghi nhớ mật khẩu
            </label>
          </div>
          
          <div className="flex gap-3">
            <button disabled={loading} className="disabled:cursor-not-allowed disabled:opacity-30  block mb-3.5 py-1.5 px-4 bg-[#019788] text-[#fff] font-bold text-[1rem] rounded-[6px] cursor-pointer hover:bg-[#027d72] transition-all" type="submit">
            Đăng nhập
          </button>
           <MoonLoader loading={loading} size={30} color={'#019788'} />
          </div>
          
          {statusMessage && (
            <div className={`p-3 rounded ${statusMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {statusMessage.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <Link className="text-[#019788] underline text-[14px]">Bạn đã quên mật khẩu</Link>
            <Link to={'/register'} className="text-[#019788] underline text-[14px]">Tạo mới tài khoản</Link>
          </div>
        </form>
      </div>
      
    </div>
   
  );
}

export default LoginForm;