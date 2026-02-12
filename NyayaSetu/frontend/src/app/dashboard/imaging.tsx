"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import CryptoJS from "crypto-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Input } from "@/components/ui/input";

export default function Imaging() {
  const [file, setFile] = useState<File | null>(null);
  const [originalSha, setOriginalSha] = useState<string | null>(null);
  const [evidenceId, setEvidenceId] = useState<string>("");

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setOriginalSha(null);
      }
    },
  });

  const handleImageAndDownload = async () => {
    if (!evidenceId.trim()) {
      toast.error("Please enter the Evidence ID before proceeding.", { autoClose: 3000 });
      return;
    }
    if (!file) {
      toast.error("Please upload the evidence file first.", { autoClose: 3000 });
      return;
    }

    const token = localStorage.getItem("token");
    const baseUrl = process.env.BASE_URL;

    try {
      const res = await fetch(`${baseUrl}/api/evidence/${evidenceId.trim()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        toast.error("Evidence ID not found in the system. Please verify.", { autoClose: 3000 });
        return;
      }
    } catch (error) {
      toast.error("Error verifying Evidence ID. Please try again.", { autoClose: 3000 });
      console.error("Error verifying Evidence ID:", error);
      return;
    }

    // ✅ If evidence exists, proceed with imaging
    const sha = await generateSha(file);
    setOriginalSha(sha);

    const reader = new FileReader();
    reader.onload = async () => {
      const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });
      const clonedFile = new File(
        [blob],
        `${file.name.replace(/\.[^/.]+$/, "")}_forensic_evidence_${Date.now()}${file.name.slice(file.name.lastIndexOf("."))}`,
        { type: file.type }
      );

      const url = URL.createObjectURL(clonedFile);
      const link = document.createElement("a");
      link.href = url;
      link.download = clonedFile.name;
      link.click();
      URL.revokeObjectURL(url);

      await logImagingAction("imaging_done", file.name, sha, true, evidenceId.trim());
      toast.success("Imaging and download complete!", { autoClose: 3000 });
    };
    reader.readAsArrayBuffer(file);
  };

  const generateSha = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const wordArray = CryptoJS.lib.WordArray.create(reader.result as ArrayBuffer);
        const hash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
        resolve(hash);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col bg-white text-gray-900 dark:bg-gray-900 rounded-2xl">
        <div className="p-4 md:p-6 grid dark:bg-gray-800 rounded-2xl">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm rounded-2xl">
            <div className="p-4">
              <div className="text-center mb-8 space-y-4">
                <h1 className="text-xl font-bold text-yellow-600 dark:text-yellow-500 mb-4">
                  Forensic Imaging
                </h1>
                <p className="text-base text-gray-600 dark:text-gray-300">
                  Create a bit-by-bit forensic copy of your evidence file.
                </p>
              </div>


              <div
                {...getRootProps()}
                className="flex flex-col items-center justify-center border-4 border-dashed border-gray-300 dark:border-gray-600 p-6 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <input {...getInputProps()} />
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  Drag & Drop your evidence file here or click to select a file
                </p>
                <Button variant="ghost" className="bg-yellow-500 text-white hover:bg-yellow-600 px-8 py-2">
                  Upload Evidence
                </Button>
              </div>


              <div className="mt-6 space-y-4">
                <Input
                  placeholder="Enter Evidence ID"
                  value={evidenceId}
                  onChange={(e) => setEvidenceId(e.target.value)}
                />
              </div>
              
              
              {file && (
                <div className="mt-6 space-y-4">
                  <p className="text-base text-gray-600 dark:text-gray-300">
                    <strong>Selected Evidence:</strong> {file.name}
                  </p>
                  {originalSha && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
                      <strong>Original SHA-256:</strong> {originalSha}
                    </p>
                  )}
                  <Button
                    variant="default"
                    className="w-full mt-2 bg-yellow-500 text-white hover:bg-yellow-600"
                    onClick={handleImageAndDownload}
                  >
                    Click here for Imaging & Download Evidence after Imaging
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const logImagingAction = async (
  action: string,
  fileName?: string,
  sha256?: string,
  downloaded?: boolean,
  evidenceId?: string
) => {
  const token = localStorage.getItem("token");
  const baseUrl = process.env.BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/api/imaging-log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        fileName,
        action,
        sha256,
        downloaded,
        evidenceId
      })
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to store imaging details.", { autoClose: 3000 });
    }
  } catch (err) {
    toast.error("Error occurred while storing imaging details.", { autoClose: 3000 });
    console.error("Failed to log imaging action:", err);
  }
};
