import { Facebook, Instagram, Mail, Phone, MapPin, Heart, ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const footerLinks = {
    product: [
      { label: 'Quản lý đàn gà', href: '#' },
      { label: 'Quản lý kho', href: '#' },
      { label: 'Báo cáo thống kê', href: '#' },
      { label: 'Tính năng', href: '#' }
    ],
    support: [
      { label: 'Trung tâm trợ giúp', href: '#' },
      { label: 'Hướng dẫn sử dụng', href: '#' },
      { label: 'Câu hỏi thường gặp', href: '#' },
      { label: 'Liên hệ hỗ trợ', href: '#' }
    ],
    company: [
      { label: 'Về chúng tôi', href: '#' },
      { label: 'Tin tức', href: '#' },
      { label: 'Tuyển dụng', href: '#' },
      { label: 'Đối tác', href: '#' }
    ]
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-40 flex items-center justify-center"
        >
          <ArrowUp size={20} />
        </button>
      )}

      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <span className="font-bold text-3xl text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  FarmGo
                </span>
              </div>
              
              <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-md">
                Giải pháp quản lý trang trại gia cầm thông minh, giúp nông dân tối ưu hóa 
                quy trình chăn nuôi và nâng cao hiệu quả kinh doanh với công nghệ 4.0.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm group">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <MapPin size={18} className="text-emerald-400" />
                  </div>
                  <span>123 Đường Nông Nghiệp, Quận 9, TP.HCM</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm group">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <Phone size={18} className="text-emerald-400" />
                  </div>
                  <span>0123 456 789</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm group">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <Mail size={18} className="text-emerald-400" />
                  </div>
                  <span>support@farmgo.vn</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex items-center gap-3 mt-8">
                {[
                  { icon: Facebook, href: '#', color: 'hover:bg-blue-600' },
                  { icon: Instagram, href: '#', color: 'hover:bg-pink-600' },
                  { icon: Mail, href: '#', color: 'hover:bg-red-600' }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.href} 
                    className={`
                      w-11 h-11 bg-gray-800 rounded-xl flex items-center justify-center 
                      transition-all duration-200 hover:scale-110 hover:shadow-lg ${social.color}
                    `}
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-6">
                Sản phẩm
              </h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link, index) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="text-sm hover:text-emerald-400 transition-all duration-200 inline-flex items-center group"
                    >
                      <span className="w-0 h-0.5 bg-emerald-400 group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-3"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-6">
                Hỗ trợ
              </h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="text-sm hover:text-emerald-400 transition-all duration-200 inline-flex items-center group"
                    >
                      <span className="w-0 h-0.5 bg-emerald-400 group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-3"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-6">
                Công ty
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="text-sm hover:text-emerald-400 transition-all duration-200 inline-flex items-center group"
                    >
                      <span className="w-0 h-0.5 bg-emerald-400 group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-3"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400 flex items-center gap-2">
                © {currentYear} FarmGo. Made with <Heart size={14} className="text-red-500 animate-pulse" /> in Vietnam
              </p>
              
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="hover:text-emerald-400 transition-colors duration-200">
                  Điều khoản dịch vụ
                </a>
                <span className="text-gray-600">•</span>
                <a href="#" className="hover:text-emerald-400 transition-colors duration-200">
                  Chính sách bảo mật
                </a>
                <span className="text-gray-600">•</span>
                <a href="#" className="hover:text-emerald-400 transition-colors duration-200">
                  Cookie
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;