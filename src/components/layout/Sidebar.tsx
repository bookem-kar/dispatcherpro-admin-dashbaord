import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Activity, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
const navigation = [{
  name: 'Dashboard',
  href: '/dashboard',
  icon: LayoutDashboard
}, {
  name: 'Companies',
  href: '/companies',
  icon: Building2
}, {
  name: 'Users',
  href: '/users',
  icon: Users
}, {
  name: 'Activity',
  href: '/activity',
  icon: Activity
}, {
  name: 'API Settings',
  href: '/api-settings',
  icon: Settings
}];
export function Sidebar() {
  return <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">DP Admin Panel </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map(item => <NavLink key={item.name} to={item.href} className={({
        isActive
      }) => cn('flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent')}>
            <item.icon className="mr-3 h-4 w-4" />
            {item.name}
          </NavLink>)}
      </nav>

    </div>;
}