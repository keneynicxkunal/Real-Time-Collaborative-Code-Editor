import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeCollab - Real-time Collaborative Code Editor",
  description: "Professional collaborative code editor with Monaco Editor, real-time sync, and code execution capabilities.",
  keywords: ["CodeCollab", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "React", "Monaco Editor", "Collaborative Coding"],
  authors: [{ name: "CodeCollab Team" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "CodeCollab - Real-time Collaborative Code Editor",
    description: "Professional collaborative code editor with Monaco Editor, real-time sync, and code execution capabilities.",
    url: "https://chat.z.ai",
    siteName: "CodeCollab",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "CodeCollab Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeCollab - Real-time Collaborative Code Editor",
    description: "Professional collaborative code editor with Monaco Editor, real-time sync, and code execution capabilities.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
