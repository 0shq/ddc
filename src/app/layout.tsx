import { Metadata } from "next";
import { Providers } from "@/src/components/app-providers/providers";
import Header from "@/src/components/layout/Header";
import "@mysten/dapp-kit/dist/index.css";
import "@/src/app/globals.css";
import { AppSidebar } from "@/src/components/layout/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/src/components/ui/sidebar";
import { ThemeProvider } from "@/src/components/app-providers/theme-provider";

export const metadata: Metadata = {
  title: "Degen D. Clash",
  description: "An NFT battle game on the Sui blockchain",
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-900 text-white min-h-screen flex flex-col">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <Header />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                  <main className="flex-1 p-4">{children}</main>
                </div>
              </SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
