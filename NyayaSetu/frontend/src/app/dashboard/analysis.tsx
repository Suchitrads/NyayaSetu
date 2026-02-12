"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import EXIF from "exif-js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function chunkArray(arr, n) {
  const chunkSize = Math.ceil(arr.length / n);
  const chunks = [];
  for (let i = 0; i < n; i++) {
    chunks.push(arr.slice(i * chunkSize, (i + 1) * chunkSize));
  }
  return chunks;
}

// Helper to save analysis result to backend
const saveAnalysisResult = async (fileName, analysisType, result, evidenceId) => {
  try {
    const analystWallet = localStorage.getItem("wallet") || "";
    await fetch(`${process.env.BASE_URL}/api/analysis/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName,
        analysisType,
        result,
        analystWallet,
        evidenceId
      }),
    });
  } catch (err) {
    toast.error("Failed to store analysis result.", { autoClose: 3000 });
  }
};

export default function Analysis() {
  const [imageURL, setImageURL] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState('');
  const [currentResult, setCurrentResult] = useState(null);
  const [evidenceId, setEvidenceId] = useState('');
  const [isEvidenceValid, setIsEvidenceValid] = useState(false);

  const analysisOptions = ["metadata", "steganography", "ela", "jpeg", "hiddenPixels", "source"];

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setImageURL(URL.createObjectURL(file));
      setSelectedFile(file);
      setSelectedAnalysis('');
      setCurrentResult(null);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const validateEvidenceId = async () => {
    if (!evidenceId.trim()) {
        toast.error("Please enter an Evidence ID.");
        return;
    }
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.BASE_URL}/api/evidence/${evidenceId.trim()}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.ok) {
            setIsEvidenceValid(true);
            toast.success("Evidence ID verified. You may proceed with analysis.");
        } else if (res.status === 404) {
            setIsEvidenceValid(false);
            toast.error("Evidence ID not found. Please check and try again.");
        } else {
            setIsEvidenceValid(false);
            toast.error("Error verifying Evidence ID.");
        }
    } catch {
        toast.error("Server error verifying Evidence ID.");
    }
};


  const handleAnalysis = async (type) => {
    if (!selectedFile || !isEvidenceValid) {
      toast.error("Please upload a file and verify the Evidence ID first.");
      return;
    }
    setCurrentResult(null);

    switch (type) {
      case "metadata":
        await extractMetadata(selectedFile);
        break;
      case "jpeg":
        const jpegResult = "JPEG quality: 85%";
        setCurrentResult({ label: "JPEG %", value: jpegResult });
        await saveAnalysisResult(selectedFile.name, "jpeg", jpegResult, evidenceId);
        break;
      case "source":
        const sourceResult = "Camera: Canon EOS";
        setCurrentResult({ label: "Source", value: sourceResult });
        await saveAnalysisResult(selectedFile.name, "source", sourceResult, evidenceId);
        break;
      // TODO: Add other analysis logic here (steganography, ela, hiddenPixels) as needed.
      default:
        break;
    }
  };

  const extractMetadata = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = async () => {
          EXIF.getData(img, async function () {
            const exif = EXIF.getAllTags(this);
            const metadata = {
              "File Name": file.name,
              "File Type": file.type,
              "File Size": `${(file.size / 1024).toFixed(2)} KB`,
              "Dimensions": `${img.width} x ${img.height}`,
              "Last Modified": new Date(file.lastModified).toLocaleString(),
              ...exif
            };
            setCurrentResult({ label: "Metadata", value: metadata });
            await saveAnalysisResult(file.name, "metadata", metadata, evidenceId);
            resolve();
          });
        };
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white rounded-2xl p-6">
      <ToastContainer />
      <Card className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm rounded-2xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-xl font-bold text-yellow-600 dark:text-yellow-500">
            Evidence Analysis
          </CardTitle>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Enter Evidence ID, upload an image, and select the type of analysis to perform.
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter Evidence ID"
              value={evidenceId}
              onChange={(e) => setEvidenceId(e.target.value)}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-black dark:text-white mb-2"
            />
            <Button
              onClick={validateEvidenceId}
              className="bg-yellow-500 text-white hover:bg-yellow-600 w-full"
            >
              Verify Evidence ID
            </Button>
          </div>

          {!imageURL ? (
            <div
              {...getRootProps()}
              className="flex flex-col items-center justify-center border-4 border-dashed border-gray-300 dark:border-gray-700 p-6 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <input {...getInputProps()} />
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Drag & drop an image here, or click to select
              </p>
              <Button variant="ghost" className="mt-4 bg-yellow-500 text-white hover:bg-yellow-600 hover:text-white px-8 py-2 cursor-pointer">
                Upload Image
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center mt-4">
              <img
                src={imageURL}
                alt="Uploaded"
                className="rounded-md shadow-md max-w-full h-64 object-contain"
              />
              <select
                value={selectedAnalysis}
                onChange={async (e) => {
                  const selected = e.target.value;
                  setSelectedAnalysis(selected);
                  await handleAnalysis(selected);
                }}
                className="mt-4 p-2 border rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
              >
                <option value="">-- Select Analysis Type --</option>
                {analysisOptions.map(opt => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {currentResult && (
        <Card className="w-full max-w-6xl mt-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm p-6">
          <CardHeader>
            <CardTitle className="text-center text-lg md:text-xl text-yellow-600 dark:text-yellow-500">
              {currentResult.label} Result
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-800 dark:text-gray-300">
            {typeof currentResult.value === "object" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(currentResult.value).map(([key, value]) => (
                  <div key={key} className="break-words">
                    <span className="font-semibold text-yellow-700 dark:text-yellow-400">{key}:</span> {String(value)}
                  </div>
                ))}
              </div>
            ) : (
              <p>{currentResult.value}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
