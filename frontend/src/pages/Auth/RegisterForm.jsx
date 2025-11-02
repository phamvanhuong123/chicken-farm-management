import { useState } from "react";
import { Link } from "react-router";

function RegisterForm() {
  const INPUT_STYLE ="w-full rounded-[6px] px-3 py-2.5 text-[#646464] outline-none border-[#e5e9ec] border-[1px] focus:border-[#80bdff]";
  const [activeEmail,setActiveEmail] = useState(true);
  return (
    <>
      <div className="flex justify-center mt-14">
        <div className="w-[70%] py-11">
          <h1 className="font-bold text-2xl mb-3.5">Nhập thông tin đăng ký</h1>
          <form action="">
            <div className="mb-3">
              <label htmlFor="username" className="block mb-2.5">
                Họ và tên <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Họ và tên"
                className={INPUT_STYLE}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="block mb-2.5">
                Số điện thoại đăng nhập <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="phone"
                id="phone"
                placeholder="09..."
                className={INPUT_STYLE}
              />
              <p className="text-[11px] mt-3.5">
                Số điện thoại cần chính xác, sẽ dùng để làm tài khoản đăng nhập.
              </p>
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="block mb-2.5">
                Email
              </label>

              <input
                type="text"
                name="email"
                id="email"
                placeholder="Email"
                className={INPUT_STYLE}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="" className="block mb-2.5">
                Mật khẩu <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Nhập mật khẩu"
                className={INPUT_STYLE}
              />
              <p className="text-[11px] mt-3.5">
                Mật khẩu phải có độ dài từ 8 - 50 ký tự, có chữ hoa, chữ thường,
                số, ký tự đặc biệt.
              </p>
            </div>
            <div className="mb-3">
              <div className="flex justify-between mb-2.5 flex-wrap max-[875px]:gap-2.5">
                <label  className="  w-[220px] max-[875px]:w-full">
                  Mã xác minh <span className="text-red-600">*</span>
                </label>
                <div className="flex-1 flex justify-end max-[875px]:justify-normal">
                  <button type="submit" onClick={(e) =>{e.preventDefault();  setActiveEmail(true)}}  className={`${activeEmail ? 'text-white bg-red-500' : 'text-black border-[#e5e9ec] border-[1px] hover:text-[#019788]'} px-3 rounded-[6px] mr-2 cursor-pointer text-[12px]`}>Email</button>
                  <button onClick={(e) =>{e.preventDefault();  setActiveEmail(false)}} className={`${!activeEmail ? 'text-white bg-red-500' : 'text-black border-[#e5e9ec] border-[1px] hover:text-[#019788]'}  rounded-[6px] px-3 cursor-pointer text-[12px]`}>Điện thoại</button>
                </div>
              </div>
              <div className="flex justify-between gap-2.5 flex-wrap">
                <input
                type="text"
                name="verification_code"
                id="verification_code"
                placeholder="Nhập mã xác minh"
                className={'w-[60%] rounded-[6px] px-3 py-2.5 text-[#646464] outline-none border-[#e5e9ec] border-[1px] focus:border-[#80bdff] max-[900px]:w-full max-[900px]:text-[12px]'}
              />
              <button disabled className="text-[14px] bg-[#6c757d] p-[10px] text-[#FFF] rounded-[6px] font-[500] cursor-pointer disabled:cursor-not-allowed">Nhận mã xác minh</button>
              </div>
            </div>
            <button
                disabled
              className="block mb-3.5 py-1.5 px-4 bg-[#019788] text-[#fff] font-bold text-[1rem] rounded-[6px] cursor-pointer hover:bg-[#027d72] transition-all disabled:cursor-not-allowed"
              type="submit"
            >
                Tạo tài khoản
            </button>
            <div className="grid grid-cols-2 gap-1.5">
              <p className=" text-[14px]">
                Bạn đã có tài khoản ?
              </p>
              <Link to={'/login'} className="text-[#019788] underline text-[14px]">
                Đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
export default RegisterForm;
