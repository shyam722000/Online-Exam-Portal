"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import logo from "@/public/logodark.png";

export function Navbar() {
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    if (storedName) setUserName(storedName);
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_name");
    alert("You have been logged out successfully.");
    router.replace("/login");
  };

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl w-full px-3 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3 md:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
          
          {/* LEFT — User info */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink">
            {userName && (
              <>
              <span
                  className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-slate-100 border border-slate-300 text-xs sm:text-sm md:text-base text-slate-600 flex-shrink-0"
                  aria-label="User"
                >
                  👤
                </span>
                
                <span className="hidden xs:inline font-semibold text-xs sm:text-sm md:text-base text-slate-800 truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">
                  {userName}
                </span>
                                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500 animate-blink flex-shrink-0" />

                
                
              </>
            )}
          </div>

          <div className="flex justify-center flex-grow">
            <div
              className="cursor-pointer"
              onClick={() => router.push("/")}
            >
              <div className="relative w-[100px] h-[32px] xs:w-[120px] xs:h-[38px] sm:w-[140px] sm:h-[45px] md:w-[160px] md:h-[52px] lg:w-[180px] lg:h-[58px]">
                <Image
                  src={logo}
                  alt="NexLearn Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end flex-shrink-0">
            <button
              onClick={handleLogout}
              className="hidden sm:inline-block px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-md text-white text-xs sm:text-sm md:text-base font-medium cursor-pointer hover:opacity-90 active:opacity-80 transition-opacity"
              style={{ backgroundColor: "#177A9C" }}
            >
              Logout
            </button>

            {/* Mobile Logout Icon */}
            <button
              onClick={handleLogout}
              className="sm:hidden p-1.5 xs:p-2 rounded-md text-white cursor-pointer hover:opacity-90 active:opacity-80 transition-opacity"
              style={{ backgroundColor: "#177A9C" }}
              aria-label="Logout"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-4 h-4 xs:w-5 xs:h-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        
        /* Extra small breakpoint for very small devices */
        @media (min-width: 375px) {
          .xs\:inline {
            display: inline;
          }
          .xs\:w-5 {
            width: 1.25rem;
          }
          .xs\:h-5 {
            height: 1.25rem;
          }
          .xs\:w-\[120px\] {
            width: 120px;
          }
          .xs\:h-\[38px\] {
            height: 38px;
          }
          .xs\:p-2 {
            padding: 0.5rem;
          }
        }
      `}</style>
    </header>
  );
}