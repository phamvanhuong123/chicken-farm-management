import { NavLink } from "react-router"
import { AiOutlineDashboard } from "react-icons/ai";
import { HiOutlineHome } from "react-icons/hi2";
import { MdMapsHomeWork } from "react-icons/md";
function SideBar() {
  const baseClass ="w-full flex items-center px-3 py-2.5 rounded-xl text-left transition-colors font-semibold"
  const activeClass = "bg-[#27A447] text-white font-semibold"
  const normalClass = "text-gray-700 hover:bg-gray-100 hover:text-[#27A447]"

  return (
    <div className="w-64 flex justify-between border-r border-gray-200 items-center pr-3 py-3">
      <ul className="list-none w-full flex flex-col gap-2">
        <li>
          <NavLink
            to="/dasboard"
            end
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : normalClass}`
            }
          >
            <AiOutlineDashboard className="mr-2.5" />
            <span>Tổng quan</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/dasboard/flocks"
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : normalClass}`
            }
          >
            <HiOutlineHome className="mr-2.5" />
            <span>Đàn gà</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/dasboard/inventory"
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : normalClass}`
            }
          >
            <MdMapsHomeWork className="mr-2.5"/>
            <span>Kho vật tư</span>
          </NavLink>
        </li>
      </ul>
    </div>
  )
}

export default SideBar