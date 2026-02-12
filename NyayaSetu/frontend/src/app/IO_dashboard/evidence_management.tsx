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
import CryptoJS from "crypto-js";

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

  const [isLoading, setIsLoading] = useState(false); // ✅ FIXED: Added to resolve undefined error.

  useEffect(() => {
    fetchEvidenceData();
  }, []);

  const fetchEvidenceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.BASE_URL}/api/evidence`, {
        headers: { 'Authorization': token, 'Cache-Control': 'no-cache' }
      });
      setEvidenceData(response.data);
    } catch {
      toast.error('Failed to fetch evidence data');
    }
  };

  const handleView = (evidence) => {
    setSelectedEvidence(evidence);
    setIsModalOpen(true);
  };

  const handleTransfer = (evidence, event) => {
    event.stopPropagation();
    setSelectedEvidence(evidence);
    setAadhaarToTransfer("");
    setIsAadhaarDialogOpen(true);
  };

  const proceedToConfirmTransfer = async () => {
    if (!aadhaarToTransfer.trim()) {
      toast.error("Please enter Aadhaar address to transfer");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${process.env.BASE_URL}/api/users/validate-aadhaar`, {
        aadhaar: aadhaarToTransfer.trim()
      }, {
        headers: { 'Authorization': token }
      });

      if (response.status === 200) {
        toast.success(`Aadhaar verified: ${response.data.name}`);
        setIsAadhaarDialogOpen(false);
        setIsConfirmDialogOpen(true);
      }
    } catch (error) {
      console.error("Aadhaar validation error:", error);

      let errorMessage = "Invalid Aadhaar address or user role mismatch.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);

      setIsConfirmDialogOpen(false);
    }
  };

  const handleTransferSubmit = async () => {
  setIsLoading(true);
  try {
    const token = localStorage.getItem('token');
    
    // 1️⃣ Perform the actual evidence transfer
    const response = await axios.post(`${process.env.BASE_URL}/api/evidence/transfer`, {
      evidenceId: selectedEvidence.evidenceId,
      aadhaar: aadhaarToTransfer.trim()
    }, {
      headers: { 'Authorization': token }
    });

    // ✅ 2️⃣ Immediately store the transfer record in your database
    await axios.post(`${process.env.BASE_URL}/api/evidence/record-transfer`, {
      evidenceId: selectedEvidence.evidenceId,
      transferredToAadhaar: aadhaarToTransfer.trim(),
      caseId: selectedEvidence.caseId,
      evidenceName: selectedEvidence.evidenceName,
    }, {
      headers: { 'Authorization': token }
    });

    setIsConfirmDialogOpen(false);
    setSelectedEvidence(null);
    fetchEvidenceData();
    toast.success(response.data.message || 'Evidence transferred successfully');
  } catch (error) {
    console.error('Transfer error:', error);

    let errorMessage = 'An unexpected error occurred during transfer.';
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || JSON.stringify(error.response.data);
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};


  const handleViewFile = (encryptedIpfsHash) => {
    try {
      const decryptedIpfsHash = CryptoJS.AES.decrypt(encryptedIpfsHash, 'your-secret-key').toString(CryptoJS.enc.Utf8);
      if (decryptedIpfsHash) {
        window.open(`https://ipfs.io/ipfs/${decryptedIpfsHash}`, '_blank');
      }
    } catch {
      toast.error("Error decrypting IPFS hash");
    }
  };

  const maskWalletAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleSearch = async () => {
    if (!searchEvidenceId) {
      toast.error("Please enter an Evidence ID to search");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.BASE_URL}/api/evidence/${searchEvidenceId}`, {
        headers: { 'Authorization': token }
      });
      setEvidenceData([response.data]);
    } catch {
      toast.error('Evidence Id not Found');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchEvidenceId(value);
    if (!value) fetchEvidenceData();
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
    <div className="flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white rounded-2xl">
      <div className="p-4 md:p-6 grid gap-8 dark:bg-gray-800 rounded-2xl">
        <ToastContainer />
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-500 font-bold">Manage Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex mb-4">
              <Input
                type="text"
                placeholder="Enter Evidence ID"
                value={searchEvidenceId}
                onChange={handleInputChange}
                className="mr-2"
              />
              <Button onClick={handleSearch} className="bg-yellow-500 text-white">Search</Button>
            </div>
            {evidenceData.length === 0 ? (
              <p>No evidence found.</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evidence ID</TableHead>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Evidence Name</TableHead>
                      <TableHead>Officer</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentEvidence.map((evidence) => (
                      <TableRow key={evidence.evidenceId}>
                        <TableCell>{evidence.evidenceId}</TableCell>
                        <TableCell>{evidence.caseId}</TableCell>
                        <TableCell>{evidence.evidenceName}</TableCell>
                        <TableCell>{evidence.officerName}</TableCell>
                        <TableCell>
                          <Button onClick={() => handleView(evidence)} className="bg-yellow-500 text-white mr-2">View</Button>
                          <Button onClick={(event) => handleTransfer(evidence, event)} className="bg-yellow-500 text-white mr-2">Transfer</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Pagination className="flex justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink className="bg-yellow-500 text-white">{currentPage}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(evidenceData.length / evidencePerPage)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {isModalOpen && selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-3xl w-full">
            <CardHeader>
              <CardTitle>Evidence Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong>Evidence ID:</strong> {selectedEvidence.evidenceId}</div>
                <div><strong>Case ID:</strong> {selectedEvidence.caseId}</div>
                <div><strong>Evidence Name:</strong> {selectedEvidence.evidenceName}</div>
                <div><strong>Officer Name:</strong> {selectedEvidence.officerName}</div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleCloseModal} className="bg-red-500 text-white">Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog open={isAadhaarDialogOpen} onOpenChange={setIsAadhaarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter Aadhaar Address</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the Aadhaar address to which you want to transfer this evidence.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Enter Aadhaar address"
            value={aadhaarToTransfer}
            onChange={(e) => setAadhaarToTransfer(e.target.value)}
            className="my-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAadhaarDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={proceedToConfirmTransfer}
                className="bg-yellow-500 text-white hover:bg-yellow-600"
              >
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
              Are you sure you want to transfer this evidence to Aadhaar <strong>{aadhaarToTransfer}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleTransferSubmit}
                className="bg-yellow-500 text-white hover:bg-yellow-600"
                disabled={isLoading}
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