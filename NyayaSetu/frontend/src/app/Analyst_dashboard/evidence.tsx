"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext
} from "@/components/ui/pagination";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction
} from "@/components/ui/alert-dialog";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function EvidencePage() {
  const [evidenceData, setEvidenceData] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAadhaarDialogOpen, setIsAadhaarDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [aadhaarToTransfer, setAadhaarToTransfer] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [evidencePerPage] = useState(4);
  const [searchEvidenceId, setSearchEvidenceId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTransferredEvidence();
  }, []);

  const getAadhaarFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.aadhaar || null;
  };

  const fetchTransferredEvidence = async () => {
    try {
      const token = localStorage.getItem("token");
      const aadhaar = getAadhaarFromToken();

      const response = await axios.get(
        `${process.env.BASE_URL}/api/evidence/transferred-to-analyst`,
        { headers: { Authorization: token } }
      );

      const filteredEvidence = response.data.evidenceList
        .filter(item => item.transferredToAadhaar === aadhaar)
        .map(item => item.evidence);

      setEvidenceData(filteredEvidence);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch transferred evidences.");
    }
  };

  const handleView = async (evidence) => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
            `${process.env.BASE_URL}/api/evidence/details/${evidence.evidenceId}`,
            { headers: { Authorization: token } }
        );

        console.log("Evidence details response:", res.data);

        if (!res.data.analysisLogs || res.data.analysisLogs.length === 0) {
            toast.warn("No analysis details found for this evidence.");
        }

        setSelectedEvidence({
            ...res.data.evidence,
            imagingLogs: res.data.imagingLogs || [],
            integrityLogs: res.data.integrityLogs || [],
            analysisLogs: res.data.analysisLogs || []
        });

        setIsModalOpen(true);
    } catch (error) {
        console.error(error);
        toast.error("Error fetching evidence details");
    }
};


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvidence(null);
  };

  const handleTransfer = (evidence, event) => {
    event.stopPropagation();
    setSelectedEvidence(evidence);
    setAadhaarToTransfer("");
    setIsAadhaarDialogOpen(true);
  };

 const proceedToConfirmTransfer = async () => {
    const aadhaar = aadhaarToTransfer.trim();
    if (!aadhaar) {
        toast.error("Please enter Aadhaar address to transfer");
        return;
    }
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
            `${process.env.BASE_URL}/api/users/validate-investigation-officer-aadhaar`,
            { aadhaar },
            { headers: { Authorization: token } }
        );
        if (response.status === 200) {
            toast.success(`Aadhaar verified: ${response.data.name}`);
            setIsAadhaarDialogOpen(false);
            setIsConfirmDialogOpen(true);
        }
    } catch (error) {
        console.error("Aadhaar validation error:", error);
        toast.error(
            error.response?.data?.message || "Invalid Aadhaar address or user role mismatch."
        );
    }
};


