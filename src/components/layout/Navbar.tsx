import { NavLink, useLocation } from 'react-router-dom';
import { FileText, Activity, GitCompare, Download, Sparkles } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/create', label: '创建', icon: FileText },
    { path: '/diagnose', label: '诊断', icon: Activity },
    { path: '/compare', label: '对照', icon: GitCompare },
    { path: '/export', label: '导出', icon: Download },
  ];

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-700 to-primary-900 rounded-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-semibold text-primary-900">作品集诊断</h1>
              <p className="text-xs text-zinc-500 -mt-0.5">Portfolio Diagnostics</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`nav-link flex items-center gap-2 ${
                    isActive ? 'nav-link-active' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft"></span>
              <span className="text-xs text-green-700 font-medium">本地保存中</span>
            </div>
          </div>
        </div>

        <div className="md:hidden flex items-center justify-around py-2 border-t border-zinc-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-md transition-colors ${
                  isActive ? 'text-primary-800 bg-primary-50' : 'text-zinc-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
