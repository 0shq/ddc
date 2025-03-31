"use client";

import * as React from "react";
import {
  Sword,
  Coins,
  Trophy,
  User,
  ShoppingCart,
} from "lucide-react";

import { NavProjects } from "@/src/components/layout/sidebar/nav-projects";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/components/ui/sidebar";
import { useWalletContext } from "@/src/store/WalletProvider";
import { ConnectButton } from "@mysten/dapp-kit";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect } from "react";

const data = {
  projects: [
    {
      name: "Battle",
      url: "/battle",
      icon: Sword,
    },
    {
      name: "Mint",
      url: "/mint",
      icon: Coins,
    },
    {
      name: "Leaderboard",
      url: "/leaderboard",
      icon: Trophy,
    },
    {
      name: "Profile",
      url: "/profile",
      icon: User,
    },
    {
      name: "Inventory",
      url: "/inventory",
      icon: ShoppingCart,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { connected, error } = useWalletContext();
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Ensures the component is only rendered on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR hydration mismatch
  if (!mounted) return null;
  const logoSrc = theme === "dark" ? "/ddc-light.svg" : "/ddc-dark.svg";

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src={logoSrc}
                    className="rounded-lg"
                    alt="logo"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {error && (
                    <span className="text-red-500 text-sm">{error}</span>
                  )}
                  <ConnectButton />
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} disabled={!connected} />
        {!connected && (
          <div className="text-gray-400 text-sm p-4">
            Connect your wallet to access these features
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