const handleTransferSubmit = async () => {
    setIsLoading(true);
    try {
        const token = localStorage.getItem("token");

        await axios.post(
            `${process.env.BASE_URL}/api/evidence/transfer-to-io`,
            {
                evidenceId: selectedEvidence.evidenceId,
                aadhaar: aadhaarToTransfer.trim(),
            },
            { headers: { Authorization: token } }
        );

        toast.success("Evidence transferred successfully to the Investigating Officer.");
        setIsConfirmDialogOpen(false);
        setSelectedEvidence(null);
        fetchTransferredEvidence(); // Refresh UI
    } catch (error) {
        console.error("Error transferring evidence:", error);
        toast.error(
            error.response?.data?.message || "Error transferring evidence to the Investigating Officer."
        );
    } finally {
        setIsLoading(false);
    }
};


  const handleSearch = () => {
    if (!searchEvidenceId.trim()) {
      toast.error("Please enter an Evidence ID to search.");
      return;
    }
    const filtered = evidenceData.filter(item =>
      item.evidenceId.toLowerCase().includes(searchEvidenceId.trim().toLowerCase())
    );
    if (filtered.length === 0) {
      toast.error("Evidence not found or not assigned to you.");
    }
    setEvidenceData(filtered);
  };

  const handleInputChange = (e) => {
    setSearchEvidenceId(e.target.value);
    if (e.target.value === "") fetchTransferredEvidence();
  };

  const indexOfLastEvidence = currentPage * evidencePerPage;
  const indexOfFirstEvidence = indexOfLastEvidence - evidencePerPage;
  const currentEvidence = evidenceData.slice(indexOfFirstEvidence, indexOfLastEvidence);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(evidenceData.length / evidencePerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <div className="flex mb-4">
        <Input
          placeholder="Enter Evidence ID"
          value={searchEvidenceId}
          onChange={handleInputChange}
          className="mr-2"
        />
        <Button onClick={handleSearch} className="bg-yellow-500 text-white">
          Search
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Evidence ID</TableHead>
            <TableHead>Case ID</TableHead>
            <TableHead>Evidence Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentEvidence.map((evidence) => (
            <TableRow key={evidence.evidenceId}>
              <TableCell>{evidence.evidenceId}</TableCell>
              <TableCell>{evidence.caseId}</TableCell>
              <TableCell>{evidence.evidenceName}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleView(evidence)}
                  className="bg-yellow-500 text-white mr-2"
                >
                  View
                </Button>
                <Button
                  onClick={(e) => handleTransfer(evidence, e)}
                  className="bg-yellow-500 text-white"
                >
                  Transfer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination className="mt-4 justify-center">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => paginate(currentPage - 1)} />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>{currentPage}</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={() => paginate(currentPage + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {isModalOpen && selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full p-4 space-y-3 bg-white overflow-auto max-h-[80vh]">
            <CardHeader>
              <CardTitle className="text-lg">Evidence Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>Evidence ID:</strong> {selectedEvidence.evidenceId || "N/A"}</div>
              <div><strong>Evidence Name:</strong> {selectedEvidence.evidenceName || "N/A"}</div>
              <div><strong>Case ID:</strong> {selectedEvidence.caseId || "N/A"}</div>

              {selectedEvidence.imagingLogs?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-yellow-600">Imaging Results</h3>
                  {selectedEvidence.imagingLogs.map((log, idx) => (
                    <div key={idx} className="border p-2 rounded my-1">
                      <div><strong>File Name:</strong> {log.fileName}</div>
                      <div><strong>SHA256:</strong> {log.sha256}</div>
                      <div><strong>Imaging Done:</strong> {String(log.imagingDone)}</div>
                      <div><strong>Downloaded:</strong> {String(log.downloaded)}</div>
                      <div><strong>Imaging Timestamp:</strong> {log.imagingTimestamp}</div>
                      <div><strong>Download Timestamp:</strong> {log.downloadTimestamp}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedEvidence.integrityLogs?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-yellow-600">Integrity Results</h3>
                  {selectedEvidence.integrityLogs.map((log, idx) => (
                    <div key={idx} className="border p-2 rounded my-1">
                      <div><strong>Hash:</strong> {log.hashValue}</div>
                      <div><strong>Status:</strong> {log.status}</div>
                      <div><strong>Verified At:</strong> {log.verifiedAt}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedEvidence.analysisLogs?.length > 0 ? (
    <div>
        <h3 className="font-semibold text-yellow-600">Analysis Results</h3>
        {selectedEvidence.analysisLogs.map((log, idx) => (
            <div key={idx} className="border p-2 rounded my-2 bg-gray-50">
                <div className="text-sm text-gray-600">#{idx + 1}</div>
                <div><strong>Analysis Type:</strong> {log.analysisType ?? "N/A"}</div>
                <div><strong>Timestamp:</strong> {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}</div>
                {log.result && Object.keys(log.result).length > 0 ? (
                    <div className="mt-2">
                        <strong>Result Details:</strong>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            {Object.entries(log.result).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                    <strong>{key}:</strong> {String(value)}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 mt-1">No result details available.</div>
                )}
            </div>
        ))}
    </div>
) : (
    <div className="text-sm text-gray-500">No analysis results found for this evidence.</div>
)}


              <Button onClick={handleCloseModal} className="bg-red-500 text-white w-full mt-3">Close</Button>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog open={isAadhaarDialogOpen} onOpenChange={setIsAadhaarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter Aadhaar Address</AlertDialogTitle>
          </AlertDialogHeader>
          <Input
            placeholder="Aadhaar address"
            value={aadhaarToTransfer}
            onChange={(e) => setAadhaarToTransfer(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={proceedToConfirmTransfer} className="bg-yellow-500 text-white">
                Continue
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Transfer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to transfer to Aadhaar: <strong>{aadhaarToTransfer}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleTransferSubmit}
                disabled={isLoading}
                className="bg-yellow-500 text-white"
              >
                {isLoading ? "Transferring..." : "Confirm"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
