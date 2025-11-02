import { Link } from "react-router";

function LoginForm() {
  const INPUT_STYLE =
    "w-full rounded-[6px] px-3 py-2.5 text-[#646464] outline-none border-[#e5e9ec] border-[1px] focus:border-[#80bdff]";

  return (
    <>
      <div className="flex justify-center mt-14">
        <div className="w-[70%]">
          <h1 className="font-bold text-2xl mb-3.5">Thông tin đăng nhập</h1>
          <form action="">
            <div className="mb-4">
              <label htmlFor="idName" className="block mb-2.5">
                ID đăng nhập
              </label>
              <input
                type="text"
                name="idName"
                id="idName"
                placeholder="Nhập email hoặc số điện thoại"
                className={INPUT_STYLE}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="" className="block mb-2.5">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Nhập mật khẩu"
                className={INPUT_STYLE}
              />
            </div>
            <input
              type="checkbox"
              name="remember"
              id="remember"
              className="w-4 h-4 border-2 border-gray-400 rounded mr-2.5 mb-5"
            />
            <label htmlFor="remember">Ghi nhớ mật khẩu</label>
            <button
              className="block mb-3.5 py-1.5 px-4 bg-[#019788] text-[#fff] font-bold text-[1rem] rounded-[6px] cursor-pointer hover:bg-[#027d72] transition-all"
              type="submit"
            >
              Đăng nhập
            </button>
            <div className="grid grid-cols-2 gap-2.5">
              <Link className="text-[#019788] underline text-[14px]">
                Bạn đã quên mật khẩu
              </Link>
              <Link to={'/register'} className="text-[#019788] underline text-[14px]">
                Tạo mới tài khoản
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
export default LoginForm