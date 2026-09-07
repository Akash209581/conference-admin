import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Portal - Multi-Conference Management",
  description: "Super Admin Dashboard for real-time conference management."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased flex font-sans">
        {children}
      </body>
    </html>
  );
}
