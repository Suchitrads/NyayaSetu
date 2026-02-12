import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface NavbarProps {
    handleLogout: () => void;
}

export default function Navbar({ handleLogout }: NavbarProps) {
    const { theme, setTheme } = useTheme();

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-6 py-2 md:px-8 md:py-3 flex items-center justify-between shadow-sm">
            <Link href="/">
                <h1 className="text-xl md:text-2xl font-bold cursor-pointer">
                    <span className={`text-${theme === "dark" ? "yellow-500" : "black-500"}`}>Nyaya</span>
                    <span className={`text-${theme === "dark" ? "white-500" : "yellow-500"}`}>Setu</span>
                </h1>
            </Link>
            <div className="flex items-center space-x-4 md:space-x-6">
                <div className="flex items-center">
                    <Sun className={`w-4 h-4 md:w-5 md:h-5 ${theme === "dark" ? "text-gray-400" : "text-yellow-500"}`} />
                    <Switch
                        checked={theme === "dark"}
                        onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="mx-2 md:mx-3 cursor-pointer"
                    />
                    <Moon className={`w-4 h-4 md:w-5 md:h-5 ${theme === "dark" ? "text-yellow-500" : "text-gray-400"}`} />
                </div>
                <Button
                    variant="ghost"
                    className="text-white bg-yellow-500 border border-yellow-500 hover:text-yellow-500 dark:text-black dark:bg-white dark:border dark:border-white dark:hover:text-yellow-500 dark:hover:bg-transparent dark:hover:border-yellow-500 text-xs md:text-xs px-3 py-2 cursor-pointer"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5 md:w-3 md:h-3" />
                    <span className="hidden md:inline">Logout</span>
                </Button>
            </div>
        </nav>
    );
}