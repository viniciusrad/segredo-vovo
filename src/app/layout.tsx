'use client';

import { ThemeProvider, createTheme } from '@mui/material';
import { Header } from '@/components/Header';
import { AuthProvider } from '@/contexts/AuthContext';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { LoadingOverlay } from "@/components/LoadingOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const theme = createTheme({
  typography: {
    fontFamily: geistSans.style.fontFamily,
  },
  palette: {
    primary: {
      main: '#2196F3',
      light: '#21CBF3',
      dark: '#1976D2',
    },
    secondary: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <LoadingProvider>
              <LoadingOverlay />
              <Header />
              {children}
            </LoadingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
