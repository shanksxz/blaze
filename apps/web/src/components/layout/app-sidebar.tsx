"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { authClient } from "@/server/auth/auth-client";
import {
  Bell,
  BookMarked,
  Home,
  LogOut,
  Mail,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const navigationItems = [
  { title: "Home", url: "/", icon: Home, disabled: false },
  { title: "Explore", url: "/explore", icon: Search, disabled: false },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
    disabled: false,
  },
  { title: "Messages", url: "/messages", icon: Mail, disabled: false },
  { title: "Bookmarks", url: "/bookmarks", icon: BookMarked, disabled: false },
  { title: "Profile", url: "/profile", icon: User, disabled: false },
  { title: "Settings", url: "/settings", icon: Settings, disabled: false },
];

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { data: session } = authClient.useSession();
  const isCollapsed = state === "collapsed";
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setPending(true);
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/signin");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <Sidebar collapsible="icon" variant="inset" className="px-4 py-6">
      {isMobile && (
        <button
          type="button"
          className="absolute p-4 flex items-center justify-end w-full"
          onClick={() => setOpenMobile(false)}
        >
          <X className="h-5 w-5" />
        </button>
      )}
      <SidebarContent className="flex flex-col space-y-2 h-full px-4 py-10 md:p-0">
        <SidebarMenu className="space-y-3">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                disabled={item.disabled}
                asChild
                className={cn(
                  "w-full justify-start",
                  item.disabled && "pointer-events-none opacity-50",
                )}
                tooltip={isCollapsed ? item.title : undefined}
              >
                <Link
                  href={
                    item.url === "/profile"
                      ? `/profile/${session?.user.username}`
                      : item.url
                  }
                  aria-disabled={item.disabled}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        {state === "expanded" && session && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-accent"
              >
                <Avatar className="size-8">
                  <AvatarImage
                    src={session?.user.image ?? ""}
                    alt="@username"
                  />
                  <AvatarFallback>{session?.user.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col items-start text-left">
                  <span className="text-sm font-medium leading-none">
                    {session?.user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    @{session?.user.username}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleSignOut} disabled={pending}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {state === "collapsed" && session && (
          <div className="flex justify-center items-center">
            <Avatar className="size-7">
              <AvatarImage src={session?.user.image ?? ""} alt="@username" />
              <AvatarFallback>{session?.user.name?.[0]}</AvatarFallback>
            </Avatar>
          </div>
        )}
        {!session && (
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={() => router.push("/auth/signin")}
          >
            Sign in
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
