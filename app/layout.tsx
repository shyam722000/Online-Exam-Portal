import "./globals.css";
import { Navbar } from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import Providers from "./Providers";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50"
        suppressHydrationWarning={true}>
         {/* <Navbar /> */}
             <Providers>
      <AuthGuard> {children}</AuthGuard> 
      </Providers>
      {/* {children} */}
      </body>
    </html>
  );
}
