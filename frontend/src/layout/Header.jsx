import { useState } from "react";
import {
  Menu,
  X,
  Bell,
  User,
  LogIn,
  UserPlus,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { RiMenuFold2Line } from "react-icons/ri";
import { RiMenuFold2Fill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, getUserState } from "~/slices/authSlice";
function Header({ onToggleSidebar, isSidebarCollapsed }) {
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const user = useSelector((state) => getUserState(state));
  const dispatch = useDispatch()
  const handleLogOut = ()=>{
      localStorage.clear("authToken")
      dispatch(clearUser())
  }
  return (
    <>
      <div className="flex flex-row px-6 bg-white border border-gray-200 h-14 fixed top-0 left-0 right-0 z-50">
        <div
          className={`${
            isSidebarCollapsed ? "w-20" : "w-[232px]"
          } transition-all duration-300 ease-in-out  flex justify-between border-r border-gray-200 items-center`}
        >
          <p className="font-bold">Farm Go</p>
        </div>
        <div className="px-2 flex flex-1 items-center justify-between">
          <div className="flex  items-center gap-1.5 ">
            <button className="cursor-pointer">
              {isSidebarCollapsed ? (
                <RiMenuFold2Line onClick={onToggleSidebar} />
              ) : (
                <RiMenuFold2Fill onClick={onToggleSidebar} />
              )}
            </button>
            <p className="font-bold">Trang trại gia cầm</p>
          </div>
          <div className="flex items-center gap-4  px-1.5">
            <div className="flex items-center gap-3">
              {/* Auth Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowAuthMenu(!showAuthMenu)}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-200 rounded-xl hover:cursor-pointer transition-all duration-200 group border border-gray-600/50 text-gray-300 hover:text-white"
                >
                  <User size={20} color="#000" />
                  <span className="text-sm font-medium text-black">
                    Tài khoản
                  </span>
                  <ChevronDown
                    size={16}
                    color="#000"
                    className={`transition-transform duration-200 ${
                      showAuthMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Auth Menu */}
                {showAuthMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowAuthMenu(false)}
                    ></div>

                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200  py-2 z-50">
                      {/* Welcome Message */}
                      <div className="px-4 py-3 border-b border-gray-700/50">
                        <p className="text-sm font-semibold ">Chào bạn!</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Đăng nhập để trải nghiệm
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {user ? (
                          <NavLink
                            to="/login"
                            onClick={handleLogOut}
                            className=" flex items-center gap-3 px-4 py-2.5 hover:bg-gray-200 transition-all duration-100 text-gray-300 hover:text-white rounded-lg mx-2 group"
                          >
                            
                            <LogOut size={18} className="text-emerald-400"  />
                            <span className="text-sm font-medium text-black">
                              Đăng xuất
                            </span>
                          </NavLink>
                        ) : (
                          <NavLink
                            to="/login"
                            onClick={() => setShowAuthMenu(false)}
                            className=" flex items-center gap-3 px-4 py-2.5 hover:bg-gray-200 transition-all duration-100 text-gray-300 hover:text-white rounded-lg mx-2 group"
                          >
                            <LogIn size={18} className="text-emerald-400" />
                            <span className="text-sm font-medium text-black">
                              Đăng nhập
                            </span>
                          </NavLink>
                        )}

                        <NavLink
                          to="/register"
                          onClick={() => setShowAuthMenu(false)}
                          className=" flex items-center gap-3 px-4 py-2.5 hover:bg-gray-200 transition-all duration-100 text-gray-300 hover:text-white rounded-lg mx-2 group"
                        >
                          <UserPlus size={18} className="text-blue-400" />
                          <span className="text-sm font-medium text-black">
                            Đăng ký
                          </span>
                        </NavLink>
                      </div>

                      {/* Quick Info */}
                      <div className="border-t border-gray-700/50 mt-2 pt-2">
                        <div className="px-4 py-2">
                          <p className="text-xs text-gray-400 text-center">
                            Tham gia cùng 500+ nông trại
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
