"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/src/components/ui/breadcrumb";
import { Separator } from "@/src/components/ui/separator";
import { SidebarTrigger } from "@/src/components/ui/sidebar";
import { ModeToggle } from "./ModeToggle";

const Header: React.FC = () => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/" className="font-bold">Degen D. Clash</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center">
        <ModeToggle />
      </div>
    </header>
  );
};

export default Header;
