import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Flavor Haven | Dine & Experience",
  description: "Experience the perfect blend of taste and ambiance. From freshly prepared dishes to a cozy atmosphere, we serve happiness on every plate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-slate-900">
        <AuthProvider>
          <CartProvider>
            <AppProvider>
              {children}
            </AppProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
