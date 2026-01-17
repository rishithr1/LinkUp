"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewChallengePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        domain: "",
        description: "",
        expectedOutcome: "",
        budget: "",
        deadline: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            await addDoc(collection(db, "challenges"), {
                ...formData,
                industryId: user.uid,
                industryName: user.displayName,
                createdAt: new Date().toISOString(),
                status: "open",
            });
            toast.success("Challenge posted successfully!");
            router.push("/industry/dashboard");
        } catch (error) {
            console.error("Error posting challenge:", error);
            toast.error("Failed to post challenge");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Link
                href="/industry/dashboard"
                className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-6"
            >
                <ArrowLeft size={16} className="mr-1" />
                Back to Dashboard
            </Link>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Post a New Challenge</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                                Challenge Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-slate-900"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="domain" className="block text-sm font-medium text-slate-700">
                                Industry Domain
                            </label>
                            <select
                                name="domain"
                                id="domain"
                                required
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-slate-900"
                                value={formData.domain}
                                onChange={handleChange}
                            >
                                <option value="">Select Domain</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Fintech">Fintech</option>
                                <option value="Agriculture">Agriculture</option>
                                <option value="Education">Education</option>
                                <option value="Sustainability">Sustainability</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Logistics">Logistics</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="deadline" className="block text-sm font-medium text-slate-700">
                                Submission Deadline
                            </label>
                            <input
                                type="date"
                                name="deadline"
                                id="deadline"
                                required
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-slate-900"
                                value={formData.deadline}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                                Problem Description
                            </label>
                            <textarea
                                name="description"
                                id="description"
                                rows={4}
                                required
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-slate-900"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="expectedOutcome" className="block text-sm font-medium text-slate-700">
                                Expected Outcome / Deliverables
                            </label>
                            <textarea
                                name="expectedOutcome"
                                id="expectedOutcome"
                                rows={3}
                                required
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-slate-900"
                                value={formData.expectedOutcome}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-slate-700">
                                Budget / Grant (Optional)
                            </label>
                            <input
                                type="text"
                                name="budget"
                                id="budget"
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-slate-900"
                                placeholder="e.g. $10,000"
                                value={formData.budget}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                            Publish Challenge
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
