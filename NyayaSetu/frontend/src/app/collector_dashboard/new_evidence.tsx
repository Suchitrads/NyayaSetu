"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Eye } from "lucide-react";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js";

const evidenceFields = {
    phone: [
        { id: "manufacturer", label: "Manufacturer", type: "select", options: ["Apple", "Samsung", "Google", "Xiaomi", "OnePlus"] },
        { id: "modelNumber", label: "Model Number", type: "text" },
        { id: "imei1", label: "IMEI Number 1", type: "text" },
        { id: "imei2", label: "IMEI Number 2", type: "text" },
        { id: "mac", label: "MAC Address", type: "text" },
        { id: "color", label: "Color", type: "text" },
        { id: "os", label: "Operating System", type: "select", options: ["Android", "iOS", "Keypad"] },
        { id: "storage", label: "Storage Capacity", type: "select", options: ["32GB", "64GB", "128GB", "256GB", "512GB"] },
        { id: "sim_card", label: "Sim Card Present?", type: "select", options: ["Yes", "No"] },
        { id: "memory_card", label: "Memory Card Present?", type: "select", options: ["Yes", "No"] },
        { id: "description", label: "Description", type: "textarea", fullWidth: true }
    ],
    laptop: [
        { id: "manufacturer", label: "Manufacturer", type: "select", options: ["HP", "Dell", "Apple", "Lenovo", "Asus", "Acer"] },
        { id: "modelNumber", label: "Model Number", type: "text" },
        { id: "mac", label: "MAC Address", type: "text" },
        { id: "processor", label: "Processor", type: "text" },
        { id: "ram", label: "RAM Size", type: "select", options: ["4GB", "8GB", "16GB", "32GB"] },
        { id: "os", label: "Operating System", type: "select", options: ["Windows", "MacOS", "Linux"] },
        { id: "storage", label: "Storage Capacity", type: "select", options: ["256GB SSD", "512GB SSD", "1TB HDD", "2TB HDD"] },
        { id: "graphicscard", label: "Graphics Card Present?", type: "select", options: ["Yes", "No"] },
        { id: "description", label: "Description", type: "textarea", fullWidth: true }
    ],
    harddisk: [
        { id: "manufacturer", label: "Manufacturer", type: "select", options: ["Seagate", "Western Digital", "Samsung", "Toshiba"] },
        { id: "serialNumber", label: "Serial Number", type: "text" },
        { id: "storage", label: "Storage Capacity", type: "select", options: ["500GB", "1TB", "2TB", "4TB", "8TB"] },
        { id: "interface", label: "Interface Type", type: "select", options: ["SATA", "NVMe", "USB 3.0", "Thunderbolt"] },
        { id: "encryption", label: "Encryption Enabled?", type: "select", options: ["Yes", "No"] },
        { id: "description", label: "Description", type: "textarea", fullWidth: true }
    ],
    pendrive: [
        { id: "manufacturer", label: "Manufacturer", type: "select", options: ["SanDisk", "Kingston", "Transcend", "Sony"] },
        { id: "serialNumber", label: "Serial Number", type: "text" },
        { id: "storage", label: "Storage Capacity", type: "select", options: ["8GB", "16GB", "32GB", "64GB", "128GB", "256GB"] },
        { id: "usbType", label: "USB Type", type: "select", options: ["USB 2.0", "USB 3.0", "USB-C"] },
        { id: "encryption", label: "Encryption Enabled?", type: "select", options: ["Yes", "No"] },
        { id: "description", label: "Description", type: "textarea", fullWidth: true }
    ],
    CCTV: [
        { id: "manufacturer", label: "Manufacturer", type: "select", options: ["Hikvision", "Dahua", "CP Plus", "Samsung", "Bosch"] },
        { id: "modelNumber", label: "Model Number", type: "text" },
        { id: "serialNumber", label: "Serial Number", type: "text" },
        { id: "ipAddress", label: "IP Address", type: "text" },
        { id: "videoFormat", label: "Video Format", type: "select", options: ["H.264", "H.265", "MJPEG"] },
        { id: "storage", label: "Storage Capacity", type: "select", options: ["128GB", "256GB", "512GB", "1TB", "2TB"] },
        { id: "nightVision", label: "Night Vision Enabled?", type: "select", options: ["Yes", "No"] },
        { id: "audio", label: "Audio Recording Enabled?", type: "select", options: ["Yes", "No"] },
        { id: "description", label: "Description", type: "textarea", fullWidth: true }
    ]
};

