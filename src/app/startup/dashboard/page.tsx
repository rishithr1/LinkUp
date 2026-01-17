"use client";

import { useEffect, useState } from "react";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Search, Filter, Calendar, ArrowRight, Building2 } from "lucide-react";

interface Challenge {
    id: string;
    title: string;
    domain: string;
    description: string;
    industryName?: string;
    deadline: string;
    createdAt: string;
}

export default function StartupDashboard() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDomain, setSelectedDomain] = useState("");

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const q = query(collection(db, "challenges"));
                // Note: For production, we should filter by status='open' and use server-side pagination/filtering
                const querySnapshot = await getDocs(q);
                const fetchedChallenges: Challenge[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedChallenges.push({ id: doc.id, ...doc.data() } as Challenge);
                });
                // Sort by newest
                fetchedChallenges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setChallenges(fetchedChallenges);
                setFilteredChallenges(fetchedChallenges);
            } catch (error) {
                console.error("Error fetching challenges:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChallenges();
    }, []);

    useEffect(() => {
        let result = challenges;

        if (searchTerm) {
            result = result.filter(c =>
                c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedDomain) {
            result = result.filter(c => c.domain === selectedDomain);
        }

        setFilteredChallenges(result);
    }, [searchTerm, selectedDomain, challenges]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Explore Challenges</h1>
                <p className="text-slate-600 mt-1">Find real-world industry problems and submit your solutions</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Search challenges..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="w-full md:w-64">
                    {/* Mock Domain Filter */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter size={18} className="text-slate-400" />
                        </div>
                        <select
                            className="block w-full pl-10 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value)}
                        >
                            <option value="">All Domains</option>
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
                </div>
            </div>

            {/* Challenge Grid */}
            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-slate-200 rounded-lg animate-pulse"></div>)}
                </div>
            ) : filteredChallenges.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-slate-500 text-lg">No challenges found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredChallenges.map((challenge) => (
                        <div
                            key={challenge.id}
                            className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col"
                        >
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                        {challenge.domain}
                                    </span>
                                    {challenge.industryName && (
                                        <span className="flex items-center text-xs text-slate-500">
                                            <Building2 size={12} className="mr-1" />
                                            {challenge.industryName}
                                        </span>
                                    )}
                                </div>
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
                                    href={`/startup/challenge/${challenge.id}`}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600"
                                >
                                    View Challenge
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
