import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Menu, 
  X,
  Truck
} from "lucide-react";
import { Button } from "./ui/button";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "الرئيسية", icon: LayoutDashboard },
    { path: "/clients", label: "العملاء", icon: Users },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen" dir="rtl">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 right-0 z-50
          w-64 bg-[#003366] text-white
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#c2a356] rounded-lg flex items-center justify-center">
              <Truck className="w-7 h-7 text-[#003366]" />
            </div>
            <div>
              <h1 className="font-bold text-lg">شركة الغدير</h1>
              <p className="text-xs text-[#c2a356]">للنقل والتخليص الكمركي</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200 font-semibold
                ${isActive(item.path) 
                  ? 'bg-white/15 text-[#c2a356] border-r-4 border-[#c2a356]' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }
              `}
              data-testid={`nav-${item.path === '/' ? 'home' : item.path.slice(1)}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-white/10">
          <p className="text-xs text-white/60 text-center">
            © 2026 شركة الغدير
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between lg:justify-end shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            data-testid="mobile-menu-btn"
          >
            <Menu className="w-6 h-6" />
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>📍 زاخو – إبراهيم الخليل</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">📞 07504084359</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 bg-[#F8F9FA]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
