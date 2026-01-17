"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Challenge {
    id: string;
    title: string;
    domain: string;
    description: string;
    deadline: string;
    createdAt: string;
}

export default function IndustryDashboard() {
    const { user } = useAuth();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenges = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, "challenges"),
                    where("industryId", "==", user.uid),
                    // Firestore requires an index for this composite query usually, 
                    // but we can sort client side if needed for small data 
                    // or just ensure index is created.
                    // Let's remove orderBy for now to avoid Index needed error immediately, 
                    // or we handle it.
                    // orderBy("createdAt", "desc") 
                );
                const querySnapshot = await getDocs(q);
                const fetchedChallenges: Challenge[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedChallenges.push({ id: doc.id, ...doc.data() } as Challenge);
                });
                // Client-side sort
                fetchedChallenges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setChallenges(fetchedChallenges);
            } catch (error) {
                console.error("Error fetching challenges:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, [user]);

    if (loading) {
        return <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>)}
        </div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Your Challenges</h1>
                    <p className="text-slate-600 mt-1">Manage your posted problem statements</p>
                </div>
                <Link
                    href="/industry/challenge/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus size={16} className="mr-2" />
                    Post Challenge
                </Link>
            </div>

            {challenges.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No challenges created</h3>
                    <p className="mt-1 text-sm text-slate-500">Get started by posting a new problem statement.</p>
                    <div className="mt-6">
                        <Link
                            href="/industry/challenge/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Plus size={16} className="mr-2" />
                            Post Challenge
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {challenges.map((challenge) => (
                        <div
                            key={challenge.id}
                            className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
                        >
                            <div className="flex-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                                    {challenge.domain}
                                </span>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2 truncate">
                                    {challenge.title}
                                </h3>
                                <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                                    {challenge.description}
                                </p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center text-sm text-slate-500 mb-4">
                                    <Calendar size={14} className="mr-1.5" />
                                    Due: {new Date(challenge.deadline).toLocaleDateString()}
                                </div>
                                <Link
                                    href={`/industry/challenge/${challenge.id}`}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                                >
                                    View Details
                                    <ArrowRight size={16} className="ml-2" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
