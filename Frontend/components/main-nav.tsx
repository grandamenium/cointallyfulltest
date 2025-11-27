'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Wallet,
  List,
  FilePlus,
  Files,
  User,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/uiStore';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/wallets', label: 'Wallets', icon: Wallet },
  { href: '/transactions', label: 'Transactions', icon: List },
  { href: '/new-form', label: 'New Form', icon: FilePlus },
  { href: '/view-forms', label: 'View Forms', icon: Files },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/support', label: 'Support', icon: HelpCircle },
];

export function MainNav() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b px-4">
        {sidebarCollapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-b from-[#14BEFF] to-[#3F6EFF] text-sm font-bold text-white">
            C
          </div>
        ) : (
          <div className="font-heading text-xl font-bold">
            <span className="bg-gradient-to-r from-[#14BEFF] to-[#3F6EFF] bg-clip-text text-transparent">
              CoinTally
            </span>
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <div className="px-3 py-3">
        <Button
          variant="ghost"
          size={sidebarCollapsed ? 'icon' : 'sm'}
          onClick={toggleTheme}
          className="w-full justify-start"
          aria-label={`Toggle theme (currently ${theme === 'dark' ? 'dark' : 'light'} mode)`}
        >
          {theme === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          {!sidebarCollapsed && <span className="ml-2">Theme</span>}
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size={sidebarCollapsed ? 'icon' : 'sm'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {!sidebarCollapsed && <span className="ml-2">{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="w-full"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
