"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Calendar, FileText, CheckCircle, XCircle, Clock, ArrowLeft, Mail } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Challenge {
    id: string;
    title: string;
    description: string;
    domain: string;
    expectedOutcome: string;
    budget: string;
    deadline: string;
    createdAt: string;
}

interface Proposal {
    id: string;
    startupName: string;
    startupEmail: string;
    content: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
}

export default function IndustryChallengeDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // Fetch Challenge
                const challengeDoc = await getDoc(doc(db, "challenges", id as string));
                if (challengeDoc.exists()) {
                    setChallenge({ id: challengeDoc.id, ...challengeDoc.data() } as Challenge);
                } else {
                    toast.error("Challenge not found");
                    router.push("/industry/dashboard");
                    return;
                }

                // Fetch Proposals
                const q = query(
                    collection(db, "proposals"),
                    where("challengeId", "==", id)
                );
                const querySnapshot = await getDocs(q);
                const fetchedProposals: Proposal[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedProposals.push({ id: doc.id, ...doc.data() } as Proposal);
                });
                setProposals(fetchedProposals);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const handleUpdateStatus = async (proposalId: string, newStatus: "accepted" | "rejected") => {
        try {
            await updateDoc(doc(db, "proposals", proposalId), {
                status: newStatus,
            });

            // Update local state
            setProposals(proposals.map(p =>
                p.id === proposalId ? { ...p, status: newStatus } : p
            ));

            toast.success(`Proposal ${newStatus} successfully`);
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    if (!challenge) return null;

    return (
        <div className="max-w-5xl mx-auto">
            <Link
                href="/industry/dashboard"
                className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-6"
            >
                <ArrowLeft size={16} className="mr-1" />
                Back to Dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Challenge Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                            {challenge.domain}
                        </span>
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">{challenge.title}</h1>

                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-lg font-semibold text-slate-900">Problem Description</h3>
                            <p className="text-slate-600 whitespace-pre-wrap">{challenge.description}</p>

                            <h3 className="text-lg font-semibold text-slate-900 mt-6">Expected Outcome</h3>
                            <p className="text-slate-600 whitespace-pre-wrap">{challenge.expectedOutcome}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Received Proposals ({proposals.length})</h2>

                        {proposals.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                No solutions submitted yet.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {proposals.map((proposal) => (
                                    <div key={proposal.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{proposal.startupName}</h3>
                                                <div className="flex items-center text-sm text-slate-500 mt-1">
                                                    <Mail size={14} className="mr-1" />
                                                    {proposal.startupEmail}
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                {proposal.status === "pending" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <Clock size={12} className="mr-1" /> Pending
                                                    </span>
                                                )}
                                                {proposal.status === "accepted" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle size={12} className="mr-1" /> Accepted
                                                    </span>
                                                )}
                                                {proposal.status === "rejected" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <XCircle size={12} className="mr-1" /> Rejected
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded p-4 text-sm text-slate-700 whitespace-pre-wrap mb-4">
                                            {proposal.content}
                                        </div>

                                        {proposal.status === "pending" && (
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleUpdateStatus(proposal.id, "accepted")}
                                                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                >
                                                    Accept Proposal
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(proposal.id, "rejected")}
                                                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Meta Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Details</h3>

                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-slate-500">Submission Deadline</dt>
                                <dd className="mt-1 flex items-center text-sm font-medium text-slate-900">
                                    <Calendar size={16} className="mr-2 text-indigo-500" />
                                    {new Date(challenge.deadline).toLocaleDateString()}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm text-slate-500">Budget / Grant</dt>
                                <dd className="mt-1 text-sm font-medium text-slate-900">
                                    {challenge.budget || "Not speicifed"}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm text-slate-500">Posted On</dt>
                                <dd className="mt-1 text-sm text-slate-900">
                                    {new Date(challenge.createdAt).toLocaleDateString()}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
