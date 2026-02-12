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
import axios from "axios";


export default function ReportPage() {
    const [cases, setCases] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOption, setSortOption] = useState("Case ID");
    const [selectedCase, setSelectedCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [evidenceList, setEvidenceList] = useState([]);
    const [chainOfCustody, setChainOfCustody] = useState([]);
    const [integrityLogs, setIntegrityLogs] = useState([]);
    const [imagingLogs, setImagingLogs] = useState([]);
    const [analysisResults, setAnalysisResults] = useState([]);
    const [analystToIOTransfers, setAnalystToIOTransfers] = useState([]);
    const [forensicAnalyst, setForensicAnalyst] = useState({});
    const [summary, setSummary] = useState("");
    const [summaryLoading, setSummaryLoading] = useState(false);

 

    // Fetch forensic analyst info when chainOfCustody updates
    useEffect(() => {
        if (chainOfCustody && chainOfCustody.length > 0) {
            const analystAadhaar = chainOfCustody[0].transferredToAadhaar;
            fetch(`http://localhost:5000/api/users/by-aadhaar/${analystAadhaar}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                cache: "no-store",
            })
                .then((res) => (res.ok ? res.json() : {}))
                .then((data) => setForensicAnalyst(data))
                .catch(() => setForensicAnalyst({}));
        } else {
            setForensicAnalyst({});
        }
    }, [chainOfCustody]);

    // Fetch integrity logs for all evidences when evidenceList updates
    useEffect(() => {
        const fetchIntegrityLogs = async () => {
            let allIntegrityLogs = [];
            if (evidenceList && evidenceList.length > 0) {
                for (const evidence of evidenceList) {
                    const integrityResponse = await fetch(
                        `http://127.0.0.1:5000/api/integrity/${evidence.evidenceId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                            cache: "no-store",
                        }
                    );
                    if (integrityResponse.ok) {
                        const integrityData = await integrityResponse.json();
                        allIntegrityLogs = allIntegrityLogs.concat(integrityData);
                    }
                }
            }
            setIntegrityLogs(allIntegrityLogs);
        };
        fetchIntegrityLogs();
    }, [evidenceList]);

    // Fetch imaging logs for all evidences when evidenceList updates
    useEffect(() => {
        const fetchImagingLogs = async () => {
            let allImagingLogs = [];
            if (evidenceList && evidenceList.length > 0) {
                for (const evidence of evidenceList) {
                    const imagingResponse = await fetch(
                        `http://127.0.0.1:5000/api/imaging-log/${evidence.evidenceId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                            cache: "no-store",
                        }
                    );
                    if (imagingResponse.ok) {
                        const imagingData = await imagingResponse.json();
                        allImagingLogs = allImagingLogs.concat(imagingData);
                    }
                }
            }
            setImagingLogs(allImagingLogs);
        };
        fetchImagingLogs();
    }, [evidenceList]);

    // Fetch analysis results for all evidences when evidenceList updates
    useEffect(() => {
        const fetchAnalysisResults = async () => {
            let allAnalysisResults = [];
            if (evidenceList && evidenceList.length > 0) {
                for (const evidence of evidenceList) {
                    const analysisResponse = await fetch(
                        `http://127.0.0.1:5000/api/analysis/${evidence.evidenceId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                            cache: "no-store",
                        }
                    );
                    if (analysisResponse.ok) {
                        const analysisData = await analysisResponse.json();
                        allAnalysisResults = allAnalysisResults.concat(analysisData);
                    }
                }
            }
            setAnalysisResults(allAnalysisResults);
        };
        fetchAnalysisResults();
    }, [evidenceList]);



