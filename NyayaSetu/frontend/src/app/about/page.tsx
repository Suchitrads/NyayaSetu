"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "@/components/custom/header";
import Footer from "@/components/custom/footer";
import { useTheme } from "next-themes";
import Image from "next/image";
import AboutImage from "@/assets/about.svg";

export default function AboutPage() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-6">
            <Header />
            <main className="flex flex-col items-center text-center mt-16 mb-16">
                <div className="flex flex-col-reverse md:flex-row items-center justify-center w-full max-w-8xl">
                    <div className="md:w-1/2 text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            <span className="text-yellow-500">About Us</span> -
                            <span className="text-gray-900 dark:text-gray-100"> Young Minds, Secure Solutions</span>
                        </h2>
                        <p className="mt-6 text-base md:text-lg max-w-2xl mx-auto md:mx-0 text-gray-700 dark:text-gray-300">
                            We are a team of passionate masters students exploring the intersection of digital forensics and blockchain.
                            Our mission is to build transparent, tamper-proof solutions that enhance trust and security in evidence management.
                        </p>
                        <div className="mt-8 flex justify-center md:justify-start space-x-6">
                            <Link href="/landing">
                                <Button className="px-6 py-3 md:px-8 md:py-4 text-lg md:text-xl bg-transparent border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white cursor-pointer">Home</Button>
                            </Link>
                            <Link href="/login">
                                <Button className="px-6 py-3 md:px-8 md:py-4 text-lg md:text-xl bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer">Login</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="mb-10 md:mb-0 md:w-1/2 flex justify-center md:justify-end">
                        <Image src={AboutImage} alt="Our Team" layout="responsive" className="w-full h-auto" />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
