"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { FileBarChart } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CasesPage() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchCaseId, setSearchCaseId] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [casesPerPage] = useState(4);
    const [selectedCase, setSelectedCase] = useState(null); // State to hold the selected case details
    const [isPopupOpen, setIsPopupOpen] = useState(false); // State to control the popup visibility

    const fetchCases = async () => {
        try {
            const response = await fetch(`${process.env.BASE_URL}/api/cases`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCases(data);
            } else {
                setError(data.message || "Failed to fetch cases");
            }
        } catch (err) {
            setError("Failed to fetch cases");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
    }, []);

    const handleViewDetails = async (caseId) => {
        try {
            const response = await fetch(`${process.env.BASE_URL}/api/cases/${caseId}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setSelectedCase(data); // Set the selected case details
                setIsPopupOpen(true); // Open the popup
            } else {
                toast.error(data.message || "Failed to fetch case details");
            }
        } catch (err) {
            toast.error("Failed to fetch case details");
        }
    };

    const handleSearch = async () => {
        if (!searchCaseId) {
            toast.error("Please enter a Case ID to search");
            return;
        }

        try {
            const response = await fetch(`${process.env.BASE_URL}/api/cases/${searchCaseId}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCases([data]); // Display the searched case
            } else {
                toast.error(data.message || "Case not found");
            }
        } catch (err) {
            toast.error("Failed to fetch case details");
        }
    };

    const handleInputChange = async (e) => {
        const value = e.target.value;
        setSearchCaseId(value);

        if (!value) {
            // Fetch all cases when the search input is cleared
            fetchCases();
        }
    };

    // Get current cases
    const indexOfLastCase = currentPage * casesPerPage;
    const indexOfFirstCase = indexOfLastCase - casesPerPage;
    const currentCases = cases.slice(indexOfFirstCase, indexOfLastCase);

    // Change page
    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= Math.ceil(cases.length / casesPerPage)) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white rounded-2xl">
            <div className="p-4 md:p-6 grid gap-8 dark:bg-gray-800 rounded-2xl">
                <ToastContainer />
                <Card className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-lg text-yellow-600 dark:text-yellow-500 font-bold">
                            <FileBarChart className="w-5 h-5" /> Active Cases
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex mb-4">
                            <Input
                                type="text"
                                placeholder="Enter Case ID"
                                value={searchCaseId}
                                onChange={handleInputChange}
                                className="mr-2"
                            />
                            <Button onClick={handleSearch} className="bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer">
                                Search
                            </Button>
                        </div>
                        {loading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <Table className="min-w-max table-auto">
                                    <TableHeader>
                                        <TableRow className="bg-gray-100 dark:bg-gray-700">
                                            <TableHead className="text-xs md:text-sm whitespace-nowrap">Case ID</TableHead>
                                            <TableHead className="text-xs md:text-sm whitespace-nowrap">Case Name</TableHead>
                                            <TableHead className="text-xs md:text-sm whitespace-nowrap">Officer</TableHead>
                                            <TableHead className="text-xs md:text-sm whitespace-nowrap">Date & Time</TableHead>
                                            <TableHead className="text-xs md:text-sm whitespace-nowrap">Status</TableHead>
                                            <TableHead className="text-xs md:text-sm whitespace-nowrap">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentCases.map((caseItem) => (
                                            <TableRow key={caseItem.caseId} className="border-b border-gray-200 dark:border-gray-700">
                                                <TableCell className="text-xs md:text-sm whitespace-nowrap">{caseItem.caseId}</TableCell>
                                                <TableCell className="text-xs md:text-sm whitespace-nowrap">{caseItem.caseName}</TableCell>
                                                <TableCell className="text-xs md:text-sm whitespace-nowrap">{caseItem.selectedOfficer}</TableCell>
                                                <TableCell className="text-xs md:text-sm whitespace-nowrap">{new Date(caseItem.updatedAt).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Badge className={`text-xs md:text-sm px-3 py-1 rounded-full ${caseItem.status === "Active" ? "bg-yellow-500 text-white dark:bg-yellow-600" :
                                                        caseItem.status === "Under Investigation" ? "border border-yellow-500 text-yellow-600 bg-transparent" :
                                                            "bg-gray-500 text-white dark:bg-gray-600"
                                                        }`}>
                                                        {caseItem.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button onClick={() => handleViewDetails(caseItem.caseId)} className="bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer">
                                                        View Details
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
                <Pagination className="flex justify-center mt-4 cursor-pointer">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                        </PaginationItem>
                        {[...Array(Math.ceil(cases.length / casesPerPage)).keys()].map((number) => (
                            <PaginationItem key={number + 1}>
                                <PaginationLink
                                    onClick={() => paginate(number + 1)}
                                    className={`${currentPage === number + 1
                                        ? "bg-yellow-500 text-white"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                                        }`}
                                >
                                    {number + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(cases.length / casesPerPage)} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>

            {/* Popup card for displaying case details */}
            {isPopupOpen && selectedCase && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg w-full max-w-5xl">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold mb-4">Case Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <strong>Case ID:</strong> {selectedCase.caseId}
                                </div>
                                <div>
                                    <strong>Case Name:</strong> {selectedCase.caseName}
                                </div>
                                <div>
                                    <strong>Officer:</strong> {selectedCase.selectedOfficer}
                                </div>
                                <div>
                                    <strong>Date & Time:</strong> {new Date(selectedCase.updatedAt).toLocaleString()}
                                </div>
                                <div>
                                    <strong>Status:</strong> {selectedCase.status}
                                </div>
                                <div>
                                    <strong>Location:</strong> {selectedCase.location}
                                </div>
                                <div>
                                    <strong>Description:</strong> {selectedCase.description}
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-xl font-bold mb-2">Suspects</h3>
                                <Table className="min-w-max table-auto">
                                    <TableHeader>
                                        <TableRow className="bg-gray-100 dark:bg-gray-700">
                                            <TableHead className="text-xs md:text-sm">Name</TableHead>
                                            <TableHead className="text-xs md:text-sm">Age</TableHead>
                                            <TableHead className="text-xs md:text-sm">Designation</TableHead>
                                            <TableHead className="text-xs md:text-sm">Address</TableHead>
                                            <TableHead className="text-xs md:text-sm">Phone</TableHead>
                                            <TableHead className="text-xs md:text-sm">Email</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedCase.suspects.map(suspect => (
                                            <TableRow key={suspect._id.$oid} className="border-b border-gray-200 dark:border-gray-700">
                                                <TableCell className="text-xs md:text-sm">{suspect.name}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{suspect.age}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{suspect.designation}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{suspect.address}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{suspect.phone}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{suspect.email}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-xl font-bold mb-2">Victims</h3>
                                <Table className="min-w-max table-auto">
                                    <TableHeader>
                                        <TableRow className="bg-gray-100 dark:bg-gray-700">
                                            <TableHead className="text-xs md:text-sm">Name</TableHead>
                                            <TableHead className="text-xs md:text-sm">Age</TableHead>
                                            <TableHead className="text-xs md:text-sm">Designation</TableHead>
                                            <TableHead className="text-xs md:text-sm">Address</TableHead>
                                            <TableHead className="text-xs md:text-sm">Phone</TableHead>
                                            <TableHead className="text-xs md:text-sm">Email</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedCase.victims.map(victim => (
                                            <TableRow key={victim._id.$oid} className="border-b border-gray-200 dark:border-gray-700">
                                                <TableCell className="text-xs md:text-sm">{victim.name}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{victim.age}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{victim.designation}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{victim.address}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{victim.phone}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{victim.email}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-xl font-bold mb-2">Witnesses</h3>
                                <Table className="min-w-max table-auto">
                                    <TableHeader>
                                        <TableRow className="bg-gray-100 dark:bg-gray-700">
                                            <TableHead className="text-xs md:text-sm">Name</TableHead>
                                            <TableHead className="text-xs md:text-sm">Age</TableHead>
                                            <TableHead className="text-xs md:text-sm">Designation</TableHead>
                                            <TableHead className="text-xs md:text-sm">Address</TableHead>
                                            <TableHead className="text-xs md:text-sm">Phone</TableHead>
                                            <TableHead className="text-xs md:text-sm">Email</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedCase.witnesses.map(witness => (
                                            <TableRow key={witness._id.$oid} className="border-b border-gray-200 dark:border-gray-700">
                                                <TableCell className="text-xs md:text-sm">{witness.name}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{witness.age}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{witness.designation}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{witness.address}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{witness.phone}</TableCell>
                                                <TableCell className="text-xs md:text-sm">{witness.email}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <Button onClick={() => setIsPopupOpen(false)} className="mt-4 bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer">
                                Close
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}