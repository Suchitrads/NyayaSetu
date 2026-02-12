"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Integrity() {
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [shaValue, setShaValue] = useState<string | null>(null);
    const [evidenceId, setEvidenceId] = useState<string>("");
    const [progress, setProgress] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [verifying, setVerifying] = useState<boolean>(false);

    const resetForm = () => {
        setFile(null);
        setShaValue(null);
        setEvidenceId("");
        setProgress(0);
        setFilePreview(null);
        setIsLoading(false);
        setVerifying(false);
    };

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setFile(file);
            generatePreview(file);
            simulateProgressBarAnimation();
            setTimeout(() => generateShaValue(file), 1000);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const simulateProgressBarAnimation = () => {
        let progressValue = 0;
        const interval = setInterval(() => {
            if (progressValue < 100) {
                progressValue += 10;
                setProgress(progressValue);
            } else {
                clearInterval(interval);
            }
        }, 100);
    };

    // Use Web Crypto API for hashing (matches your upload logic)
    const generateShaValue = (file: File) => {
        const reader = new FileReader();

        reader.onloadstart = () => setProgress(0);

        reader.onprogress = (event) => {
            if (event.loaded && event.total) {
                setProgress(Math.round((event.loaded / event.total) * 100));
            }
        };

        reader.onload = async (event) => {
            const buffer = new Uint8Array(event.target?.result as ArrayBuffer);
            const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
            setShaValue(hashHex);
        };

        reader.readAsArrayBuffer(file);
    };

    const generatePreview = (file: File) => {
        const type = file.type;
        if (type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => setFilePreview(e.target?.result as string);
            reader.readAsDataURL(file);
        } else if (type === "application/pdf") {
            const pdfUrl = URL.createObjectURL(file);
            setFilePreview(pdfUrl);
        } else if (type.startsWith("text/") || file.name.endsWith(".csv") || file.name.endsWith(".json")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const textContent = (e.target?.result as string).slice(0, 1000);
                setFilePreview(textContent);
            };
            reader.readAsText(file);
        } else {
            setFilePreview(null);
        }
    };

const checkIntegrity = async () => {
    if (!shaValue || !evidenceId) {
        toast.error("Please upload a file and enter Evidence ID.");
        return;
    }
    try {
        setIsLoading(true);
        setVerifying(true);
        const token = localStorage.getItem("token");
        const baseUrl = process.env.BASE_URL;
        console.log("Calling backend...", baseUrl);
        console.log("token:", token);
        const url = `${baseUrl}/api/checkIntegrity?evidenceId=${encodeURIComponent(evidenceId.trim())}&fileHash=${encodeURIComponent(shaValue)}`;
        console.log("Request URL:", url);
        const response = await fetch(
            url,
            {
                headers: { "Authorization": `Bearer ${token}` }
            }
        );

        console.log("Button clicked");

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message || "Failed to verify integrity.");
            setIsLoading(false);
            setVerifying(false);
            return;
        }

        const data = await response.json();

        // Store the integrity check result in the database
        const saveRes = await fetch(
            `${baseUrl}/api/integrity`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    evidenceId,
                    evidenceType: file?.type || "unknown",
                    hash: shaValue,
                    status: data.status === "verified" ? "Verified" : "Tampered"
                })
            }
        );

        if (!saveRes.ok) {
            toast.error("Failed to save integrity record.");
        } else {
            const saveData = await saveRes.json();
            // Show backend message (e.g., "Verification status saved successfully")
            toast.success(saveData.message || "Verification status saved successfully", { autoClose: 4000 });
        }

        if (data.status === "verified") {
            toast.success("Evidence Integrity Verified!", { autoClose: 4000 });
        } else if (data.status === "failed") {
            toast.error("Integrity Failed! Evidence has been modified or Evidence ID is incorrect.", { autoClose: 4000 });
        } else {
            toast.error("An error occurred during verification.");
        }

        resetForm();

    } catch (err) {
        console.error("DEBUG: Error in checkIntegrity:", err);
        toast.error("An error occurred during verification.");
    } finally {
        setVerifying(false);
        setIsLoading(false);
    }
};

    return (
        <div className="flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white rounded-2xl">
            <div className="p-4 md:p-6 grid dark:bg-gray-800 rounded-2xl">
                <ToastContainer />

                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm rounded-2xl">
                    <div className="p-4">
                        <div className="text-center mb-8 space-y-4">
                            <h1 className="text-xl font-bold text-yellow-600 dark:text-yellow-500">
                                Evidence Integrity Verification
                            </h1>
                            <p className="text-base text-gray-600 dark:text-gray-300">
                                Verify the authenticity of your evidence and ensure its integrity.
                            </p>
                        </div>

                        <div
                            {...getRootProps()}
                            className="flex flex-col items-center justify-center border-4 border-dashed border-gray-300 dark:border-gray-600 p-6 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            <input {...getInputProps()} />
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                                Drag & Drop your evidence here or click to select
                            </p>
                            <Button variant="ghost" className="bg-yellow-500 text-white hover:bg-yellow-600 px-8 py-2">
                                Upload Evidence
                            </Button>
                        </div>

                        {file && (
                            <div className="mt-6 space-y-4">
                                <p className="text-base text-gray-600 dark:text-gray-300">
                                    <strong>Selected Evidence:</strong> {file.name}
                                </p>
                                {progress > 0 && <Progress value={progress} />}
                                {shaValue && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        <strong>SHA-256 Value:</strong> {shaValue}
                                    </p>
                                )}
                                {filePreview && (
                                    <div className="mt-4">
                                        <strong className="text-gray-700 dark:text-gray-300">Preview:</strong>
                                        <div className="mt-2">
                                            {file.type.startsWith("image/") && (
                                                <img src={filePreview} alt="Preview" className="w-64 rounded-md" />
                                            )}
                                            {file.type === "application/pdf" && (
                                                <iframe src={filePreview} className="w-full h-64 rounded-md" title="PDF Preview" />
                                            )}
                                            {(file.type.startsWith("text/") ||
                                                file.name.endsWith(".csv") ||
                                                file.name.endsWith(".json")) && (
                                                <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm max-h-64 overflow-y-auto">
                                                    {filePreview}
                                                </pre>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Evidence ID input & Button */}
                        <div className="space-y-4 mt-6">
                            <label htmlFor="evidenceId" className="block text-gray-700 dark:text-gray-300">
                                Enter Evidence ID:
                            </label>
                            <input
                                type="text"
                                id="evidenceId"
                                value={evidenceId}
                                onChange={(e) => setEvidenceId(e.target.value)}
                                className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                placeholder="Evidence ID"
                            />
                            <Button
                                variant="default"
                                className="w-full mt-4 bg-yellow-500 text-white hover:bg-yellow-600"
                                onClick={checkIntegrity}
                                disabled={isLoading || verifying}
                            >
                                {verifying ? (
                                    <div className="flex items-center gap-2 justify-center">
                                        <Spinner />
                                        Verifying...
                                    </div>
                                ) : (
                                    "Verify Integrity"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Progress Bar Component
const Progress = ({ value }: { value: number }) => (
    <div className="w-full h-3 bg-gray-200 rounded-full mt-2">
        <div
            className="h-3 bg-yellow-500 rounded-full transition-all duration-300 ease-out text-xs text-center text-white"
            style={{ width: `${value}%` }}
        >
            {value > 10 && <span className="text-xs">{value}%</span>}
        </div>
    </div>
);

// Spinner Component
const Spinner = () => (
    <div className="w-4 h-4 border-2 border-t-2 border-yellow-300 rounded-full animate-spin"></div>
);