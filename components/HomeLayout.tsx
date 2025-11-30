"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "./Navbar"; // if you want it here

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (!token) {
      // not logged in → go to login
      router.replace("/login");
    } else {
      setAllowed(true);
    }
  }, [router]);

  // while checking / redirecting, render nothing or loader
  if (!allowed) return null;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* <Navbar /> */}
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}
