import { Suspense } from "react";
import type { Metadata } from "next";
import TopPromoBar from "@/components/layout/TopPromoBar";
import Navbar from "@/components/layout/Navbar";
import TrustBar from "@/components/layout/TrustBar";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import { LocationProvider } from "@/components/providers/LocationProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import "../styles/tailwind.css";
import "../styles/index.css";


export const metadata: Metadata = {
  title: {
    default: 'Mueblerias Ahorramas - Modern Furniture Store',
    template: 'Mueblerias Ahorramas - Modern Furniture Store | %s',
  },
  description: 'Discover premium furniture for every room in your home at Mueblerias Ahorramas. Shop living rooms, bedrooms, dining rooms, and TV furniture with exclusive discounts up to 40% off. Free shipping on select items and factory-direct pricing with quality guarantee.',
  keywords: 'furniture store, modern furniture, living room furniture, bedroom furniture, dining room furniture, salas, recámaras, comedores, home decor, furniture sale, discount furniture, quality furniture',

  openGraph: {
    type: 'website',
    title: {
      default: 'Mueblerias Ahorramas - Modern Furniture Store',
      template: 'Mueblerias Ahorramas - Modern Furniture Store | %s',
    },
    description: 'Shop premium furniture with up to 40% off store-wide! Quality living room, bedroom, and dining furniture with factory-direct pricing, free shipping, and satisfaction guarantee. Transform your home today!',
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
      data-scroll-behavior="smooth"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
<Suspense fallback={<div>Cargando...</div>}>
          <AuthProvider>
            <CartProvider>
              <LocationProvider>
                <TopPromoBar />
                <Navbar />

                {children}

                <CartDrawer />
                <TrustBar />
                <Newsletter />
                <Footer />
              </LocationProvider>
            </CartProvider>
          </AuthProvider>
</Suspense>
      </body>
    </html>
  );
}
