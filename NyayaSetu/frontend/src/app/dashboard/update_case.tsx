"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function UpdateCasePage() {
    const [caseId, setCaseId] = useState("");
    const [caseName, setCaseName] = useState("");
    const [selectedOfficer, setSelectedOfficer] = useState("");
    const [selectedOfficerWallet, setSelectedOfficerWallet] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [status, setStatus] = useState("");
    const [suspects, setSuspects] = useState([]);
    const [witnesses, setWitnesses] = useState([]);
    const [victims, setVictims] = useState([]);
    const [suspectDetails, setSuspectDetails] = useState({ name: "", age: "", designation: "", address: "", phone: "", email: "" });
    const [witnessDetails, setWitnessDetails] = useState({ name: "", age: "", designation: "", address: "", phone: "", email: "" });
    const [victimDetails, setVictimDetails] = useState({ name: "", age: "", designation: "", address: "", phone: "", email: "" });
    const [officers, setOfficers] = useState([]);

    useEffect(() => {
        setCaseId("CS-"); // Set the initial caseId on the client side
    }, []);

    useEffect(() => {
        const fetchOfficers = async () => {
            try {
                const response = await axios.get(`${process.env.BASE_URL}/api/officers`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                setOfficers(response.data);
            } catch (error) {
                console.error('Error fetching officers:', error);
                toast.error('Failed to fetch officers');
            }
        };

        fetchOfficers();
    }, []);

    const fetchCaseDetails = async () => {
        if (!caseId) {
            toast.error('Please enter a Case ID');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.BASE_URL}/api/cases/${caseId}`, {
                headers: {
                    'Authorization': token
                }
            });
            const caseData = response.data;

            setCaseName(caseData.caseName);
            setSelectedOfficer(caseData.selectedOfficer);
            setSelectedOfficerWallet(caseData.selectedOfficerWallet);
            setDescription(caseData.description);
            setLocation(caseData.location);
            setStatus(caseData.status);
            setSuspects(caseData.suspects);
            setWitnesses(caseData.witnesses);
            setVictims(caseData.victims);
        } catch (error) {
            console.error('Error fetching case details:', error);
            toast.error('Error fetching case details!');
        }
    };

    const handleInputChange = (e, category) => {
        const { name, value } = e.target;
        if (category === "suspects") {
            setSuspectDetails({ ...suspectDetails, [name]: value });
        }
        if (category === "witnesses") {
            setWitnessDetails({ ...witnessDetails, [name]: value });
        }
        if (category === "victims") {
            setVictimDetails({ ...victimDetails, [name]: value });
        }
    };

    const handleAddPerson = (category) => {
        let details;
        if (category === "suspects") details = suspectDetails;
        if (category === "witnesses") details = witnessDetails;
        if (category === "victims") details = victimDetails;

        if (details.name && details.age && details.phone && details.email) {
            if (category === "suspects") {
                setSuspects([...suspects, { ...suspectDetails }]);
                setSuspectDetails({ name: "", age: "", designation: "", address: "", phone: "", email: "" });
            }
            if (category === "witnesses") {
                setWitnesses([...witnesses, { ...witnessDetails }]);
                setWitnessDetails({ name: "", age: "", designation: "", address: "", phone: "", email: "" });
            }
            if (category === "victims") {
                setVictims([...victims, { ...victimDetails }]);
                setVictimDetails({ name: "", age: "", designation: "", address: "", phone: "", email: "" });
            }
        } else {
            toast.error("Please ensure all fields are filled correctly.");
        }
    };

    const handleRemovePerson = (category, index) => {
        if (category === "suspects") setSuspects(suspects.filter((_, i) => i !== index));
        if (category === "witnesses") setWitnesses(witnesses.filter((_, i) => i !== index));
        if (category === "victims") setVictims(victims.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setCaseId("CS-");
        setCaseName("");
        setSelectedOfficer("");
        setSelectedOfficerWallet("");
        setDescription("");
        setLocation("");
        setStatus("");
        setSuspects([]);
        setWitnesses([]);
        setVictims([]);
        setSuspectDetails({ name: "", age: "", designation: "", address: "", phone: "", email: "" });
        setWitnessDetails({ name: "", age: "", designation: "", address: "", phone: "", email: "" });
        setVictimDetails({ name: "", age: "", designation: "", address: "", phone: "", email: "" });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!caseName || !location || !description || !selectedOfficer) {
            toast.error("All fields are required.");
            return;
        }

        const updatedCase = {
            caseId,
            caseName,
            selectedOfficer,
            selectedOfficerWallet,
            description,
            location,
            suspects,
            victims,
            witnesses,
            status,
        };

        try {
            const response = await fetch(`${process.env.BASE_URL}/api/cases/${caseId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(updatedCase)
            });

            if (!response.ok) {
                throw new Error("Failed to update case");
            }

            const data = await response.json();
            toast.success("Case Updated Successfully!");
            resetForm(); // Reset the form after successful update
        } catch (error) {
            toast.error("Failed to update case");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white rounded-2xl">
                <div className="p-4 md:p-6 grid gap-8 dark:bg-gray-800 rounded-2xl">
                    <Card className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-yellow-600 dark:text-yellow-500 mb-4">Update Case</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="caseId" className="pl-1">Case ID</label>
                                    <Input id="caseId" value={caseId} onChange={(e) => setCaseId(e.target.value)} className="mt-1" />
                                    <Button onClick={fetchCaseDetails} className="mt-4 bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer">Fetch Case</Button>
                                    <Button onClick={resetForm} className="bg-gray-500 hover:bg-gray-600 text-white mt-2 ml-2 cursor-pointer">Clear</Button>
                                </div>
                                <div>
                                    <label htmlFor="caseName" className="pl-1">Case Name</label>
                                    <Input id="caseName" value={caseName} onChange={(e) => setCaseName(e.target.value)} placeholder="Case Name" required className="mt-1" />
                                </div>
                                <div>
                                    <label htmlFor="officer" className="pl-1">Investigating Officer</label>
                                    <Input id="officer" value={selectedOfficer} disabled className="bg-gray-200 dark:bg-gray-700 mt-2" />
                                </div>
                                <div>
                                    <label htmlFor="officerWallet" className="pl-1">Investigating Officer Wallet</label>
                                    <Input id="officerWallet" placeholder="Officer Wallet" value={selectedOfficerWallet} onChange={(e) => setSelectedOfficerWallet(e.target.value)} disabled required className="bg-gray-200 dark:bg-gray-700 mt-2" />
                                </div>
                                <div>
                                    <label htmlFor="location" className="pl-1">Location of Incident</label>
                                    <Input id="location" placeholder="Enter location" value={location} onChange={(e) => setLocation(e.target.value)} required className="mt-2" />
                                </div>
                                <div>
                                    <label htmlFor="status" className="pl-1">Status</label>
                                    <Select onValueChange={setStatus} value={status}>
                                        <SelectTrigger className="w-full mt-2 cursor-pointer">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                                            <SelectItem value="Closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2">
                                    <label htmlFor="description" className="pl-2">Brief Description</label>
                                    <Textarea id="description" placeholder="Describe the case" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-2" />
                                </div>
                            </div>

                            {["suspects", "victims", "witnesses"].map((category, index) => (
                                <div key={index} className="col-span-2 mt-6">
                                    <label className="mb-2 pl-2">{category.charAt(0).toUpperCase() + category.slice(1)}</label>
                                    <div className="grid grid-cols-12 gap-2 items-center">
                                        <Input name="name" placeholder="Name" className="col-span-2 mt-2" value={category === "suspects" ? suspectDetails.name : category === "witnesses" ? witnessDetails.name : victimDetails.name} onChange={(e) => handleInputChange(e, category)} />
                                        <Input name="age" placeholder="Age" className="col-span-1 mt-2" type="number" value={category === "suspects" ? suspectDetails.age : category === "witnesses" ? witnessDetails.age : victimDetails.age} onChange={(e) => handleInputChange(e, category)} />
                                        <Input name="designation" placeholder="Designation" className="col-span-2 mt-2" value={category === "suspects" ? suspectDetails.designation : category === "witnesses" ? witnessDetails.designation : victimDetails.designation} onChange={(e) => handleInputChange(e, category)} />
                                        <Input name="address" placeholder="Address" className="col-span-2 mt-2" value={category === "suspects" ? suspectDetails.address : category === "witnesses" ? witnessDetails.address : victimDetails.address} onChange={(e) => handleInputChange(e, category)} />
                                        <Input name="phone" placeholder="Phone" className="col-span-2 mt-2" type="tel" value={category === "suspects" ? suspectDetails.phone : category === "witnesses" ? witnessDetails.phone : victimDetails.phone} onChange={(e) => handleInputChange(e, category)} />
                                        <div className="flex items-center gap-2 col-span-3 mt-2">
                                            <Input name="email" placeholder="Email" className="col-span-2" type="email" value={category === "suspects" ? suspectDetails.email : category === "witnesses" ? witnessDetails.email : victimDetails.email} onChange={(e) => handleInputChange(e, category)} />
                                            <Button onClick={() => handleAddPerson(category)} className="bg-yellow-500 text-white" disabled={!(
                                                (category === "suspects" && suspectDetails.name && suspectDetails.age && suspectDetails.phone && suspectDetails.email) ||
                                                (category === "witnesses" && witnessDetails.name && witnessDetails.age && witnessDetails.phone && witnessDetails.email) ||
                                                (category === "victims" && victimDetails.name && victimDetails.age && victimDetails.phone && victimDetails.email)
                                            )}>
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                    <ul className="mt-4 space-y-2">
                                        {(category === "suspects" ? suspects : category === "witnesses" ? witnesses : victims).map((person, index) => (
                                            <li key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                                <span className="block text-sm col-span-2">Name: {person.name}</span>
                                                <span className="block text-sm col-span-1">Age: {person.age}</span>
                                                <span className="block text-sm col-span-2">Designation: {person.designation}</span>
                                                <span className="block text-sm col-span-2">Address: {person.address}</span>
                                                <span className="block text-sm col-span-2">Phone: {person.phone}</span>
                                                <div className="flex items-center gap-2 col-span-3">
                                                    <span className="block text-sm col-span-2">Email: {person.email}</span>
                                                    <Button variant="destructive" onClick={() => handleRemovePerson(category, index)} className="bg-red-500 text-white">Delete</Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 mt-6 cursor-pointer">Update Case</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <ToastContainer />
        </form>
    );
}