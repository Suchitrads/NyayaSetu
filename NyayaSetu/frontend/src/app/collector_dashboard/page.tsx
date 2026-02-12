"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import dynamic from "next/dynamic";
import Navbar from "../dashboard/navbar";
import Sidebar from "../dashboard/sidebar";
import Footer from "../dashboard/footer";
import { Home, BriefcaseBusiness, FilePlus, ClipboardPen, NotebookPen, SquarePlus, SquarePen, ScanSearch, Hash, Images, ScanEye, FileChartColumnIncreasing, Menu, X } from "lucide-react";


// const HomeDashboard = dynamic(() => import("./home"));
const EvidenceManagementPage = dynamic(() => import("./evidence_management"));
const RegisterEvidencePage = dynamic(() => import("./new_evidence"));
const UpdateEvidencePage = dynamic(() => import("./update_evidence"));


export default function InvestigationOfficerDashboard() {
    const [activeTab, setActiveTab] = useState("Home");
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        setIsAuthorized(false);
        setError("No token found. Please login.");
        router.push("/login?unauthorized=true");
        return;
    }

    try {
        const decodedToken: any = jwtDecode(token);
        console.log("Decoded token:", decodedToken);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp && decodedToken.exp < currentTime) {
            localStorage.removeItem("token");
            setIsAuthorized(false);
            setError("Session expired. Please login again.");
            router.push("/login?unauthorized=true");
        } else if (
            decodedToken.role &&
            decodedToken.role.toLowerCase().replace(/[\s_]/g, "") === "collector"
        ) {
            setRole(decodedToken.role);
            setIsAuthorized(true);
            setError(null);
        }else {
            setIsAuthorized(false);
            setError("Unauthorized: Not a Collector.");
            router.push("/dashboard");
        }
    } catch (error) {
        localStorage.removeItem("token");
        setIsAuthorized(false);
        setError("Invalid token. Please login again.");
        router.push("/login?unauthorized=true");
    }
}, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
                    {error && <p className="text-gray-700 dark:text-gray-300">{error}</p>}
                </div>
            </div>
        );
    }

    // Tabs for investigation officer
    const allowedTabs = [
        "Home",
        "Evidence",
        "Add New Evidence",
        "Update Evidence"
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Navbar handleLogout={handleLogout} />

            <div className="flex flex-grow">
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    allowedTabs={allowedTabs}
                />

                <main className="flex-grow p-6 overflow-auto">
                    {/* {activeTab === "Home" && <HomeDashboard />} */}
                    {activeTab === "Evidence" && <EvidenceManagementPage />}
                    {activeTab === "Add New Evidence" && <RegisterEvidencePage />}
                    {activeTab === "Update Evidence" && < UpdateEvidencePage/>}
                </main>
            </div>
            <Footer />
        </div>
    );
}