'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Target,
  LayoutTemplate
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; tier: string } | null>(null);

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Resumes', href: '/dashboard/resumes', icon: FileText },
    { name: 'Job Matcher', href: '/dashboard/job-match', icon: Target },
    { name: 'Templates', href: '/dashboard/templates', icon: LayoutTemplate },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
        }
      })
      .catch(err => console.error('Failed to load user info', err));
  }, []);

  return (
    <div className="min-h-screen bg-[#050508] text-white flex relative overflow-hidden font-sans">
      {/* Ambient glass mesh backgrounds */}
      <div className="absolute top-[-10%] left-[5%] w-[600px] h-[600px] bg-indigo-500/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[5%] w-[700px] h-[700px] bg-purple-500/[0.03] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-[#0f0f13]/80 border border-white/5 backdrop-blur-md rounded-xl hover:bg-white/5">
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : -300 }}
        className="fixed lg:sticky top-0 left-0 z-40 w-64 h-screen bg-[#07070a]/60 backdrop-blur-xl border-r border-white/[0.04] flex flex-col pt-20 lg:pt-8"
      >
        {/* Dynamic Premium Logo */}
        <div className="px-6 mb-8 hidden lg:flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
              <span className="text-[12px] font-black text-white">C</span>
            </div>
            <h2 className="text-sm font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300 tracking-tight">
              Career Copilot
            </h2>
          </div>
          <span className="text-[9px] font-black tracking-widest uppercase bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full scale-95 origin-right">
            AI
          </span>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all relative ${
                  isActive 
                    ? 'bg-white/[0.03] text-white border border-white/[0.06] shadow-[0_0_15px_-3px_rgba(255,255,255,0.03)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.015]'
                }`}>
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active-pill"
                      className="absolute left-0 w-1 h-5 rounded-r bg-gradient-to-b from-indigo-500 to-purple-500"
                    />
                  )}
                  <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span className="text-xs font-semibold tracking-wide">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User profile & dynamic actions */}
        <div className="p-4 mt-auto border-t border-white/[0.04] bg-white/[0.005]">
          <div className="flex items-center space-x-3 px-2 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="relative h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-indigo-500/10">
              {user ? user.name.substring(0, 1).toUpperCase() : 'U'}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#07070a] shadow-sm animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{user ? user.name : 'Member'}</p>
              <div className="flex items-center space-x-1.5">
                <span className="text-[9px] uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1 rounded-sm">
                  {user ? user.tier : 'sandbox'}
                </span>
                <span className="text-[9px] text-gray-500 truncate">• Active</span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => {
              document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
              window.location.href = '/login';
            }}
            className="w-full mt-2.5 justify-start text-[11px] font-black uppercase tracking-wider text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
          >
            <LogOut className="mr-2 h-4 w-4 text-gray-600 group-hover:text-red-400" />
            Log out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-0 min-w-0 flex flex-col relative z-10 bg-transparent">
        {children}
      </main>
    </div>
  );
}
