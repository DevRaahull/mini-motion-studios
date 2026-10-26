import type { Metadata } from "next";
import { Inter, Cinzel, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mini-motion-studios.vercel.app"),
  title: "Mini Motion Studios — AI Creative Studio & Cinematic Universe",
  description: "Mini Motion Studios by Rahul Soni. Exploring the power of AI to tell emotionally powerful stories, cinematic anime visuals, and dark psychology narratives.",
  authors: [{ name: "Rahul Soni" }],
  openGraph: {
    title: "Mini Motion Studios — Stories Beyond Imagination",
    description: "AI-powered cinematic visuals, anime storytelling, and dark psychology narratives by Rahul Soni.",
    images: ["/assets/cinematic_banner.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cinzel.variable} ${jetbrainsMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
