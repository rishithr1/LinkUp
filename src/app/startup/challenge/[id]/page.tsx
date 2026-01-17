"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Calendar, DollarSign, Building2, CheckCircle, ArrowLeft } from "lucide-react";
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
    industryName?: string;
    createdAt: string;
}

export default function StartupChallengeDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [proposal, setProposal] = useState("");
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id || !user) return;
            try {
                // Fetch Challenge
                const challengeDoc = await getDoc(doc(db, "challenges", id as string));
                if (challengeDoc.exists()) {
                    setChallenge({ id: challengeDoc.id, ...challengeDoc.data() } as Challenge);
                } else {
                    toast.error("Challenge not found");
                    router.push("/startup/dashboard");
                    return;
                }

                // Check if already submitted
                const q = query(
                    collection(db, "proposals"),
                    where("challengeId", "==", id),
                    where("startupId", "==", user.uid)
                );
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    setAlreadySubmitted(true);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !challenge) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, "proposals"), {
                challengeId: challenge.id,
                challengeTitle: challenge.title, // For display in My Proposals
                startupId: user.uid,
                startupName: user.displayName,
                startupEmail: user.email,
                content: proposal,
                status: "pending",
                createdAt: new Date().toISOString(),
            });
            toast.success("Proposal submitted successfully!");
            setAlreadySubmitted(true);
            router.push("/startup/my-proposals");
        } catch (error) {
            console.error("Error submitting proposal:", error);
            toast.error("Failed to submit proposal");
        } finally {
            setSubmitting(false);
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
        <div className="max-w-4xl mx-auto">
            <Link
                href="/startup/dashboard"
                className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-6"
            >
                <ArrowLeft size={16} className="mr-1" />
                Back to Dashboard
            </Link>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-50 px-8 py-6 border-b border-indigo-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mb-3">
                                {challenge.domain}
                            </span>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{challenge.title}</h1>
                            {challenge.industryName && (
                                <div className="flex items-center text-slate-600 text-sm">
                                    <Building2 size={16} className="mr-2" />
                                    Posted by {challenge.industryName}
                                </div>
                            )}
                        </div>
                        <div className="hidden sm:block text-right">
                            <div className="text-sm text-slate-500 mb-1">Deadline</div>
                            <div className="flex items-center justify-end text-slate-900 font-medium">
                                <Calendar size={16} className="mr-2 text-indigo-500" />
                                {new Date(challenge.deadline).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="prose prose-slate max-w-none mb-8">
                        <h3 className="text-lg font-semibold text-slate-900">Problem Description</h3>
                        <p className="whitespace-pre-wrap">{challenge.description}</p>

                        <h3 className="text-lg font-semibold text-slate-900 mt-6">Expected Outcome</h3>
                        <p className="whitespace-pre-wrap">{challenge.expectedOutcome}</p>

                        {challenge.budget && (
                            <div className="mt-6 flex items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <DollarSign className="text-green-600 mr-3" size={24} />
                                <div>
                                    <div className="text-sm text-slate-500">Budget / Grant Opportunity</div>
                                    <div className="text-lg font-semibold text-slate-900">{challenge.budget}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <hr className="border-slate-200 my-8" />

                    {alreadySubmitted ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                            <h3 className="text-lg font-medium text-green-900">Proposal Submitted!</h3>
                            <p className="mt-2 text-green-700">
                                You have already submitted a proposal for this challenge. You can track its status in your dashboard.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/startup/my-proposals"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                >
                                    View My Proposals
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Submit Your Solution</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label htmlFor="proposal" className="block text-sm font-medium text-slate-700 mb-2">
                                        Proposal Details
                                    </label>
                                    <p className="text-sm text-slate-500 mb-3">
                                        Describe your solution, approach, and why you are the best fit for this challenge.
                                    </p>
                                    <textarea
                                        id="proposal"
                                        rows={8}
                                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-slate-900"
                                        required
                                        value={proposal}
                                        onChange={(e) => setProposal(e.target.value)}
                                        placeholder="Describe your solution clearly..."
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                                        Submit Proposal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
