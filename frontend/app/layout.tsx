// app/layout.tsx
import type { Metadata } from "next";
import { AuthProvider } from "@/app/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axon Docs",
  description: "Adobe Hackathon 2025 App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-red-700">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