const handleGenerateSummary = async (caseObj) => {
    setSummary("");
    setSummaryLoading(true);

    // Build the report text with all details
    let reportText = `
Case ID: ${caseObj.caseId}
Case Name: ${caseObj.caseName}
Description: ${caseObj.description}
Officer: ${caseObj.selectedOfficer}
Wallet Address: ${caseObj.selectedOfficerWallet}
Date & Time: ${caseObj.dateTime}
Location: ${caseObj.location}

Suspects:
${(caseObj.suspects || []).map(s => 
  `- Name: ${s.name}, Age: ${s.age}, Designation: ${s.designation}, Address: ${s.address}, Phone: ${s.phone}, Email: ${s.email}`
).join("\n")}

Victims:
${(caseObj.victims || []).map(v => 
  `- Name: ${v.name}, Age: ${v.age}, Designation: ${v.designation}, Address: ${v.address}, Phone: ${v.phone}, Email: ${v.email}`
).join("\n")}

Witnesses:
${(caseObj.witnesses || []).map(w => 
  `- Name: ${w.name}, Age: ${w.age}, Designation: ${w.designation}, Address: ${w.address}, Phone: ${w.phone}, Email: ${w.email}`
).join("\n")}

Evidence Details:
${(evidenceList || []).map(e => 
  `- Evidence ID: ${e.evidenceId}, Name: ${e.evidenceName}, Type: ${e.evidenceType}, Location: ${e.location}, Collector: ${e.collectorName}, Officer: ${e.officerName}, Description: ${e.evidenceDescription}, Condition: ${e.evidenceCondition}, Files: ${(e.files || []).map(f => `${f.fileName} (${f.fileType}, ${f.fileSize} bytes)`).join(", ")}`
).join("\n")}

Chain of Custody (Collector to Forensic Analyst):
${(chainOfCustody || []).map(t => 
  `- Evidence ID: ${t.evidenceId}, Transferred From: ${t.transferredByAadhaar}, Received At: ${t.receivedAt ? new Date(t.receivedAt).toLocaleString() : "-"}, Transfer Date & Time: ${t.transferredAt ? new Date(t.transferredAt).toLocaleString() : "-"}, Transferred To: ${t.transferredToAadhaar}, Status/Remarks: ${t.status || t.remarks || "-"}`
).join("\n")}

Analyst to IO Transfers:
${(analystToIOTransfers || []).map(t => 
  `- Evidence ID: ${t.evidenceId}, Transferred From: ${t.transferredByAadhaar}, Received At: ${t.receivedAt ? new Date(t.receivedAt).toLocaleString() : "-"}, Transfer Date & Time: ${t.transferredAt ? new Date(t.transferredAt).toLocaleString() : "-"}, Transferred To: ${t.transferredToAadhaar}, Status/Remarks: ${t.status || t.remarks || "-"}`
).join("\n")}

Forensic Analyst:
ID: ${forensicAnalyst.id || "-"}, Name: ${forensicAnalyst.name || "-"}

Integrity Logs:
${(integrityLogs || []).map(log => 
  `- Hash: ${log.hash}, Status: ${log.status}, Verified At: ${log.verifiedAt ? new Date(log.verifiedAt).toLocaleString() : "-"}`
).join("\n")}

Imaging Logs:
${(imagingLogs || []).map(img => 
  `- Imaging Done: ${img.imagingDone ? "Done" : "Pending"}, Downloaded: ${img.downloaded ? "Downloaded" : "Not Downloaded"}, Timestamp: ${img.timestamp ? new Date(img.timestamp).toLocaleString() : "-"}`
).join("\n")}

Analysis Results:
${(analysisResults || []).map(a => 
  `- Type: ${a.analysisType}, Result: ${typeof a.result === "object" ? JSON.stringify(a.result) : a.result}, Timestamp: ${a.timestamp ? new Date(a.timestamp).toLocaleString() : "-"}`
).join("\n")}
`;

    try {
        const response = await axios.post(
            "http://localhost:5000/generate-summary",
            { report: reportText }
        );
        setSummary(response.data.summary);
        await axios.put(
            `http://localhost:5000/api/cases/${caseObj.caseId}/summary`,
            { summary: response.data.summary },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
    } catch (err) {
        setSummary("Failed to generate summary.");      
    }
    setSummaryLoading(false);
};


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
            const evidenceRequests = casesData.map(async (caseItem) => {
                const evidenceResponse = await fetch(
                    `http://127.0.0.1:5000/api/evidences/${caseItem.caseId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        cache: "no-store",
                    }
                );

                if (evidenceResponse.ok) {
                    const evidenceData = await evidenceResponse.json();
                    return { ...caseItem, evidence: evidenceData };
                } else {
                    return { ...caseItem, evidence: [] };
                }
            });

            const casesWithEvidence = await Promise.all(evidenceRequests);
            setCases(casesWithEvidence);
            setError("");
        } catch (error) {
            setError("Failed to fetch cases and evidence. Please try again later.");
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

            // Fetch case details
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

            // Fetch evidence list
            const evidenceResponse = await fetch(
                `http://127.0.0.1:5000/api/evidences/${caseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    cache: "no-store",
                }
            );
            if (evidenceResponse.ok) {
                const evidenceData = await evidenceResponse.json();
                setEvidenceList(evidenceData);
            } else {
                setEvidenceList([]);
            }

            // Fetch chain of custody
            const chainResponse = await fetch(
                `http://localhost:5000/api/transfers/collector-to-analyst/${caseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    cache: "no-store",
                }
            );
            if (chainResponse.ok) {
                const chainData = await chainResponse.json();
                setChainOfCustody(chainData.collectorToAnalyst || []);
            } else {
                setChainOfCustody([]);
            }

            // Fetch analyst to IO transfers
            const analystToIOResponse = await fetch(
                `http://localhost:5000/api/transfers/analyst-to-io/${caseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    cache: "no-store",
                }
            );
            let analystToIOTransfers = [];
            if (analystToIOResponse.ok) {
                const data = await analystToIOResponse.json();
                analystToIOTransfers = data.analystToIO || [];
            } else {
                analystToIOTransfers = [];
            }
            setAnalystToIOTransfers(analystToIOTransfers);
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
                        <p className="text-base text-gray-600 dark:text-gray-400 mb-4 text-center">
                            {selectedCase.description}
                        </p>
                        <hr className="my-4 border-gray-300 dark:border-gray-700" />
                        <div className="grid grid-cols-2 gap-4 text-base text-gray-700 dark:text-gray-300">
                            <p>
                                <strong>Case ID:</strong> {selectedCase.caseId}
                            </p>
                            <p>
                                <strong>Case Name:</strong> {selectedCase.caseName}
                            </p>
                            <p>
                                <strong>Investigation Officer:</strong> {selectedCase.selectedOfficer}
                            </p>
                            <p>
                                <strong>Wallet Address:</strong> {selectedCase.selectedOfficerWallet}
                            </p>
                            <p>
                                <strong>Date & Time:</strong> {selectedCase.dateTime}
                            </p>
                            <p>
                                <strong>Location:</strong> {selectedCase.location}
                            </p>
                            <p className="col-span-2">
                                <strong>Brief Description:</strong> {selectedCase.description}
                            </p>
                        </div>
                        <hr className="my-4 border-gray-300 dark:border-gray-700" />
                        <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">Suspects Involved</h3>
                        <Table className="w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm mb-4">
                            <TableHeader>
                                <TableRow className="bg-gray-200 dark:bg-gray-800">
                                    <TableHead className="text-gray-800 dark:text-gray-100">Name</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Age</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Designation</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Address</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Phone No</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedCase.suspects.map((suspect, index) => (
                                    <TableRow key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-900">
                                        <TableCell className="text-black dark:text-gray-100">{suspect.name}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{suspect.age}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{suspect.designation}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{suspect.address}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{suspect.phone}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{suspect.email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">Victims Involved</h3>
                        <Table className="w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm mb-4">
                            <TableHeader>
                                <TableRow className="bg-gray-200 dark:bg-gray-800">
                                    <TableHead className="text-gray-800 dark:text-gray-100">Name</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Age</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Designation</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Address</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Phone No</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedCase.victims.map((victim, index) => (
                                    <TableRow key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-900">
                                        <TableCell className="text-black dark:text-gray-100">{victim.name}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{victim.age}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{victim.designation}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{victim.address}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{victim.phone}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{victim.email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">Witnesses Involved</h3>
                        <Table className="w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm mb-4">
                            <TableHeader>
                                <TableRow className="bg-gray-200 dark:bg-gray-800">
                                    <TableHead className="text-gray-800 dark:text-gray-100">Name</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Age</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Designation</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Address</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Phone No</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedCase.witnesses.map((witness, index) => (
                                    <TableRow key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-900">
                                        <TableCell className="text-black dark:text-gray-100">{witness.name}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{witness.age}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{witness.designation}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{witness.address}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{witness.phone}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{witness.email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <hr className="my-4 border-gray-300 dark:border-gray-700" />
                        <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">Evidence Details</h3>
                        <Table className="w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm mb-4">
                            <TableHeader>
                                <TableRow className="bg-gray-200 dark:bg-gray-800">
                                    <TableHead className="text-gray-800 dark:text-gray-100">Evidence ID</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Name</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Type</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Location</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Collector</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Officer</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Description</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Condition</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Files</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {evidenceList && evidenceList.length > 0 ? (
                                    evidenceList.map((evidence, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{evidence.evidenceId}</TableCell>
                                            <TableCell>{evidence.evidenceName}</TableCell>
                                            <TableCell>{evidence.evidenceType}</TableCell>
                                            <TableCell>{evidence.location}</TableCell>
                                            <TableCell>{evidence.collectorName}</TableCell>
                                            <TableCell>{evidence.officerName}</TableCell>
                                            <TableCell>{evidence.evidenceDescription}</TableCell>
                                            <TableCell>{evidence.evidenceCondition}</TableCell>
                                            <TableCell>
                                                {evidence.files && evidence.files.length > 0
                                                    ? evidence.files.map((file, fidx) => (
                                                        <div key={fidx}>
                                                            <span>{file.fileName}</span>
                                                            <br />
                                                            <span className="text-xs text-gray-500">{file.fileType}, {file.fileSize} bytes</span>
                                                        </div>
                                                    ))
                                                    : "No Files"}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center text-gray-500">No Evidence Found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <hr className="my-4 border-gray-300 dark:border-gray-700" />
                        <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">Collector to Forensic Analyst</h2>
                        <Table className="w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm mb-4">
                            <TableHeader>
                                <TableRow className="bg-gray-200 dark:bg-gray-800">
                                    <TableHead className="text-gray-800 dark:text-gray-100">Evidence ID</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Transferred From</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Received Date & Time</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Transfer Date & Time</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Transferred To</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Status/Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {chainOfCustody.length > 0 ? (
                                    chainOfCustody.map((transfer, idx) => (
                                        <TableRow key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-900">
                                            <TableCell className="text-black dark:text-gray-100">{transfer.evidenceId}</TableCell>
                                            <TableCell className="text-black dark:text-gray-100">{transfer.transferredByAadhaar}</TableCell>
                                            <TableCell className="text-black dark:text-gray-100">{transfer.receivedAt ? new Date(transfer.receivedAt).toLocaleString() : "-"}</TableCell>
                                            <TableCell className="text-black dark:text-gray-100">{transfer.transferredAt ? new Date(transfer.transferredAt).toLocaleString() : "-"}</TableCell>
                                            <TableCell className="text-black dark:text-gray-100">{transfer.transferredToAadhaar}</TableCell>
                                            <TableCell className="text-black dark:text-gray-100">{transfer.status || transfer.remarks || "-"}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-500">No transfer data found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">Forensic Analyst to Investigating Officer</h2>
                        <Table className="w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm mb-4">
                            <TableHeader>
                                <TableRow className="bg-gray-200 dark:bg-gray-800">
                                    <TableHead className="text-gray-800 dark:text-gray-100">Evidence ID</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Transferred From</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Received Date & Time</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Transfer Date & Time</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Transferred To</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Status/Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {analystToIOTransfers.length > 0 ? (
                                analystToIOTransfers.map((transfer, idx) => (
                                    <TableRow key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-900">
                                        <TableCell className="text-black dark:text-gray-100">{transfer.evidenceId}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{transfer.transferredByAadhaar}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{transfer.receivedAt ? new Date(transfer.receivedAt).toLocaleString() : "-"}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{transfer.transferredAt ? new Date(transfer.transferredAt).toLocaleString() : "-"}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{transfer.transferredToAadhaar}</TableCell>
                                        <TableCell className="text-black dark:text-gray-100">{transfer.status || transfer.remarks || "-"}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-gray-500">No transfer data found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        </Table>
                        <hr className="my-4 border-gray-300 dark:border-gray-700" />
                        <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">
                        Forensic Details
                        </h2>
                        <Table className="w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm mb-4">
                            <TableHeader>
                                <TableRow className="bg-gray-200 dark:bg-gray-800">
                                    <TableHead className="text-gray-800 dark:text-gray-100">Forensic Analyst ID</TableHead>
                                    <TableHead className="text-gray-800 dark:text-gray-100">Forensic Analyst Name</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-900">
                                    <TableCell>{forensicAnalyst.id || "-"}</TableCell>
                                    <TableCell>{forensicAnalyst.name || "-"}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <Table className="w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm mb-4">
                        <TableHeader>
                        <TableRow className="bg-gray-200 dark:bg-gray-800">
                            <TableHead className="text-gray-800 dark:text-gray-100">Type</TableHead>
                            <TableHead className="text-gray-800 dark:text-gray-100">Hash / Status</TableHead>
                            <TableHead className="text-gray-800 dark:text-gray-100">Details</TableHead>
                            <TableHead className="text-gray-800 dark:text-gray-100">Timestamp</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Integrity Logs with merged cell */}
                            {integrityLogs && integrityLogs.length > 0 ? (
                                integrityLogs.map((log, idx) => (
                                    <TableRow key={`integrity-${idx}`}>
                                        {idx === 0 ? (
                                            <TableCell className="font-semibold" rowSpan={integrityLogs.length}>Integrity</TableCell>
                                        ) : null}
                                        <TableCell>{log.hash}</TableCell>
                                        <TableCell>{log.status}</TableCell>
                                        <TableCell>{log.verifiedAt ? new Date(log.verifiedAt).toLocaleString() : "-"}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell className="font-semibold">Integrity</TableCell>
                                    <TableCell colSpan={3} className="text-center text-gray-500">No Integrity Records</TableCell>
                                </TableRow>
                            )}

                            {/* Imaging Logs with merged cell */}
                            {imagingLogs && imagingLogs.length > 0 ? (
                                imagingLogs.map((img, idx) => (
                                    <TableRow key={`imaging-${idx}`}>
                                        {idx === 0 ? (
                                            <TableCell className="font-semibold" rowSpan={imagingLogs.length}>Imaging</TableCell>
                                        ) : null}
                                        <TableCell>{img.imagingDone ? "Done" : "Pending"}</TableCell>
                                        <TableCell>{img.downloaded ? "Downloaded" : "Not Downloaded"}</TableCell>
                                        <TableCell>{img.timestamp ? new Date(img.timestamp).toLocaleString() : "-"}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell className="font-semibold">Imaging</TableCell>
                                    <TableCell colSpan={3} className="text-center text-gray-500">No Imaging Records</TableCell>
                                </TableRow>
                            )}

                            {/* Analysis Results with merged cell */}
                            {analysisResults && analysisResults.length > 0 ? (
                                analysisResults.map((a, idx) => (
                                    <TableRow key={`analysis-${idx}`}>
                                        {idx === 0 ? (
                                            <TableCell className="font-semibold" rowSpan={analysisResults.length}>Analysis</TableCell>
                                        ) : null}
                                        <TableCell>{a.analysisType}</TableCell>
                                        <TableCell>{typeof a.result === "object" ? JSON.stringify(a.result) : a.result}</TableCell>
                                        <TableCell>{a.timestamp ? new Date(a.timestamp).toLocaleString() : "-"}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell className="font-semibold">Analysis</TableCell>
                                    <TableCell colSpan={3} className="text-center text-gray-500">No Analysis Records</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        </Table>
                    </CardContent>
                        <div className="flex justify-between mt-6">
                            <button
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700"
                                onClick={() => {
                                    setSelectedCase(null);
                                    setChainOfCustody([]);
                                    setEvidenceList([]);
                                    setIntegrityLogs([]);
                                    setImagingLogs([]);
                                    setAnalysisResults([]);
                                    fetchCasesWithEvidence();
                                }}
                            >
                                Back to Cases
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
                                onClick={() => handleGenerateSummary(selectedCase)}
                                disabled={summaryLoading}
                            >
                                {summaryLoading ? "Generating..." : "Generate Summary"}
                            </button>
                        </div>
                        {summary && (
                            <div className="my-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
                                <h3 className="font-bold mb-2">Summary</h3>
                                <p>{summary}</p>
                            </div>
                        )}
                        
                </Card>
            )}
        </div>
    );
}