import React from 'react';
import { useUser, useRoleCheck } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoleBasedWorkflow } from '@/components/RoleBasedWorkflow';
import { Brain, ChevronDown, LogOut, Settings, User } from 'lucide-react';

interface AppSidebarProps {
  onNavigate: (phase: string) => void;
  showUserSwitching?: boolean;
}

export function AppSidebar({ onNavigate, showUserSwitching = false }: AppSidebarProps) {
  const { user, setUser } = useUser();
  const { isFacilitator, isSME } = useRoleCheck();

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = () => {
    if (isFacilitator) return 'from-cyan-500 to-teal-600';
    if (isSME) return 'from-purple-500 to-blue-600';
    return 'from-yellow-500 to-red-600';
  };

  const getRoleBadgeColor = () => {
    if (isFacilitator) return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    if (isSME) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo Section */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-none">LLM Workshop</span>
          <span className="text-xs text-muted-foreground">Annotation Tool</span>
        </div>
      </div>

      {/* Workflow Steps - Scrollable */}
      <ScrollArea className="flex-1 px-3 py-4">
        <RoleBasedWorkflow onNavigate={onNavigate} />
      </ScrollArea>

      <Separator />

      {/* User Profile Section */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-2 py-6 hover:bg-accent"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className={`bg-gradient-to-br ${getRoleColor()} text-sm font-semibold text-white`}>
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-left">
                <span className="text-sm font-medium">{user?.name || 'User'}</span>
                <span className={`text-xs ${getRoleBadgeColor()} rounded-full px-2 py-0.5 border mt-1`}>
                  {user?.role || 'Participant'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'No email'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            {showUserSwitching && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setUser(null)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Switch User</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
