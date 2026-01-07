import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SidebarProvider } from "@/context/SidebarContext";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-[#0a0a0a]">
                <Sidebar />
                <Header />
                <main className="lg:ml-72 p-4 md:p-8 pt-32 lg:pt-36 min-h-screen">
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
