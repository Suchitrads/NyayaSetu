"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import dynamic from "next/dynamic";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import Footer from "./footer";

const HomePage = dynamic(() => import("./home"));
const EvidencePage = dynamic(() => import("./evidence"));
const CasesPage = dynamic(() => import("./cases"));
const RegisterNewCasePage = dynamic(() => import("./new_case"));
const UpdateCasePage = dynamic(() => import("./update_case"));
const AddNewEvidencePage = dynamic(() => import("./new_evidence"));
const UpdateEvidencePage = dynamic(() => import("./update_evidence"));
const TrackEvidencePage = dynamic(() => import("./track_evidence"));
const IntegrityVerificationPage = dynamic(() => import("./integrity"));
const ImageUploaderPage = dynamic(() => import("./imaging"));
const AnalysisPage = dynamic(() => import("./analysis"));
const ReportPage = dynamic(() => import("./report"));
const UserManagementPage = dynamic(() => import("./user_management"));

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("Home");
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setIsAuthorized(false);
            router.push("/login?unauthorized=true");
            return;
        }

        try {
            const decodedToken: any = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp && decodedToken.exp < currentTime) {
                localStorage.removeItem("token");
                setIsAuthorized(false);
                router.push("/login?unauthorized=true");
            } else if (
                decodedToken.role &&
                decodedToken.role.toLowerCase() === "admin"
            ) {
                setRole("admin");
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
                router.push("/login?unauthorized=true");
            }
        } catch (error) {
            localStorage.removeItem("token");
            setIsAuthorized(false);
            router.push("/login?unauthorized=true");
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    if (!isAuthorized) {
        return null; // Return null while redirecting
    }

    // Only admin tabs
    const allowedTabs = [
        "Home",
        "User Management",
        "Case Management",
        "Register New Case",
        "Update Case",
        "Evidence",
        "Add New Evidence",
        "Update Evidence",
        "Track Evidence",
        "Integrity Verification",
        "Imaging",
        "Analysis",
        "ReportPage"
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
                    {activeTab === "Home" && <HomePage />}
                    {activeTab === "User Management" && <UserManagementPage />}
                    {activeTab === "Case Management" && <CasesPage />}
                    {activeTab === "Register New Case" && <RegisterNewCasePage />}
                    {activeTab === "Update Case" && <UpdateCasePage />}
                    {activeTab === "Evidence" && <EvidencePage />}
                    {activeTab === "Add New Evidence" && <AddNewEvidencePage />}
                    {activeTab === "Update Evidence" && <UpdateEvidencePage />}
                    {activeTab === "Track Evidence" && <TrackEvidencePage />}
                    {activeTab === "Integrity Verification" && <IntegrityVerificationPage />}
                    {activeTab === "Imaging" && <ImageUploaderPage />}
                    {activeTab === "Analysis" && <AnalysisPage />}
                    {activeTab === "ReportPage" && <ReportPage />}
                </main>
            </div>

            <Footer />
        </div>
    );
}