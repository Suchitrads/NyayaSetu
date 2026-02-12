"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, FileBarChart, CircleX, PackageSearch } from "lucide-react";
import axios from "axios";

export default function CollectorHome() {
    const [evidenceList, setEvidenceList] = useState([]);
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        // Fetch recent evidence collected by this collector
        const fetchEvidence = async () => {
            try {
                const response = await axios.get(`${process.env.BASE_URL}/api/evidence/recent`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                setEvidenceList(response.data);
            } catch (error) {
                console.error('Error fetching recent evidence:', error);
            }
        };

        // Fetch evidence summary/status counts
        const fetchEvidenceSummary = async () => {
            try {
                const response = await axios.get(`${process.env.BASE_URL}/api/evidence/summary`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                const statusCounts = response.data.map(status => ({
                    label: status._id,
                    count: status.count,
                    icon: status._id === "Stored" ? <BadgeCheck className="w-5 h-5 text-yellow-500" /> :
                        status._id === "Transferred" ? <PackageSearch className="w-5 h-5 text-yellow-500" /> :
                            <CircleX className="w-5 h-5 text-yellow-500" />
                }));
                setStatuses(statusCounts);
            } catch (error) {
                console.error('Error fetching evidence summary:', error);
            }
        };

        fetchEvidence();
        fetchEvidenceSummary();
    }, []);

    return (
        <div className="flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white rounded-2xl">
            <div className="p-4 md:p-6 grid gap-8 dark:bg-gray-800 rounded-2xl">

                {/* Summary Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {statuses.map((status, index) => (
                        <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm p-2">
                            <CardHeader className="p-1">
                                <CardTitle className="flex justify-center gap-2 text-xs md:text-sm text-gray-700 dark:text-gray-300">
                                    {status.icon} {status.label} Evidence
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {status.count}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Evidence Table */}
                <Card className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-lg text-yellow-600 dark:text-yellow-500">
                            <PackageSearch className="w-5 h-5" /> Recently Collected Evidence
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full overflow-x-auto">
                            <Table className="min-w-max table-auto">
                                <TableHeader>
                                    <TableRow className="bg-gray-100 dark:bg-gray-700">
                                        <TableHead className="text-xs md:text-sm whitespace-nowrap">Evidence ID</TableHead>
                                        <TableHead className="text-xs md:text-sm whitespace-nowrap">Evidence Name</TableHead>
                                        <TableHead className="text-xs md:text-sm whitespace-nowrap">Case ID</TableHead>
                                        <TableHead className="text-xs md:text-sm whitespace-nowrap">Date & Time</TableHead>
                                        <TableHead className="hidden md:table-cell text-xs md:text-sm whitespace-nowrap">Description</TableHead>
                                        <TableHead className="text-xs md:text-sm whitespace-nowrap">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {evidenceList.map((evidence) => (
                                        <TableRow key={evidence.evidenceId} className="border-b border-gray-200 dark:border-gray-700">
                                            <TableCell className="text-xs md:text-sm whitespace-nowrap">{evidence.evidenceId}</TableCell>
                                            <TableCell className="text-xs md:text-sm whitespace-nowrap">{evidence.evidenceName}</TableCell>
                                            <TableCell className="text-xs md:text-sm whitespace-nowrap">{evidence.caseId}</TableCell>
                                            <TableCell className="text-xs md:text-sm whitespace-nowrap">{new Date(evidence.updatedAt).toLocaleString()}</TableCell>
                                            <TableCell className="hidden md:table-cell text-xs md:text-sm whitespace-nowrap">{evidence.evidenceDescription}</TableCell>
                                            <TableCell>
                                                <Badge className={`text-xs md:text-sm px-3 py-1 rounded-full ${
                                                    evidence.status === "Stored" ? "bg-yellow-500 text-white dark:bg-yellow-600" :
                                                    evidence.status === "Transferred" ? "border border-yellow-500 text-yellow-600 bg-transparent" :
                                                    "bg-gray-500 text-white dark:bg-gray-600"
                                                }`}>
                                                    {evidence.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}