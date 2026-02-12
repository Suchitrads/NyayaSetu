"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SHA256 from "crypto-js/sha256";
import axios from "axios";
import { ShieldCheck, Wallet, Clock } from "lucide-react";

const generateSHA256 = (data: string) => SHA256(data).toString();

export default function TrackEvidencePage() {
    const [logs, setLogs] = useState([]);
    const [evidenceId, setEvidenceId] = useState("");

    const handleSearch = async () => {
        if (!evidenceId.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${process.env.BASE_URL}/api/evidence/logs/${evidenceId}`, {
                headers: { Authorization: token, "Cache-Control": "no-cache" },
            });
            setLogs(response.data);
        } catch (error) {
            console.error("Error fetching logs:", error);
            toast.error("Failed to fetch logs");
        }
    };

    return (
        <div className="flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white rounded-2xl">
            <div className="p-4 md:p-6 grid dark:bg-gray-800 rounded-2xl">
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />

                <Card className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm rounded-2xl">
                    <CardContent className="p-4">
                        <div className="text-center mb-8 space-y-4">
                            <h1 className="text-xl font-bold text-yellow-600 dark:text-yellow-500 mb-4">
                                Track Evidence
                            </h1>
                            <p className="text-base text-gray-600 dark:text-gray-300">
                                Enter the Evidence ID to track its logs and verify its integrity.
                            </p>
                        </div>

                        <div className="flex items-center space-x-2 mb-6">
                            <input
                                type="text"
                                value={evidenceId}
                                onChange={(e) => setEvidenceId(e.target.value)}
                                placeholder="Enter Evidence ID"
                                className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                            <Button onClick={handleSearch} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2">
                                Search
                            </Button>
                        </div>

                        {logs.length === 0 ? (
                            <p className="text-center text-gray-700 dark:text-gray-300">No records found.</p>
                        ) : (
                            <div className="space-y-6">
                                {logs.map((log, index) => (
                                    <div key={index} className="bg-gray-200 dark:bg-gray-700 p-5 rounded-lg shadow-md border-l-4 border-yellow-500">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{log.action}</h3>
                                            <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                                                <Clock size={14} className="mr-1" />
                                                {new Date(log.timestamp).toLocaleString()}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-800 dark:text-gray-300 mt-2">{log.details}</p>

                                        <div className="mt-2 p-3 bg-gray-300 dark:bg-gray-800 rounded-md text-xs text-gray-700 dark:text-gray-300">
                                            <strong>SHA-256 Hash:</strong>
                                            <span className="block text-gray-600 dark:text-gray-400 mt-1 truncate">
                                                {generateSHA256(log.details)}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-800 dark:text-gray-300">
                                            <div className="flex items-center">
                                                <ShieldCheck size={16} className="mr-2 text-yellow-500" />
                                                <span><strong>Role:</strong> {log.role}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Wallet size={16} className="mr-2 text-yellow-500" />
                                                <span><strong>Wallet:</strong> {log.wallet}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}