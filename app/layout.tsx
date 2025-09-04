import { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
// import { Roboto_Mono } from "next/font/google";
import ColorStyles from "@/components/shared/color-styles/color-styles";
import Scrollbar from "@/components/ui/scrollbar";
import "styles/main.css";

// const robotoMono = Roboto_Mono({
//   subsets: ["latin"],
//   weight: ["400", "500"],
//   variable: "--font-roboto-mono",
// });

export const metadata: Metadata = {
  title: "Is Your Website AI Ready?",
  description: "UI components and design system for Firecrawl",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorStyles />
      </head>
      <body
        className={`${GeistMono.variable} font-sans text-accent-black bg-background-base overflow-x-clip`}
      >
        <main className="overflow-x-clip">{children}</main>
        <Scrollbar />
      </body>
    </html>
  );
}