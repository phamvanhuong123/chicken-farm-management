import { useState } from 'react';
import { Menu, X, Bell, User, LogIn, UserPlus, ChevronDown } from 'lucide-react';
import { NavLink } from 'react-router-dom';

function Header({ onToggleSidebar, isSidebarCollapsed }) {
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [isLoggedIn] = useState(false); // Chưa đăng nhập

  return (
    <header className="h-16 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700/50 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50 backdrop-blur-sm shadow-2xl">
      {/* Left Section - Toggle & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 hover:bg-gray-700/50 rounded-xl transition-all duration-200 text-gray-300 hover:text-white hover:scale-105"
        >
          {isSidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full shadow-lg shadow-emerald-500/20"></div>
          <h1 className="text-xl font-bold text-white">
            Farm Management
          </h1>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm trang trại, đàn gà, vật tư..."
            className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-gray-800 text-white placeholder-gray-400 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right Section - Chưa đăng nhập */}
      <div className="flex items-center gap-3">
        {/* Auth Menu */}
        <div className="relative">
          <button
            onClick={() => setShowAuthMenu(!showAuthMenu)}
            className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group border border-gray-600/50 text-gray-300 hover:text-white"
          >
            <User size={20} />
            <span className="text-sm font-medium">Tài khoản</span>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${showAuthMenu ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Auth Menu */}
          {showAuthMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowAuthMenu(false)}
              ></div>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 py-2 z-50 animate-in fade-in-0 zoom-in-95">
                {/* Welcome Message */}
                <div className="px-4 py-3 border-b border-gray-700/50">
                  <p className="text-sm font-semibold text-white">Chào bạn!</p>
                  <p className="text-xs text-gray-400 mt-1">Đăng nhập để trải nghiệm</p>
                </div>
                
                {/* Menu Items */}
                <div className="py-2">
                  <NavLink
                    to="/login"
                    onClick={() => setShowAuthMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700/50 transition-all duration-200 text-gray-300 hover:text-white rounded-lg mx-2 group"
                  >
                    <LogIn size={18} className="text-emerald-400" />
                    <span className="text-sm font-medium">Đăng nhập</span>
                  </NavLink>
                  
                  <NavLink
                    to="/register"
                    onClick={() => setShowAuthMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700/50 transition-all duration-200 text-gray-300 hover:text-white rounded-lg mx-2 group"
                  >
                    <UserPlus size={18} className="text-blue-400" />
                    <span className="text-sm font-medium">Đăng ký</span>
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
    </header>
  );
}

export default Header;