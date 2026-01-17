"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function StartupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (role !== "startup" && role !== null) {
                router.push("/industry/dashboard");
            }
        }
    }, [user, role, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    if (!user || role !== "startup") {
        return null;
    }

    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>;
}
