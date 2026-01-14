import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "Dynamic Labs assignment",
  description: "Dynamic Labs assignment",
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
