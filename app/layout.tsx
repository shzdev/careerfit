import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerFit AI",
  description: "Find your best-fit IT career role from your current technical skills."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

