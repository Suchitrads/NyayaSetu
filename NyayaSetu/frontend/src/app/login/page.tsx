"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Header from "@/components/custom/header";
import Footer from "@/components/custom/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShieldCheck, KeyRound, Wallet, ArrowLeft } from "lucide-react";
import { getAddress } from "ethers";
import detectEthereumProvider from '@metamask/detect-provider';
import Image from "next/image";
import loginImage from "@/assets/login.svg";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [aadhaar, setAadhaar] = useState("");
    const [error, setError] = useState("");
    const [account, setAccount] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        setAadhaar(formattedValue);
        setError(e.target.value !== formattedValue ? "Only numbers are allowed" : "");
    };

    const connectMetaMask = async () => {
        if (account) {
            handleLogout();
            return;
        }
        if (isConnecting) return;
        setIsConnecting(true);

        const provider: any = await detectEthereumProvider();
        if (provider) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                if (accounts.length > 0) {
                    const checksumAddress = getAddress(accounts[0]);
                    setAccount(checksumAddress);
                } else {
                    setError("No accounts found. Please try again.");
                }
            } catch (error: any) {
                if (error.code === 401) {
                    setError("Connection request denied. Please accept the request in MetaMask.");
                } else {
                    setError("Failed to connect. Please try again.");
                }
            }
        } else {
            setError("MetaMask is not installed. Please install MetaMask and try again.");
        }
        setIsConnecting(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const aadhaarNumber = aadhaar.replace(/\s/g, "");

        if (aadhaarNumber.length !== 12 || !account) {
            setError("Invalid Aadhaar number or Wallet not connected");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ aadhaar: aadhaarNumber, wallet: account }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Login failed");

            localStorage.setItem("token", data.token);
            toast.success("Logged in successfully!");

            // Normalize role for comparison
            const normalizedRole = data.role?.toLowerCase().replace(/[\s_]/g, "");

            // Role-based dashboard redirection
            let dashboardPath = "/dashboard";
            switch (normalizedRole) {
                case "investigatingofficer":
                    dashboardPath = "/IO_dashboard";
                    break;
                case "forensicanalyst":
                    dashboardPath = "/Analyst_dashboard";
                    break;
                case "collector":
                    dashboardPath = "/collector_dashboard";
                    break;
                case "admin":
                    dashboardPath = "/dashboard";
                    break;
                default:
                    setError("Unauthorized role. Access denied.");
                    localStorage.removeItem("token");
                    setLoading(false);
                    return;
            }

            setTimeout(() => {
                router.push(dashboardPath);
            }, 2000);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setAccount(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-6">
            <Header />
            <ToastContainer />
            <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl h-full mt-10 md:mt-16">
                <div className="hidden md:flex md:w-1/2 justify-center md:justify-start h-full">
                    <Image src={loginImage} alt="Login" layout="responsive" className="w-full h-auto max-h-full" />
                </div>
                <div className="w-full md:w-1/2 flex items-center justify-center h-full">
                    <Card className="container mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mt-12 md:mt-0">
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2">
                                <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" /> Secure Login
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-center space-y-4">
                            <form onSubmit={handleLogin} className="w-full">
                                <div className="mb-4">
                                    <Label className="py-2 text-sm md:text-base" htmlFor="aadhaar">Aadhaar Number</Label>
                                    <div className="relative">
                                        <Input type="text" id="aadhaar" value={aadhaar} onChange={handleChange} maxLength={14} placeholder="XXXX XXXX XXXX" className="w-full px-4 py-2 text-base md:text-lg border border-yellow-300 rounded-md focus:ring-yellow-500 pl-10" />
                                        <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 dark:text-yellow-400 w-5 h-5" />
                                    </div>
                                </div>
                                {account && <p className="text-center text-gray-700 dark:text-gray-300 text-sm">Connected Wallet: {account.substring(0, 6)}...{account.slice(-4)}</p>}
                                <Button onClick={connectMetaMask} type="button" className="w-full px-6 py-3 text-base cursor-pointer bg-yellow-500 text-white hover:bg-yellow-600 mb-4 flex items-center justify-center gap-2">
                                    <Wallet className="w-5 h-5" /> {account ? "Logout" : "Connect MetaMask"}
                                </Button>
                                <Button type="submit" className="w-full px-6 py-3 text-lg bg-yellow-500 text-white hover:bg-yellow-600 flex items-center justify-center gap-2 cursor-pointer" disabled={loading}>
                                    <ShieldCheck className="w-5 h-5" /> {loading ? "Logging in..." : "Login"}
                                </Button>
                            </form>
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            <div className="mt-4 text-center">
                                <Link href="/" className="text-yellow-500 hover:underline flex items-center justify-center gap-1">
                                    <ArrowLeft className="w-5 h-5" /> Back to Home
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    );
}