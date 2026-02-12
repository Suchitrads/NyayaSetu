import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

export default function Header() {
    const { theme, setTheme } = useTheme();

    return (
        <header className="w-full max-w-6xl flex justify-between items-center py-4">
            <Link href="/">
                <h1 className="text-3xl font-bold cursor-pointer">
                    <span className={`text-${theme === "dark" ? "yellow-500" : "black-500"}`}>Nyaya</span>
                    <span className={`text-${theme === "dark" ? "white-500" : "yellow-500"}`}>Setu</span>
                </h1>
            </Link>
            <div className="flex items-center">
                <Sun className={`w-6 h-6 ${theme === "dark" ? "text-gray-400" : "text-yellow-500"}`} />
                <Switch
                    checked={theme === "dark"}
                    onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="mx-2 cursor-pointer"
                />
                <Moon className={`w-6 h-6 ${theme === "dark" ? "text-yellow-500" : "text-gray-400"}`} />
            </div>
        </header>
    );
}