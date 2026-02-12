import React from "react";
import { useState } from "react";
import { Home, BriefcaseBusiness, FilePlus, ClipboardPen, NotebookPen, SquarePlus, SquarePen, ScanSearch, Hash, Images, ScanEye, FileChartColumnIncreasing, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    allowedTabs: string[];
}

const tabConfig: { [key: string]: { icon: React.ReactNode; label: string } } = {
    "Home": { icon: <Home className="w-5 h-5" />, label: "Home" },
    "User Management": { icon: <FileChartColumnIncreasing className="w-5 h-5" />, label: "User Management" },
    "Case Management": { icon: <BriefcaseBusiness className="w-5 h-5" />, label: "Case Management" },
    "Register New Case": { icon: <FilePlus className="w-5 h-5" />, label: "Register New Case" },
    "Update Case": { icon: <ClipboardPen className="w-5 h-5" />, label: "Update Case" },
    "Evidence": { icon: <NotebookPen className="w-5 h-5" />, label: "Evidence Management" },
    "Add New Evidence": { icon: <SquarePlus className="w-5 h-5" />, label: "Add Evidence" },
    "Update Evidence": { icon: <SquarePen className="w-5 h-5" />, label: "Update Evidence" },
    "Track Evidence": { icon: <ScanSearch className="w-5 h-5" />, label: "Track Evidence" },
    "Integrity Verification": { icon: <Hash className="w-5 h-5" />, label: "Integrity Verification" },
    "Imaging": { icon: <Images className="w-5 h-5" />, label: "Imaging" },
    "Analysis": { icon: <ScanEye className="w-5 h-5" />, label: "Analysis" },
    "ReportPage": { icon: <FileChartColumnIncreasing className="w-5 h-5" />, label: "Report" },
};

export default function Sidebar({ activeTab, setActiveTab, allowedTabs }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                className="md:hidden flex items-center justify-center p-2 cursor-pointer"
                onClick={toggleSidebar}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>

            <aside
                className={`absolute md:relative top-0 left-0 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 p-4 space-y-4 z-40 md:z-auto`}
            >
                {allowedTabs.map(tab => (
                    <Button
                        key={tab}
                        variant="ghost"
                        className={`w-full flex justify-start gap-3 cursor-pointer ${activeTab === tab
                            ? "text-white bg-yellow-500 dark:bg-gray-700 dark:text-yellow-500 hover:bg-yellow-500 hover:text-white dark:hover:bg-gray-700"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                        onClick={() => {
                            setActiveTab(tab);
                            setIsOpen(false);
                        }}
                    >
                        {tabConfig[tab]?.icon}
                        {tabConfig[tab]?.label || tab}
                    </Button>
                ))}
            </aside>

            {isOpen && (
                <div
                    className="fixed inset-0 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}