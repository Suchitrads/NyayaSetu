"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext
} from "@/components/ui/pagination";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function TransferredEvidencePage() {
  const [evidenceList, setEvidenceList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchEvidenceId, setSearchEvidenceId] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const evidencesPerPage = 5;

  useEffect(() => {
    fetchTransferredEvidence();
  }, []);

  const fetchTransferredEvidence = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.BASE_URL}/api/evidence/transferred-to-analyst`,
        { headers: { Authorization: token } }
      );
      setEvidenceList(response.data.evidenceList || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch transferred evidences.");
    }
  };

  const handleSearch = () => {
    if (!searchEvidenceId.trim()) {
      toast.error("Please enter an Evidence ID to search.");
      return;
    }
    const filtered = evidenceList.filter(item =>
      item.evidence.evidenceId.toLowerCase().includes(searchEvidenceId.trim().toLowerCase())
    );
    setEvidenceList(filtered);
  };

  const handleClearSearch = () => {
    setSearchEvidenceId("");
    fetchTransferredEvidence();
  };

  const handleView = (evidence) => {
    setSelectedEvidence(evidence);
    setShowModal(true);
  };

  const indexOfLastEvidence = currentPage * evidencesPerPage;
  const indexOfFirstEvidence = indexOfLastEvidence - evidencesPerPage;
  const currentEvidences = evidenceList.slice(indexOfFirstEvidence, indexOfLastEvidence);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(evidenceList.length / evidencesPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="p-6">
      <ToastContainer />

      <Card>
        <CardHeader>
          <CardTitle className="text-yellow-600 font-bold">Transferred Evidences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <Input
              placeholder="Enter Evidence ID"
              value={searchEvidenceId}
              onChange={(e) => setSearchEvidenceId(e.target.value)}
              className="mr-2"
            />
            <Button onClick={handleSearch} className="bg-yellow-500 text-white mr-2">Search</Button>
            <Button onClick={handleClearSearch} className="bg-gray-500 text-white">Clear</Button>
          </div>

          {evidenceList.length === 0 ? (
            <p>No transferred evidences found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evidence ID</TableHead>
                    <TableHead>Case ID</TableHead>
                    <TableHead>Evidence Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transferred At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentEvidences.map((item) => (
                    <TableRow key={item.transferId}>
                      <TableCell>{item.evidence.evidenceId}</TableCell>
                      <TableCell>{item.evidence.caseId}</TableCell>
                      <TableCell>{item.evidence.evidenceName}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>{new Date(item.transferredAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          className="bg-yellow-500 text-white mr-2"
                          onClick={() => handleView(item)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination className="mt-4 flex justify-center">
                <PaginationContent className="flex items-center space-x-2">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink className="bg-yellow-500 text-white">{currentPage}</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === Math.ceil(evidenceList.length / evidencesPerPage)}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && selectedEvidence && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-2/3 lg:w-1/2 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-yellow-600">
              Evidence Details: {selectedEvidence.evidence.evidenceId}
            </h2>
            <div className="space-y-2 text-sm md:text-base">
              <p><strong>Case ID:</strong> {selectedEvidence.evidence.caseId}</p>
              <p><strong>Evidence Name:</strong> {selectedEvidence.evidence.evidenceName}</p>
              <p><strong>Description:</strong> {selectedEvidence.evidence.evidenceDescription}</p>
              <p><strong>Type:</strong> {selectedEvidence.evidence.evidenceType}</p>
              <p><strong>Condition:</strong> {selectedEvidence.evidence.evidenceCondition}</p>
              <p><strong>Location:</strong> {selectedEvidence.evidence.location}</p>
              <p><strong>Transferred At:</strong> {new Date(selectedEvidence.transferredAt).toLocaleString()}</p>
              <p><strong>Status:</strong> {selectedEvidence.status}</p>
              <p><strong>Transferred By Aadhaar:</strong> {selectedEvidence.transferredByAadhaar}</p>
              <p><strong>Transferred To Aadhaar:</strong> {selectedEvidence.transferredToAadhaar}</p>

              {selectedEvidence.evidence.files && selectedEvidence.evidence.files.length > 0 && (
                <div>
                  <strong>Files:</strong>
                  <ul className="list-disc list-inside">
                    {selectedEvidence.evidence.files.map((file, idx) => (
                      <li key={idx}>
                        {file.fileName} ({file.fileType}, {file.fileSize})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
  );
}
