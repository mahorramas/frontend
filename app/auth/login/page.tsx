"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { sanitizeRedirectPath } from "@/lib/redirect";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const redirect = sanitizeRedirectPath(searchParams.get("redirect"));
    const [accountName, setAccountName] = useState("");
    const [accountEmail, setAccountEmail] = useState("");
    const [accountVerifiedPurchase, setAccountVerifiedPurchase] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const trimmedName = accountName.trim();
        const trimmedEmail = accountEmail.trim().toLowerCase();

        if (!trimmedName || !trimmedEmail) {
            setMessage("Ingresa tu nombre y correo para continuar.");
            setIsLoading(false);
            return;
        }

        const nextAccount = {
            id: crypto.randomUUID(),
            nombre: trimmedName,
            email: trimmedEmail,
            compraVerificada: accountVerifiedPurchase,
        };

        try {
            login(nextAccount);
            setMessage("¡Bienvenido! Redirigiendo...");
            setTimeout(() => {
                router.push(redirect);
            }, 500);
        } catch {
            setMessage("Ocurrió un error. Por favor intenta de nuevo.");
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#f5f5f6] to-[#e8e8e9] px-4 py-12">
            <div className="mx-auto w-full max-w-md">
                <div className="rounded-3xl border border-zinc-200 bg-white shadow-lg">
                    <div className="border-b border-zinc-100 bg-gradient-to-r from-[#d12d3d] to-[#b72432] px-6 py-8">
                        <h1 className="text-3xl font-black text-white">Ahorramás</h1>
                        <p className="mt-2 text-sm text-red-100">
                            Inicia sesión o crea tu cuenta para escribir reseñas
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 p-6">
                        <label className="block text-sm font-semibold text-zinc-700">
                            Nombre completo
                            <input
                                type="text"
                                value={accountName}
                                onChange={(event) => setAccountName(event.target.value)}
                                disabled={isLoading}
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#d12d3d] disabled:bg-zinc-50"
                                placeholder="Juan Pérez"
                            />
                        </label>

                        <label className="block text-sm font-semibold text-zinc-700">
                            Correo electrónico
                            <input
                                type="email"
                                value={accountEmail}
                                onChange={(event) => setAccountEmail(event.target.value)}
                                disabled={isLoading}
                                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#d12d3d] disabled:bg-zinc-50"
                                placeholder="tu@correo.com"
                            />
                        </label>

                        <label className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm font-semibold text-zinc-700">
                            <input
                                type="checkbox"
                                checked={accountVerifiedPurchase}
                                onChange={(event) => setAccountVerifiedPurchase(event.target.checked)}
                                disabled={isLoading}
                                className="h-4 w-4 rounded border-zinc-300 text-[#d12d3d] focus:ring-[#d12d3d] disabled:cursor-not-allowed"
                            />
                            <span>He comprado en Ahorramás</span>
                        </label>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-6 w-full rounded-lg bg-[#d12d3d] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#b72432] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? "Cargando..." : "Continuar"}
                        </button>

                        {message ? (
                            <p className={`mt-4 rounded-lg px-3 py-2 text-sm text-center font-semibold ${
                                message.includes("Bienvenido")
                                    ? "bg-emerald-100 text-emerald-700"
                                    : message.includes("error")
                                    ? "bg-red-100 text-red-700"
                                    : "bg-zinc-100 text-zinc-700"
                            }`}>
                                {message}
                            </p>
                        ) : null}

                        <div className="mt-6 text-center text-xs text-zinc-500">
                            <p>Al continuar, aceptas nuestros</p>
                            <div className="mt-1 space-x-1">
                                <Link href="#" className="text-[#d12d3d] hover:underline">
                                    Términos de servicio
                                </Link>
                                <span>y</span>
                                <Link href="#" className="text-[#d12d3d] hover:underline">
                                    Política de privacidad
                                </Link>
                            </div>
                        </div>
                    </form>

                    <div className="border-t border-zinc-100 bg-zinc-50 px-6 py-4 text-center text-xs text-zinc-600">
                        <Link href={redirect} className="font-semibold text-[#d12d3d] hover:underline">
                            ← Volver al producto
                        </Link>
                    </div>
                </div>

                <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="font-bold text-zinc-800">¿Por qué crear una cuenta?</h2>
                    <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                        <li className="flex gap-2">
                            <span className="text-[#d12d3d]">✓</span>
                            <span>Escribe reseñas y opiniones verificadas</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-[#d12d3d]">✓</span>
                            <span>Ayuda a otros clientes con tus experiencias</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-[#d12d3d]">✓</span>
                            <span>Recibe recomendaciones personalizadas</span>
                        </li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
