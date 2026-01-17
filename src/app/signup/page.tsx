"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Building2, Rocket, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState<"industry" | "startup">("industry");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: name,
            });

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: name,
                role: role,
                createdAt: new Date().toISOString(),
            });

            toast.success("Account created successfully!");

            if (role === "industry") {
                router.push("/industry/dashboard");
            } else {
                router.push("/startup/dashboard");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Join InnoBridge to connect and innovate
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => setRole("industry")}
                        className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all",
                            role === "industry"
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                    >
                        <Building2 className="mb-2" size={24} />
                        <span className="font-medium">Industry</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole("startup")}
                        className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all",
                            role === "startup"
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                    >
                        <Rocket className="mb-2" size={24} />
                        <span className="font-medium">Startup</span>
                    </button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Full Name / Company Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                            Sign up
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <p className="text-sm text-slate-600">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
