import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function ReportPage() {
    const [cases, setCases] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("Case ID");
    const [selectedCase, setSelectedCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCasesWithEvidence = async () => {
        try {
            setLoading(true);
            const casesResponse = await fetch("http://127.0.0.1:5000/api/cases", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                cache: "no-store",
            });

            if (!casesResponse.ok) {
                throw new Error("Failed to fetch cases");
            }

            const casesData = await casesResponse.json();
            setCases(casesData);
            setError("");
        } catch (error) {
            setError("Failed to fetch cases. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCasesWithEvidence();
    }, []);

    // Fetch details of a specific case when "View Report" is clicked
    const handleViewReport = async (caseId) => {
        try {
            setLoading(true);
            setError("");

            // Fetch case details (including summary)
            const caseResponse = await fetch(
                `http://127.0.0.1:5000/api/cases/${caseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    cache: "no-store",
                }
            );
            if (!caseResponse.ok) {
                throw new Error("Failed to fetch case details");
            }
            const caseData = await caseResponse.json();
            setSelectedCase(caseData);
            await fetch("http://127.0.0.1:5000/api/log-summary", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ caseId: caseData.caseId, summary: caseData.summary }),
        });
        } catch (error) {
            setError("Failed to fetch case details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const filteredCases = cases
        .filter(
            (c) =>
                c.caseId.includes(searchQuery) ||
                c.caseName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortOption === "Case ID") return a.caseId.localeCompare(b.caseId);
            if (sortOption === "Case Name") return a.caseName.localeCompare(b.caseName);
            if (sortOption === "Ascending") return a.caseName.localeCompare(b.caseName);
            if (sortOption === "Descending") return b.caseName.localeCompare(a.caseName);
            return 0;
        });

    return (
        <div className="container mx-auto p-4 bg-gray-100 dark:bg-gray-900 min-h-screen relative">
            <h1 className="text-3xl font-bold text-center text-yellow-600 mb-6">
                Final Report
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <div className="relative w-full md:w-1/2 mb-4 md:mb-0">
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black dark:text-gray-100 bg-white dark:bg-gray-800"
                        placeholder="Enter Case ID"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="absolute right-3 top-2.5 text-gray-600 dark:text-gray-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-4.35-4.35m2.1-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                            />
                        </svg>
                    </span>
                </div>
                <div className="w-full md:w-1/4">
                    <select
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black dark:text-gray-100 bg-white dark:bg-gray-800"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="Case ID">Sort by Case ID</option>
                        <option value="Case Name">Sort by Case Name</option>
                        <option value="Ascending">Ascending Order</option>
                        <option value="Descending">Descending Order</option>
                    </select>
                </div>
            </div>
            {!selectedCase && (
                <Card className="shadow-lg border border-gray-300 dark:border-gray-700">
                    <CardContent>
                        {loading ? (
                            <p className="text-center text-gray-600 dark:text-gray-400">
                                Loading cases...
                            </p>
                        ) : error ? (
                            <p className="text-center text-red-600 dark:text-red-400">{error}</p>
                        ) : filteredCases.length > 0 ? (
                            <Table className="w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
                                <TableHeader>
                                    <TableRow className="bg-gray-200 dark:bg-gray-800">
                                        <TableHead className="text-yellow-600 dark:text-yellow-500">
                                            Case ID
                                        </TableHead>
                                        <TableHead className="text-yellow-600 dark:text-yellow-500">
                                            Case Name
                                        </TableHead>
                                        <TableHead className="text-yellow-600 dark:text-yellow-500">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCases.map((c) => (
                                        <TableRow
                                            key={c.caseId}
                                            className="hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-900"
                                        >
                                            <TableCell className="text-black dark:text-gray-100">
                                                {c.caseId}
                                            </TableCell>
                                            <TableCell className="text-black dark:text-gray-100">
                                                {c.caseName}
                                            </TableCell>
                                            <TableCell>
                                                <button
                                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700"
                                                    onClick={() => handleViewReport(c.caseId)}
                                                >
                                                    View Report
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-gray-600 dark:text-gray-400">
                                No cases found matching your search.
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
            {selectedCase && (
                <Card className="shadow-lg border border-gray-300 dark:border-gray-700 mt-6">
                    <CardContent id="report-content" className="p-6 bg-white dark:bg-gray-800 rounded-lg">
                        <h2 className="text-xl font-bold mb-2 text-center text-yellow-600 dark:text-yellow-500">
                            {selectedCase.caseId} - {selectedCase.caseName}
                        </h2>
                        <hr className="my-4 border-gray-300 dark:border-gray-700" />
                        <div className="my-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
                            <h3 className="font-bold mb-2 text-lg text-yellow-700">Summary</h3>
                            <p className="whitespace-pre-line text-gray-800 dark:text-gray-200">
                                {selectedCase.summary
                                    ? selectedCase.summary
                                    : "No summary has been generated for this case yet."}
                            </p>
                        </div>
                        <div className="flex justify-between mt-6">
                            <button
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700"
                                onClick={() => {
                                    setSelectedCase(null);
                                    fetchCasesWithEvidence();
                                }}
                            >
                                Back to Cases
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}