export default function AddEvidence() {
    const [evidenceId, setEvidenceId] = useState(`EV-${Math.floor(1000 + Math.random() * 9000)}`);
    const [caseId, setCaseId] = useState("");
    const [collectorName, setCollectorName] = useState("");
    const [collectorWallet, setCollectorWallet] = useState("");
    const [officerName, setOfficerName] = useState("");
    const [officerWallet, setOfficerWallet] = useState("");
    const [evidenceName, setEvidenceName] = useState("");
    const [evidenceType, setEvidenceType] = useState("");
    const [evidenceCondition, setEvidenceCondition] = useState("");
    const [evidenceDescription, setEvidenceDescription] = useState("");
    const [location, setLocation] = useState("");
    const [files, setFiles] = useState([]);
    const [fileHashes, setFileHashes] = useState({});
    const [users, setUsers] = useState([]);
    const [dynamicFields, setDynamicFields] = useState({});

    // Reset function to clear all fields
    const resetForm = (e) => {
        setEvidenceId(`EV-${Math.floor(1000 + Math.random() * 9000)}`);
        setCaseId('');
        setEvidenceName('');
        setLocation('');
        setOfficerName('');
        setOfficerWallet('');
        setEvidenceDescription('');
        setEvidenceType('');
        setEvidenceCondition('');
        setFiles([]);
        setFileHashes({});
        setDynamicFields({});
        e.target.reset();
    };

    useEffect(() => {
        // Fetch all users
        axios.get(`${process.env.BASE_URL}/api/users`)
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });

        // Decode JWT token to get collector details
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = jwtDecode(token);
            setCollectorWallet(decodedToken.wallet);
            axios.get(`${process.env.BASE_URL}/api/users/wallet/${decodedToken.wallet}`)
                .then(response => {
                    setCollectorName(response.data.fullName);
                })
                .catch(error => {
                    console.error('Error fetching collector details:', error);
                });
        }
    }, []);

    const handleOfficerChange = (wallet) => {
        setOfficerWallet(wallet);
        const selectedOfficer = users.find(user => user.wallet === wallet);
        if (selectedOfficer) {
            setOfficerName(selectedOfficer.fullName);
        }
    };

    const handleDynamicFieldChange = (fieldId, value) => {
        setDynamicFields((prev) => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const handleViewFile = (file) => {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank');
    };

    const handleFileUpload = (e) => {
        const uploadedFiles = Array.from(e.target.files);
        setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);

        uploadedFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const fileContent = event.target.result;

                // Generate SHA-256 hash of the file content
                const buffer = new Uint8Array(fileContent);
                const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
                setFileHashes((prevHashes) => ({ ...prevHashes, [file.name]: hashHex }));

                // Encrypt the file content using AES-256
                const wordArray = CryptoJS.lib.WordArray.create(buffer);
                const encryptedContent = CryptoJS.AES.encrypt(wordArray, 'your-secret-key').toString();
                const base64Content = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encryptedContent));

                // Store the encrypted Base64 content in the file object
                file.encryptedContent = base64Content;
            };
            reader.readAsArrayBuffer(file);
        });

        e.target.value = null;
    };

    const handleRemoveFile = (fileName) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
        setFileHashes((prevHashes) => {
            const newHashes = { ...prevHashes };
            delete newHashes[fileName];
            return newHashes;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        const missingFields = [];
        if (!e.target.caseId.value) missingFields.push("Case ID");
        if (!e.target.evidenceName.value) missingFields.push("Evidence Name");
        if (!e.target.location.value) missingFields.push("Evidence Seizure Location");
        if (!e.target.evidenceDescription.value) missingFields.push("Brief Description");
        if (!evidenceType) missingFields.push("Evidence Type");
        if (!evidenceCondition) missingFields.push("Evidence Condition");

        evidenceFields[evidenceType]?.forEach(field => {
            const fieldValue = dynamicFields[field.id] || "";
            if (!fieldValue) {
                missingFields.push(field.label);
            }
        });

        if (missingFields.length > 0) {
            toast.error(`Please fill the following fields: ${missingFields.join(", ")}`);
            return;
        }

        let pinataApiKey, pinataSecretApiKey;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.BASE_URL}/api/pinata/keys`, {
                headers: {
                    'Authorization': token
                }
            });
            pinataApiKey = response.data.pinataApiKey;
            pinataSecretApiKey = response.data.pinataSecretApiKey;
        } catch (error) {
            console.error('Error fetching Pinata API keys:', error);
            toast.error('Error fetching Pinata API keys!');
            return;
        }

        const uploadToPinata = async (file) => {
            const formData = new FormData();
            const blob = new Blob([file.encryptedContent], { type: file.type });
            formData.append('file', blob, file.name);

            const metadata = JSON.stringify({
                name: file.name
            });
            formData.append('pinataMetadata', metadata);

            const options = JSON.stringify({
                cidVersion: 1
            });
            formData.append('pinataOptions', options);

            try {
                const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                    maxBodyLength: 'Infinity',
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                        'pinata_api_key': pinataApiKey,
                        'pinata_secret_api_key': pinataSecretApiKey
                    }
                });
                return response.data.IpfsHash;
            } catch (error) {
                console.error('Error uploading file to Pinata:', error);
                throw new Error('Error uploading file to Pinata');
            }
        };

        const fileUploadPromises = files.map(file => uploadToPinata(file));
        let ipfsHashes;
        try {
            ipfsHashes = await Promise.all(fileUploadPromises);
        } catch (error) {
            toast.error('Error uploading files to Pinata!');
            return;
        }

        // Encrypt the IPFS hashes (CIDs) using AES-256
        const encryptedIpfsHashes = ipfsHashes.map(hash => {
            return CryptoJS.AES.encrypt(hash, 'your-secret-key').toString();
        });

        const evidenceData = {
            evidenceId,
            caseId: e.target.caseId.value,
            evidenceName: e.target.evidenceName.value,
            location: e.target.location.value,
            collectorName,
            collectorWallet,
            officerName,
            officerWallet,
            evidenceDescription: e.target.evidenceDescription.value,
            evidenceType,
            evidenceCondition,
            evidenceFields: dynamicFields,
            files: files.map((file, index) => ({
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                fileHash: fileHashes[file.name],
                ipfsHash: encryptedIpfsHashes[index] // Store the encrypted CID
            }))
        };

        console.log('Evidence Data:', evidenceData); // Log the evidence data to verify its structure

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${process.env.BASE_URL}/api/evidence/add`, evidenceData, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            toast.success('Evidence uploaded successfully!');
            console.log(response.data);
            resetForm(e);
        } catch (error) {
            console.error('Error uploading evidence:', error);
            toast.error('Error uploading evidence!');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-yellow-300 rounded-xl">
                <Card className="border border-gray-300 dark:border-gray-600">
                    <CardContent>
                        <h2 className="text-xl font-bold mb-4">Add Evidence</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="evidenceId" className="pl-1">Evidence ID</label>
                                <Input id="evidenceId" value={evidenceId} disabled className="bg-gray-200 dark:bg-gray-700 mt-1" />
                            </div>
                            <div>
                                <label htmlFor="caseId" className="pl-1">Case ID</label>
                                <Input id="caseId" placeholder="Case ID" required className="mt-1" />
                            </div>
                            <div>
                                <label htmlFor="evidenceName" className="pl-1">Evidence Name</label>
                                <Input id="evidenceName" placeholder="Evidence Name" required className="mt-1" />
                            </div>
                            <div>
                                <label htmlFor="location" className="pl-1">Evidence Seizure Location</label>
                                <Input id="location" placeholder="Evidence Seizure Location" required className="mt-1" />
                            </div>
                            <div>
                                <label htmlFor="collectorName" className="pl-1">Collector Name</label>
                                <Input id="collectorName" value={collectorName} disabled className="bg-gray-200 dark:bg-gray-700 mt-1" />
                            </div>
                            <div>
                                <label htmlFor="collectorWallet" className="pl-1">Collector Wallet Address</label>
                                <Input id="collectorWallet" value={collectorWallet} onChange={(e) => setCollectorWallet(e.target.value)} required disabled className="bg-gray-200 dark:bg-gray-700 mt-1" />
                            </div>
                            <div>
                                <label htmlFor="officerName" className="pl-1">Investigating Officer Name</label>
                                <Select onValueChange={handleOfficerChange} value={officerWallet}>
                                    <SelectTrigger className="w-full mt-2">
                                        <SelectValue placeholder="Select Officer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.filter(user => user.role === 'Investigating Officer').map(user => (
                                            <SelectItem key={user.wallet} value={user.wallet}>
                                                {user.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="officerWallet" className="pl-1">Investigating Officer Wallet Address</label>
                                <Input id="officerWallet" value={officerWallet} disabled className="bg-gray-200 dark:bg-gray-700 mt-1" />
                            </div>
                        </div>
                        <div className="mt-6">
                            <label htmlFor="evidenceDescription" className="pl-1">Brief Description</label>
                            <Textarea id="evidenceDescription" placeholder="Evidence Description" className="w-full mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-6 mt-6">
                            <div>
                                <label htmlFor="evidenceType" className="pl-1">Evidence Type</label>
                                <Select onValueChange={setEvidenceType} value={evidenceType}>
                                    <SelectTrigger className="border border-gray-400 dark:border-gray-600 w-full mt-1 cursor-pointer">
                                        <SelectValue placeholder="Select Evidence Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(evidenceFields).map((type) => (
                                            <SelectItem key={type} value={type} className="cursor-pointer">{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="evidenceCondition" className="pl-1">Evidence Condition</label>
                                <Select onValueChange={setEvidenceCondition} value={evidenceCondition}>
                                    <SelectTrigger className="border border-gray-400 dark:border-gray-600 w-full mt-1 cursor-pointer">
                                        <SelectValue placeholder="Select Evidence Condition" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["Damaged", "Compromised", "Encrypted", "Corrupted", "Off-Condition", "On-Condition"].map((condition) => (
                                            <SelectItem key={condition} value={condition} className="cursor-pointer">{condition}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mt-6">
                            {evidenceType && evidenceFields[evidenceType]?.map((field) => (
                                <div key={field.id} className={field.fullWidth ? "col-span-2" : ""}>
                                    <label htmlFor={field.id} className="pl-1">{field.label}</label>
                                    {field.type === "text" && (
                                        <Input
                                            id={field.id}
                                            placeholder={field.label}
                                            required
                                            className="mt-1"
                                            onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
                                        />
                                    )}
                                    {field.type === "textarea" && (
                                        <Textarea
                                            id={field.id}
                                            placeholder={field.label}
                                            className="w-full mt-1"
                                            onChange={(e) => handleDynamicFieldChange(field.id, e.target.value)}
                                        />
                                    )}
                                    {field.type === "select" && (
                                        <Select
                                            id={field.id}
                                            onValueChange={(value) => handleDynamicFieldChange(field.id, value)}
                                        >
                                            <SelectTrigger className="border border-gray-400 dark:border-gray-600 mt-1 cursor-pointer">
                                                <SelectValue placeholder={field.label} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options.map((option) => (
                                                    <SelectItem key={option} value={option} className="cursor-pointer">{option}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-6">
                            <label htmlFor="evidence_files" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Upload Evidences</label>
                            <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-4 hover:bg-gray-100 dark:hover:bg-gray-600" id="evidence_files" type="file" multiple onChange={handleFileUpload} />
                            {files.length > 0 && (
                                <div className="mt-4">
                                    <table className="min-w-full bg-white dark:bg-gray-800 text-sm">
                                        <thead>
                                            <tr>
                                                <th className="py-2 px-2 border-b">File Name</th>
                                                <th className="py-2 px-4 border-b">File Size</th>
                                                <th className="py-2 px-4 border-b">File Type</th>
                                                <th className="py-2 px-4 border-b">SHA-256 Hash</th>
                                                <th className="py-2 px-4 border-b">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {files.map((file) => (
                                                <tr key={file.name}>
                                                    <td className="py-2 px-4 border-b">{file.name}</td>
                                                    <td className="py-2 px-4 border-b">{(file.size / 1024).toFixed(2)} KB</td>
                                                    <td className="py-2 px-4 border-b">{file.type}</td>
                                                    <td className="py-2 px-4 border-b">{fileHashes[file.name]}</td>
                                                    <td className="py-2 px-4 border-b">
                                                        <div className="flex space-x-2">
                                                            <Button variant="destructive" onClick={() => handleRemoveFile(file.name)} className="bg-red-500 text-white cursor-pointer">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="primary" onClick={() => handleViewFile(file)} className="bg-blue-500 text-white cursor-pointer">
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 mt-6 cursor-pointer">Submit Evidence</Button>
                    </CardContent>
                </Card>
            </div>
            <ToastContainer />
        </form>
    );
}