import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BedProvider } from "@/context/BedContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JKC Bed Management System",
  description: "Sistem Manajemen Kasur Rumah Sakit - Jakarta Kidney Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} text-stone-950 bg-stone-100`}>
        <BedProvider>
          {children}
        </BedProvider>
      </body>
    </html>
  );
}
