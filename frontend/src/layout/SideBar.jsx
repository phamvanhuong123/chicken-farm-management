import { useEffect, useState } from 'react';
import { Home, Package, CircleDollarSign, NotepadText, UsersRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getUserState } from '~/slices/authSlice';
function SideBar({ isCollapsed }) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const user = useSelector(state => getUserState(state))
  const menuItems = [
    // {
    //   path: "/dashboard",
    //   icon: BarChart3,
    //   label: "Tổng quan",
    //   end: true,
    //   badge: null
    // },
    {
      path: "/dashboard/flocks",
      icon: Home,
      label: "Đàn gà",
      end: false,
      badge: "1"
    },
    {
      path: "/dashboard/journal",
      icon: NotepadText,
      label: "Nhật kí",
      end: false,
      badge: "2"
    },
    {
      path: "/dashboard/inventory",
      icon: Package,
      label: "Kho vật tư",
      end: false,
      badge: "3"
    },
    {
      path: "/dashboard/flock-transactions",
      icon: CircleDollarSign,
      label: "Nhập/xuất chuồng",
      end: false,
      badge: "4"
    },
    {
      path: "/dashboard/areas",
      icon: CircleDollarSign,
      label: "Khu nuôi",
      end: false,
      badge: "5"
    },
    {
      path: "/dashboard/staff",
      icon: UsersRound,
      label: "Nhân sự và công việc",
      end: false,
      badge: "6"
    }
  ];

  return (
    <aside className={`
      
      border-r border-gray-200 transition-all bg-white duration-300 ease-in-out
      ${isCollapsed ? 'w-[105px] mt-13' : 'w-64 mt-10'}
      h-screen fixed left-0 top-0 z-40
    `}>

      {/* Navigation Section */}
      <nav className="flex-1 px-3 py-6 h-[calc(100%-150px)] ">
        {/* Main Menu */}
        <div>
          
          
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.end}
                    onMouseEnter={() => setActiveTooltip(item.path)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className={({ isActive }) => `
                      group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25' 
                        : 'text-black hover:bg-gray-100  hover:shadow-md border border-transparent hover:border-gray-600/50'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                      hover:scale-101
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="relative">
                          <Icon 
                            className={`transition-transform duration-200 ${isActive ? 'text-white' : 'text-black'}`} 
                            size={20} 
                          />
                          {/* {item.badge && !isActive && (
                            <span className={`
                              absolute -top-2 -right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full
                              ${isCollapsed ? 'scale-75' : ''}
                              ${isActive 
                                ? 'bg-white text-emerald-600' 
                                : 'bg-emerald-500 text-white shadow-lg'
                              }
                            `}>
                              {item.badge}
                            </span>
                          )} */}
                        </div>
                        
                        {!isCollapsed && (
                          <div className="flex items-center justify-between flex-1">
                            <span className="font-medium text-sm">{item.label}</span>
          
                          </div>
                        )}
                        
                        {/* Enhanced Tooltip */}
                        {isCollapsed && activeTooltip === item.path && (
                          <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-2xl border border-gray-700 animate-in fade-in-0 zoom-in-95">
                            <div className="font-medium">{item.label}</div>
                            {item.badge && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                {/* <span className="text-xs text-emerald-400">{item.badge} mục</span> */}
                                <span className="text-xs text-emerald-400"></span>
                              </div>
                            )}
                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-t border-gray-700"></div>
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      {/* User Section */}
      <div className="p-4 border-t border-gray-700/50">
        <div className={`
          flex items-center gap-3 p-3 rounded-xl bg-[#ffff]
          ${isCollapsed ? 'justify-center' : ''}
          backdrop-blur-sm border border-gray-600/30
        `}>
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center font-semibold text-white shadow-lg flex-shrink-0">
            H
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold  truncate">{user?.userName}</p>
              <p className="text-xs text-gray-400 truncate">Quản lý trang trại</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-emerald-400 font-medium">Online</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default SideBar;