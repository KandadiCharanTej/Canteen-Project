"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { ShoppingCart, LayoutGrid, Clock, ShieldCheck, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminMenu } from "@/components/admin/AdminMenu";
import { AdminSlots } from "@/components/admin/AdminSlots";
import { AdminVerify } from "@/components/admin/AdminVerify";

export default function AdminPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "menu" | "slots" | "verify">("orders");

  if (!isLoggedIn || user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-6">Only administrators can access this page.</p>
        <button onClick={() => router.push("/")} className="bg-primary text-white px-6 py-2 rounded-xl font-bold">
          Go Home
        </button>
      </div>
    );
  }

  const tabs = [
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "menu", label: "Menu", icon: LayoutGrid },
    { id: "slots", label: "Slots", icon: Clock },
    { id: "verify", label: "Verify", icon: ShieldCheck },
  ] as const;

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24 md:pb-12">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between md:hidden">
         <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-sm">A</div>
           <h1 className="font-black text-gray-900">QuickBite Admin</h1>
         </div>
         <button onClick={() => router.push("/")} className="text-xs font-bold text-gray-400 flex items-center gap-1">
           <ArrowLeft className="h-3 w-3" /> Exit
         </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="hidden md:flex items-center justify-between mb-8">
           <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
           <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
             {tabs.map((t) => (
               <button
                 key={t.id}
                 onClick={() => setTab(t.id)}
                 className={cn(
                   "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                   tab === t.id ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50"
                 )}
               >
                 <t.icon className="h-4 w-4" /> {t.label}
               </button>
             ))}
           </div>
        </div>

        {/* Mobile Tab Icons */}
        <div className="flex md:hidden justify-between bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all",
                tab === t.id ? "bg-primary/10 text-primary" : "text-gray-400"
              )}
            >
              <t.icon className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-wider">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
           {tab === "orders" && <AdminOrders />}
           {tab === "menu" && <AdminMenu />}
           {tab === "slots" && <AdminSlots />}
           {tab === "verify" && <AdminVerify />}
        </div>
      </div>
    </div>
  );
}
