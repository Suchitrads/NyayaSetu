import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function RegisterNewCasePage() {
    const [caseId, setCaseId] = useState(`CS-${Math.floor(1000 + Math.random() * 9000)}`);
    const [selectedOfficer, setSelectedOfficer] = useState("");
    const [selectedOfficerWallet, setSelectedOfficerWallet] = useState("");
    const [caseName, setCaseName] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Active");
    const [suspects, setSuspects] = useState([]);
    const [witnesses, setWitnesses] = useState([]);
    const [victims, setVictims] = useState([]);
    const [suspectDetails, setSuspectDetails] = useState({ name: "", age: "", designation: "", address: "", phone: "", email: "" });
    const [witnessDetails, setWitnessDetails] = useState({ name: "", age: "", designation: "", address: "", phone: "", email: "" });
    const [victimDetails, setVictimDetails] = useState({ name: "", age: "", designation: "", address: "", phone: "", email: "" });
    const [officers, setOfficers] = useState([]);

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

    const validateName = (name) => /^[a-zA-Z\s]*$/.test(name);
    const validateAge = (age) => /^\d*$/.test(age);
    const validatePhone = (phone) => /^\d*$/.test(phone);
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleAddPerson = (category) => {
        let details;
        if (category === "suspects") details = suspectDetails;
        if (category === "witnesses") details = witnessDetails;
        if (category === "victims") details = victimDetails;

        if (details.name && validateName(details.name) && validateAge(details.age) && validatePhone(details.phone) && validateEmail(details.email)) {
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
            toast.error("Please ensure all fields are filled correctly: Name (letters only), Age (numbers only), Phone (numbers only), Email (valid format).");
        }
    };

    const handleRemovePerson = (category, index) => {
        if (category === "suspects") setSuspects(suspects.filter((_, i) => i !== index));
        if (category === "witnesses") setWitnesses(witnesses.filter((_, i) => i !== index));
        if (category === "victims") setVictims(victims.filter((_, i) => i !== index));
    };

    const clearForm = () => {
        setCaseId(`CS-${Math.floor(1000 + Math.random() * 9000)}`);
        setSelectedOfficer("");
        setSelectedOfficerWallet("");
        setCaseName("");
        setLocation("");
        setDescription("");
        setStatus("Active");
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
        if (!validateName(caseName)) {
            toast.error("Case Name should only contain letters.");
            return;
        }

        const newCase = {
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
            const response = await fetch(`${process.env.BASE_URL}/api/cases`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(newCase)
            });

            if (!response.ok) {
                throw new Error("Failed to create case");
            }

            const data = await response.json();
            toast.success("Case Created Successfully!");

            clearForm();
        } catch (error) {
            toast.error("Failed to create case");
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

    const handleOfficerChange = (officerName) => {
        setSelectedOfficer(officerName);
        const officer = officers.find((officer) => officer.fullName === officerName);
        if (officer) {
            setSelectedOfficerWallet(officer.wallet);
        }
    };

    return (
        <div className="flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white rounded-2xl">
            <div className="p-4 md:p-6 grid gap-8 dark:bg-gray-800 rounded-2xl">
                <Card className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-yellow-600 dark:text-yellow-500 mb-4">Register New Case</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                            <div>
                                <Label htmlFor="caseId" className="pl-2">Case ID</Label>
                                <Input id="caseId" value={caseId} disabled className="bg-gray-200 dark:bg-gray-700 mt-2" />
                            </div>
                            <div>
                                <Label htmlFor="caseName" className="pl-2">Case Name</Label>
                                <Input id="caseName" placeholder="Enter case name" value={caseName} onChange={(e) => setCaseName(e.target.value)} required className="mt-2" />
                            </div>
                            <div>
                                <Label htmlFor="officer" className="pl-2">Investigating Officer</Label>
                                <Select onValueChange={handleOfficerChange} value={selectedOfficer}>
                                    <SelectTrigger className="w-full mt-2 cursor-pointer">
                                        <SelectValue placeholder="Select an officer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {officers.map((officer) => (
                                            <SelectItem key={officer.wallet} value={officer.fullName}>
                                                {officer.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="officerWallet" className="pl-2">Investigating Officer Wallet</Label>
                                <Input id="officerWallet" placeholder="Officer Wallet" value={selectedOfficerWallet} onChange={(e) => setSelectedOfficerWallet(e.target.value)} disabled required className="bg-gray-200 dark:bg-gray-700 mt-2" />
                            </div>
                            <div>
                                <Label htmlFor="location" className="pl-2">Location of Incident</Label>
                                <Input id="location" placeholder="Enter location" value={location} onChange={(e) => setLocation(e.target.value)} required className="mt-2" />
                            </div>
                            <div>
                                <Label htmlFor="status" className="pl-2">Status</Label>
                                <Select onValueChange={setStatus} defaultValue="Active">
                                    <SelectTrigger disabled className="w-full mt-2 bg-gray-200 dark:bg-gray-700">
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
                                <Label htmlFor="description" className="pl-2">Brief Description</Label>
                                <Textarea id="description" placeholder="Describe the case" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-2" />
                            </div>
                        </form>

                        {["suspects", "victims", "witnesses"].map((category, index) => (
                            <div key={index} className="col-span-2 mt-6">
                                <Label className="mb-2 pl-2">{category.charAt(0).toUpperCase() + category.slice(1)}</Label>
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
                                            <Plus className="w-4 h-4" />Add
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
                                                <Button variant="destructive" onClick={() => handleRemovePerson(category, index)} className="bg-red-500 text-white"><Trash2 className="w-4 h-4" />Delete</Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        <div className="mt-6 flex flex-wrap gap-4">
                            <Button type="submit" onClick={handleSubmit} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 mt-6 cursor-pointer">Register Case</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <ToastContainer />
        </div>
    );
}