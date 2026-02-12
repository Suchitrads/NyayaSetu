"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileBarChart } from "lucide-react";
import axios from "axios";

export default function HomeDashboard() {
    const [evidenceList, setEvidenceList] = useState([]);
    const [selectedEvidence, setSelectedEvidence] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchTransferredEvidence = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("No token found in localStorage");
                    return;
                }
                const response = await axios.get(
                    `http://localhost:5000/api/evidence/assigned-to-io`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setEvidenceList(response.data.evidenceList);
            } catch (error) {
                console.error("Error fetching transferred evidence:", error.response?.data || error.message);
            }
        };

        fetchTransferredEvidence();
    }, []);

        const handleViewDetails = async (evidenceId) => {
        try {
            setLoadingDetails(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:5000/api/evidence/details/${evidenceId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Defensive: Ensure all expected fields exist
            const data = response.data || {};
            setSelectedEvidence({
                evidence: data.evidence || {},
                imagingLogs: data.imagingLogs || [],
                integrityLogs: data.integrityLogs || [],
                analysisLogs: data.analysisLogs || [],
            });
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching evidence details:", error.response?.data || error.message);
            setSelectedEvidence(null);
            setShowModal(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    const formatDate = (date) =>
        date ? new Date(date).toLocaleString() : "N/A";

    return (
        <div className="flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white rounded-2xl">
            <div className="p-4 md:p-6 grid gap-8 dark:bg-gray-800 rounded-2xl">

                {/* Evidence Table */}
                <Card className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-lg text-yellow-600 dark:text-yellow-500">
                            <FileBarChart className="w-5 h-5" /> Transferred Evidence Assigned To You
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {evidenceList.length === 0 ? (
                            <p className="text-center text-gray-500">No evidence assigned to you yet.</p>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <Table className="min-w-max table-auto">
                                    <TableHeader>
                                        <TableRow className="bg-gray-100 dark:bg-gray-700">
                                            <TableHead>Evidence ID</TableHead>
                                            <TableHead>Case ID</TableHead>
                                            <TableHead>Evidence Name</TableHead>
                                            <TableHead>Transferred At</TableHead>
                                            {/* <TableHead>Status</TableHead> */}
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {evidenceList.map((item) => (
                                            <TableRow key={item.transferId}>
                                                <TableCell>{item.evidence.evidenceId}</TableCell>
                                                <TableCell>{item.evidence.caseId}</TableCell>
                                                <TableCell>{item.evidence.evidenceName}</TableCell>
                                                <TableCell>{formatDate(item.transferredAt)}</TableCell>
                                                {/* <TableCell>
                                                    <Badge
                                                        className={`px-3 py-2 rounded-full ${
                                                            item.status === "Transferred"
                                                                ? "bg-yellow-600 text-white"
                                                                : "bg-gray-600 text-white"
                                                        }`}
                                                    >
                                                        {item.status || "Transferred"}
                                                    </Badge>
                                                </TableCell> */}
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        className="bg-yellow-600 text-white"
                                                        onClick={() => handleViewDetails(item.evidence.evidenceId)}
                                                        disabled={loadingDetails}
                                                    >
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Modal for Evidence Details */}
                {showModal && selectedEvidence && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 md:w-2/3 lg:w-1/2 max-h-[80vh] overflow-y-auto">
                            <h2 className="text-lg md:text-xl font-bold mb-4 text-yellow-600">
                                Evidence Details: {selectedEvidence.evidence?.evidenceName || "N/A"}
                            </h2>
                            <div className="space-y-2 text-sm md:text-base">
                                <p><strong>Evidence ID:</strong> {selectedEvidence.evidence?.evidenceId || "N/A"}</p>
                                <p><strong>Case ID:</strong> {selectedEvidence.evidence?.caseId || "N/A"}</p>
                                {/* Files */}
                                <div>
                                    <strong>Files:</strong>
                                    {selectedEvidence.evidence?.files?.length > 0 ? (
                                        <ul className="list-disc list-inside">
                                            {selectedEvidence.evidence.files.map((file, idx) => (
                                                <li key={idx}>
                                                    {file.fileName || "Unnamed File"} ({file.fileSize || "Unknown size"})
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No files attached.</p>
                                    )}
                                </div>
                                {/* Imaging Logs */}
                                <div>
                                    <strong>Imaging Logs:</strong>
                                    {selectedEvidence.imagingLogs?.length > 0 ? (
                                        <ul className="list-disc list-inside">
                                            {selectedEvidence.imagingLogs.map((log, idx) => (
                                                <li key={idx} className="mb-1">
                                                    <p><strong>File Name:</strong> {log.fileName || "N/A"}</p>
                                                    <p><strong>SHA256:</strong> {log.sha256 || "N/A"}</p>
                                                    <p><strong>Imaging Done:</strong> {log.imagingDone ? "Yes" : "No"}</p>
                                                    <p><strong>Downloaded:</strong> {log.downloaded ? "Yes" : "No"}</p>
                                                    <p><strong>Imaging Timestamp:</strong> {formatDate(log.imagingTimestamp)}</p>
                                                    <p><strong>Download Timestamp:</strong> {formatDate(log.downloadTimestamp)}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No imaging logs available.</p>
                                    )}
                                </div>
                                {/* Integrity Logs */}
                                <div>
                                    <strong>Integrity Logs:</strong>
                                    {selectedEvidence.integrityLogs?.length > 0 ? (
                                        <ul className="list-disc list-inside">
                                            {selectedEvidence.integrityLogs.map((log, idx) => (
                                                <li key={idx} className="mb-1">
                                                    <p><strong>Evidence Type:</strong> {log.evidenceType || "N/A"}</p>
                                                    <p><strong>Hash:</strong> {log.hash || "N/A"}</p>
                                                    <p><strong>Status:</strong> {log.status || "N/A"}</p>
                                                    <p><strong>Verified At:</strong> {formatDate(log.verifiedAt)}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No integrity logs available.</p>
                                    )}
                                </div>
                                {/* Analysis Results */}
                                <div>
                                    <strong>Analysis Results:</strong>
                                    {selectedEvidence.analysisLogs?.length > 0 ? (
                                    <ul className="list-disc list-inside">
                                        {selectedEvidence.analysisLogs.map((result, idx) => (
                                            <li key={idx} className="mb-1">
                                                <p><strong>File Name:</strong> {result.fileName || "N/A"}</p>
                                                <p><strong>Analysis Type:</strong> {result.analysisType || "N/A"}</p>
                                                {result.result && typeof result.result === "object"
                                                    ? Object.entries(result.result).map(([key, value], index) => (
                                                        <p key={index}><strong>{key}:</strong> {String(value)}</p>
                                                    ))
                                                    : <p>{result.result}</p>
                                                }
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No analysis results available.</p>
                                )}
                                </div>
                            </div>
                            <Button
                                onClick={() => setShowModal(false)}
                                className="mt-4 bg-red-500 text-white"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
