import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const APP_NAME = 'Pedi-AI';
const APP_DESCRIPTION = 'Cardápio digital para restaurantes modernos';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} - Cardápio Digital`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: ['cardápio digital', 'restaurante', 'gestão de restaurante', 'menu digital', 'pedi-ai'],
  authors: [{ name: 'PediAI' }],
  creator: 'PediAI',
  publisher: 'PediAI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} - Cardápio Digital`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PediAI - Cardápio Digital',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} - Cardápio Digital`,
    description: APP_DESCRIPTION,
    images: ['/og-image.png'],
    creator: '@pediai',
  },
  alternates: {
    canonical: APP_URL,
    languages: {
      'pt-BR': APP_URL,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Substituir com código real
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
