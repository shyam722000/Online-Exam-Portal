"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "@/public/logodark.png";

export function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.replace("/login");
  };

  return (
    <header className="w-full bg-white shadow-md">
      <div className="relative mx-auto max-w-6xl flex items-center justify-center py-3 px-4">

        {/* Logo Centered */}
        <div
          className="absolute left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="relative w-[130px] h-[45px] sm:w-[150px] sm:h-[50px]">
            <Image
              src={logo}
              alt="NexLearn Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Desktop Logout */}
        <button
          onClick={handleLogout}
          className="hidden sm:block ml-auto px-4 py-2 rounded-md text-white text-sm font-medium cursor-pointer"
          style={{ backgroundColor: "#177A9C" }}
        >
          Logout
        </button>

        {/* Mobile Logout Icon */}
        <button
          onClick={handleLogout}
          className="sm:hidden ml-auto p-2 rounded-md text-white cursor-pointer"
          style={{ backgroundColor: "#177A9C" }}
          aria-label="Logout"
        >
          <span className="font-bold text-lg">⎋</span>

        </button>

      </div>
    </header>
  );
}
