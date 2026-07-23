import Link from "next/link";

// Icono personalizado de Facebook (SVG directo de marca)
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);

// Icono personalizado de Instagram (SVG directo de marca)
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);

// Icono personalizado de WhatsApp (SVG directo de marca)
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

export default function Footer() {
    return (
        <>
            <footer className="bg-[#18181B] text-zinc-400 py-12 text-[13px] border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <div className="font-extrabold text-lg text-white mb-4">
                            <img src="/images/logo.png" alt="Mueblerías Ahorramás" className="h-12 w-auto object-contain" />
                        </div>
                        <p className="line-clamp-4 leading-relaxed mb-6">
                            La cadena de mueblerías número 1 en Chiapas y Tabasco. Calidad y elegancia a precios inigualables desde 2003.
                        </p>
                        <div className="flex gap-2">
                            <span className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center hover:bg-[#CE2C3C] hover:text-white cursor-pointer transition">
                                <FacebookIcon className="w-4 h-4" />
                            </span>
                            <span className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center hover:bg-[#CE2C3C] hover:text-white cursor-pointer transition">
                                <InstagramIcon className="w-4 h-4" />
                            </span>
                            {/* Se añade el icono de WhatsApp en el footer tal como en el mockup */}
                            <span className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center hover:bg-[#CE2C3C] hover:text-white cursor-pointer transition">
                                <WhatsAppIcon className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                    <div>
                        <h5 className="font-bold text-white mb-4">Categorías</h5>
                        <ul className="space-y-2">
                            <li><Link href="/salas" className="hover:text-white">Salas</Link></li>
                            <li><Link href="/recamaras" className="hover:text-white">Recámaras</Link></li>
                            <li><Link href="/comedores" className="hover:text-white">Comedores</Link></li>
                            <li><Link href="/tv" className="hover:text-white">Muebles TV</Link></li>
                            <li><Link href="/colchones" className="hover:text-white">Colchones</Link></li>
                            <li><Link href="/otrosMuebles" className="hover:text-white">Otros muebles</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-white mb-4">Empresa</h5>
                        <ul className="space-y-2">
                            <li><Link href="/nosotros" className="hover:text-white">Sobre nosotros</Link></li>
                            <li><Link href="/sucursales" className="hover:text-white">Sucursales</Link></li>
                            <li><Link href="/privacidad" className="hover:text-white">Política de privacidad</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-white mb-4">Contacto</h5>
                        <p className="mb-2">📞 9632684589</p>
                        <p className="mb-2">📍 Las Margaritas, Chiapas, México</p>
                        <p>✉️ info@muebleriasahorramas.com.mx</p>
                    </div>
                </div>
            </footer>
            {/* COPYRIGHT */}
            <div className="bg-[#0F0F10] text-[11px] text-zinc-600 py-4 text-left px-6">
                Copyright © 2003 Mueblerías Ahorra Mas. Todos los derechos reservados.
            </div>
        </>
    );
}