import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dharma Quest",
  description:
    "A welcoming introduction to Hindu philosophy, the Bhagavad Gita, and thoughtful daily practice, with optional Jyotisha exploration.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
