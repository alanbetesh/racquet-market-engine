import type { Metadata } from "next";
import "@/app/globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Racquet Market Engine",
  description: "Live tennis racquet market analytics and flip viability diagnostics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        suppressHydrationWarning
        className="bg-background text-textPrimary antialiased selection:bg-neutral-800"
      >
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}