"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/components/ui/sidebar";
import { type LucideIcon } from "lucide-react";

export function NavProjects({
  projects,
  disabled,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
  disabled: boolean;
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild disabled={disabled}>
              <a
                href={disabled ? "#" : item.url}
                className={`flex items-center gap-2 ${
                  disabled ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
