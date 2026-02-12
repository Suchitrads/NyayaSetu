"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationPrevious, PaginationNext, PaginationLink
} from "@/components/ui/pagination";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [searchWallet, setSearchWallet] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    wallet: "",
    role: "",
    email: "",
    mobile: "",
    dateOfBirth: "",
    aadhaar: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users");
      setUsers(response.data);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchWallet(e.target.value);
    if (!e.target.value) fetchUsers();
  };

  const handleSearch = async () => {
    if (!searchWallet) {
      toast.error("Please enter wallet address to search");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/api/users/wallet/${searchWallet}`);
      setUsers([response.data]);
      setCurrentPage(1);
    } catch {
      toast.error("User not found");
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/users", formData);
      if (response.status === 201) {
        toast.success("User added successfully");
        setFormData({
          fullName: "",
          wallet: "",
          role: "",
          email: "",
          mobile: "",
          dateOfBirth: "",
          aadhaar: "",
        });
        fetchUsers();
      }
    } catch {
      toast.error("Failed to add user");
    }
  };

  const totalPages = Math.ceil(users.length / usersPerPage);
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = users.slice(indexOfFirst, indexOfLast);

  const paginate = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white rounded-2xl p-4 md:p-6 gap-6">
      <ToastContainer />
      <Card className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-yellow-600 dark:text-yellow-500 text-lg font-bold">
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex mb-4">
            <Input
              type="text"
              placeholder="Enter wallet address"
              value={searchWallet}
              onChange={handleInputChange}
              className="mr-2"
            />
            <Button onClick={handleSearch} className="bg-yellow-500 text-white hover:bg-yellow-600">
              Search
            </Button>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 dark:bg-gray-700">
                  <TableHead>Name</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Aadhaar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.map((user, i) => (
                  <TableRow key={i}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.wallet}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.mobile}</TableCell>
                    <TableCell>{new Date(user.dateOfBirth).toLocaleDateString()}</TableCell>
                    <TableCell>{user.aadhaar}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <Pagination className="flex justify-center mt-4">
            <PaginationContent className="flex items-center gap-2">
              <PaginationItem>
                <PaginationPrevious onClick={() => paginate(currentPage - 1)} />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  onClick={() => paginate(currentPage)}
                  className={`px-3 py-1 rounded ${
                    currentPage
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
                  }`}
                >
                  {currentPage}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext onClick={() => paginate(currentPage + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      {/* Add User Form */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-yellow-600 dark:text-yellow-500 text-lg font-bold">Add New User</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            name="fullName"
            value={formData.fullName}
            placeholder="Full Name"
            onChange={handleFormChange}
          />
          <Input
            name="wallet"
            value={formData.wallet}
            placeholder="Wallet"
            onChange={handleFormChange}
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleFormChange}
            className="border border-gray-300 rounded p-2 dark:bg-gray-700"
          >
            <option value="">Select Role</option>
            <option value="Investigation Officer">Investigating Officer</option>
            <option value="Collector">Collector</option>
            <option value="Forensic Analyst">Forensic Analyst</option>
          </select>
          <Input
            name="email"
            value={formData.email}
            placeholder="Email"
            onChange={handleFormChange}
          />
          <Input
            name="mobile"
            value={formData.mobile}
            placeholder="Mobile"
            onChange={handleFormChange}
          />
          <Input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleFormChange}
            className="dark:bg-gray-700"
          />
          <Input
            name="aadhaar"
            value={formData.aadhaar}
            placeholder="Aadhaar"
            onChange={handleFormChange}
          />
          <div className="col-span-full flex justify-end">
            <Button onClick={handleAddUser} className="bg-yellow-500 text-white hover:bg-yellow-600">
              Add User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
