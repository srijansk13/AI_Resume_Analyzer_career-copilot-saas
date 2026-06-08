import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  Target, 
  Edit3, 
  FileText, 
  User
} from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const getNavItems = () => [
    { name: 'Home', href: '/dashboard', icon: Home, match: '/dashboard', exact: true },
    { name: 'JD Matcher', href: '/dashboard/job-match', icon: Target, match: '/dashboard/job-match' },
    { name: 'Editor', href: '/dashboard/editor', icon: Edit3, match: '/dashboard/editor' },
    { name: 'History', href: '/dashboard/resumes', icon: FileText, match: '/dashboard/resumes', exact: pathname === '/dashboard/resumes' },
    { name: 'Profile', href: '/dashboard/settings', icon: User, match: '/dashboard/settings' },
  ];

  const items = getNavItems();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 px-2 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-1 print:hidden">
      <div className="absolute inset-0 bg-[#050508]/85 backdrop-blur-xl border-t border-white/[0.05] pointer-events-none" style={{ bottom: 0, height: '100%', top: 'auto', paddingTop: '16px' }}></div>
      <div className="relative flex items-center justify-between bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl rounded-2xl p-1.5 max-w-md mx-auto shadow-2xl shadow-black/60">
        {items.map((item) => {
          const isActive = item.exact ? pathname === item.match : pathname.startsWith(item.match);
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="relative flex-1 flex flex-col items-center justify-center p-1.5 group outline-none">
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 bg-white/[0.08] rounded-xl border border-white/[0.05]"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <Icon className={`w-4 h-4 mb-1 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className={`text-[9px] font-bold tracking-wide transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
