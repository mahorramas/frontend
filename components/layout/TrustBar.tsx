import { Medal, Percent, PhoneCall, Truck } from "lucide-react";

export default function TrustBar() {
    return (
        <section className="bg-white border-t border-b border-[#E4E4E7] py-8">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-50 text-[#CE2C3C] rounded-lg"><Truck className="w-5 h-5" /></div>
                    <div><strong className="text-xs md:text-sm block">ENVÍO A DOMICILIO</strong><span className="text-[11px] md:text-xs text-[#626264]">A ciudades de Chiapas y Tabasco *</span></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-50 text-[#CE2C3C] rounded-lg"><PhoneCall className="w-5 h-5" /></div>
                    <div><strong className="text-xs md:text-sm block">CONTACTANOS</strong><span className="text-[11px] md:text-xs text-[#626264]">Soporte en línea directo</span></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-50 text-[#CE2C3C] rounded-lg"><Percent className="w-5 h-5" /></div>
                    <div><strong className="text-xs md:text-sm block">DESCUENTOS</strong><span className="text-[11px] md:text-xs text-[#626264]">En órdenes mayores a $10,000 [5, 12]</span></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="trust-icon bg-red-50 rounded-lg p-2.5 text-[#CE2C3C]">
                        <Medal className="w-5 h-5" />
                    </div>
                    <div className="trust-text">
                        <strong className="block text-sm font-semibold text-[#1A1A1A]">GARANTIA</strong>
                        <span className="text-[11px] md:text-xs text-[#626264]">6 meses por defecto de fábrica [12]</span>
                    </div>
                </div>
            </div>
        </section>
    )
}