import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Mail, Briefcase } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/contact', label: 'Contact', icon: Mail },
    { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <img 
                src="/Asset 1@4x.png" 
                alt="GoVivid Media" 
                className="h-8 w-auto hover:scale-110 transition-transform duration-300 animate-pulse"
              />
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`group flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    location.pathname === path
                      ? 'bg-white text-slate-900 shadow-lg shadow-white/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-lg hover:shadow-blue-500/20'
                  }`}
                >
                  <Icon 
                    size={16} 
                    className={`transition-all duration-300 ${
                      location.pathname === path
                        ? 'animate-bounce'
                        : 'group-hover:rotate-12 group-hover:scale-110 animate-pulse'
                    }`}
                  />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Mobile menu */}
          <div className="md:hidden flex items-center space-x-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`group p-2 rounded-md transition-all duration-300 hover:scale-110 ${
                  location.pathname === path
                    ? 'bg-white text-slate-900 shadow-lg shadow-white/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-lg hover:shadow-blue-500/20'
                }`}
                title={label}
              >
                <Icon 
                  size={18} 
                  className={`transition-all duration-300 ${
                    location.pathname === path
                      ? 'animate-bounce'
                      : 'group-hover:rotate-12 group-hover:scale-110 animate-pulse'
                  }`}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;