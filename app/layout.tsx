import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowWorks - AI-Powered n8n Workflow Generator",
  description:
    "Transform natural language prompts into valid n8n workflow JSON with AI magic",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-sorcery-dark text-white">{children}</body>
    </html>
  );
}
