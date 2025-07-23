import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Activity,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Activity', href: '/activity', icon: Activity },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Platform Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )
            }
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )
          }
        >
          <Settings className="mr-3 h-4 w-4" />
          Settings
        </NavLink>
      </div>
    </div>
  );
}