import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Llama Herd Studio",
  description: "Visual studio for multi-agent workflow debugging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
