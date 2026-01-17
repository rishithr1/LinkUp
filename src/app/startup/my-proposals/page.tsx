"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Loader2, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Proposal {
    id: string;
    challengeId: string;
    challengeTitle: string;
    content: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
}

export default function MyProposalsPage() {
    const { user } = useAuth();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProposals = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, "proposals"),
                    where("startupId", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                const fetchedProposals: Proposal[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedProposals.push({ id: doc.id, ...doc.data() } as Proposal);
                });
                fetchedProposals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setProposals(fetchedProposals);
            } catch (error) {
                console.error("Error fetching proposals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProposals();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-8">My Proposals</h1>

            {proposals.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-slate-200">
                    <p className="text-slate-500 mb-4">You haven't submitted any proposals yet.</p>
                    <Link
                        href="/startup/dashboard"
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                        Browse Challenges
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {proposals.map((proposal) => (
                        <div key={proposal.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{proposal.challengeTitle}</h3>
                                    <div className="text-sm text-slate-500 mt-1">
                                        Submitted on {new Date(proposal.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    {proposal.status === "pending" && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                            <Clock size={16} className="mr-2" /> Pending Review
                                        </span>
                                    )}
                                    {proposal.status === "accepted" && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            <CheckCircle size={16} className="mr-2" /> Accepted
                                        </span>
                                    )}
                                    {proposal.status === "rejected" && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                            <XCircle size={16} className="mr-2" /> Rejected
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded p-4 text-sm text-slate-700 whitespace-pre-wrap line-clamp-3">
                                {proposal.content}
                            </div>

                            <div className="mt-4 flex justify-end">
                                <Link
                                    href={`/startup/challenge/${proposal.challengeId}`}
                                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    View Challenge Details
                                    <ExternalLink size={14} className="ml-1" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
