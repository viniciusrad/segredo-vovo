'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Header } from '@/components/Header';
import { AuthProvider } from '@/contexts/AuthContext';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { CarrinhoProvider } from '@/contexts/CarrinhoContext';

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
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
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
          <LoadingProvider>
            <AuthProvider>
              <CarrinhoProvider>
                <LoadingOverlay />
                <Header />
                {children}
              </CarrinhoProvider>
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
