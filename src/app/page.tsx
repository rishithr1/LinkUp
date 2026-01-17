"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Rocket } from "lucide-react";

export default function Home() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (role === "industry") {
        router.push("/industry/dashboard");
      } else if (role === "startup") {
        router.push("/startup/dashboard");
      }
    }
  }, [user, role, loading, router]);

  if (loading) return null; // Or a loader

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center bg-slate-50 px-4">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-8">
          Where <span className="text-indigo-600">Industry Problems</span> Meet <span className="text-indigo-600">Innovative Solutions</span>
        </h1>
        <p className="text-xl text-slate-600 mb-12">
          InnoBridge connects forward-thinking corporations with agile startups to solve real-world challenges faster and more efficiently.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 md:min-w-[200px]"
          >
            Get Started
            <ArrowRight className="ml-2" size={20} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 border border-slate-300 text-lg font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 md:min-w-[200px]"
          >
            Login
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <Building2 size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">For Industry</h3>
          <p className="text-slate-600">Post challenges, set budgets, and access a global pool of innovative startups ready to solve your problems.</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <Rocket size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">For Startups</h3>
          <p className="text-slate-600">Browse real industry use-cases, submit proposals, and land pilot projects with top enterprises.</p>
        </div>
      </div>
    </div>
  );
}
