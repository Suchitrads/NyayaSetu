"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import dynamic from "next/dynamic";
import Navbar from "../dashboard/navbar";
import Sidebar from "../dashboard/sidebar";
import Footer from "../dashboard/footer";

const HomePage = dynamic(() => import("./home"));
const IntegrityVerificationPage = dynamic(() => import("./integrity"));
const ImageUploaderPage = dynamic(() => import("./imaging"));
const AnalysisPage = dynamic(() => import("./analysis"));
const EvidenceManagement = dynamic(() => import("./evidence"));

export default function AnalystDashboard() {
    const [activeTab, setActiveTab] = useState("Home");
    const [isAuthorized, setIsAuthorized] = useState(true);
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
                decodedToken.role.toLowerCase().replace(/[\s_]/g, "") === "forensicanalyst"
            ) {
                setRole(decodedToken.role);
            } else {
                setIsAuthorized(false);
                router.push("/dashboard");
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

    // Tabs for forensic analyst
    const allowedTabs = [
        "Home",
        "Imaging",
        "Analysis",
        "Integrity Verification",
        "Evidence"
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
                    {activeTab === "Imaging" && <ImageUploaderPage />}
                    {activeTab === "Analysis" && <AnalysisPage />}
                    {activeTab === "Integrity Verification" && <IntegrityVerificationPage />}
                    {activeTab === "Evidence" && <EvidenceManagement />}
                </main>
            </div>

            <Footer />
        </div>
    );
}