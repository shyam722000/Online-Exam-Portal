"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

const PUBLIC_ROUTES = ["/login", "/signup"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (PUBLIC_ROUTES.includes(pathname)) {
      setChecked(true);
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  if (!checked) return null; // loading stage

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  return (
    <>
      {!isPublic && <Navbar />}
      {children}
    </>
  );
}
