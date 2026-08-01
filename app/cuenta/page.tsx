"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { LogOut, Mail, CheckCircle, XCircle, Edit2 } from "lucide-react";

export default function AccountPage() {
    const router = useRouter();
    const { user, logout, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.nombre || "");
    const [editEmail, setEditEmail] = useState(user?.email || "");
    const [editVerified, setEditVerified] = useState(user?.compraVerificada || false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push("/auth/login?redirect=/cuenta");
        }
    }, [user, router]);

    if (!user) {
        return (
            <main className="min-h-screen bg-[#f5f5f6] px-4 py-12 text-center">
                <p className="text-zinc-500">Cargando...</p>
            </main>
        );
    }

    const handleSaveChanges = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const trimmedName = editName.trim();
        const trimmedEmail = editEmail.trim().toLowerCase();

        if (!trimmedName || !trimmedEmail) {
            setMessage("Ingresa tu nombre y correo para continuar.");
            setIsLoading(false);
            return;
        }

        try {
            updateUser({
                nombre: trimmedName,
                email: trimmedEmail,
                compraVerificada: editVerified,
            });
            setMessage("Cambios guardados correctamente.");
            setIsEditing(false);
            setIsLoading(false);
        } catch {
            setMessage("Ocurrió un error al guardar los cambios.");
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <main className="min-h-screen bg-[#f5f5f6] px-4 py-12">
            <div className="mx-auto max-w-2xl">
                <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-lg">
                    <div className="border-b border-zinc-100 bg-gradient-to-r from-[#d12d3d] to-[#b72432] px-6 py-8">
                        <h1 className="text-3xl font-black text-white">Mi Cuenta</h1>
                        <p className="mt-2 text-sm text-red-100">
                            Gestiona tu perfil y tu historial de compras
                        </p>
                    </div>

                    <div className="p-6 md:p-8">
                        {!isEditing ? (
                            <div className="space-y-6">
                                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h2 className="text-sm font-black uppercase tracking-wide text-zinc-800">
                                                Información Personal
                                            </h2>

                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-600">
                                                        Nombre
                                                    </p>
                                                    <p className="mt-1 text-base font-semibold text-zinc-900">
                                                        {user.nombre}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-600">
                                                        Correo Electrónico
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-zinc-500" />
                                                        <p className="text-base font-semibold text-zinc-900">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-600">
                                                        Estado de Compra
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        {user.compraVerificada ? (
                                                            <>
                                                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                                                                    Compra Verificada
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-5 w-5 text-zinc-400" />
                                                                <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-bold text-zinc-700">
                                                                    Compra No Verificada
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(true);
                                                setEditName(user.nombre);
                                                setEditEmail(user.email);
                                                setEditVerified(user.compraVerificada);
                                                setMessage("");
                                            }}
                                            className="rounded-lg bg-[#d12d3d] p-3 text-white transition hover:bg-[#b72432]"
                                            title="Editar perfil"
                                        >
                                            <Edit2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Link
                                        href="/producto/1"
                                        className="block rounded-lg border border-zinc-200 bg-white px-6 py-3 text-center font-semibold text-zinc-800 transition hover:bg-zinc-50"
                                    >
                                        Ver mis Reseñas
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-50 px-6 py-3 font-semibold text-red-700 transition hover:bg-red-100"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSaveChanges} className="space-y-4">
                                <label className="block text-sm font-semibold text-zinc-700">
                                    Nombre Completo
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(event) => setEditName(event.target.value)}
                                        disabled={isLoading}
                                        className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#d12d3d] disabled:bg-zinc-50"
                                    />
                                </label>

                                <label className="block text-sm font-semibold text-zinc-700">
                                    Correo Electrónico
                                    <input
                                        type="email"
                                        value={editEmail}
                                        onChange={(event) => setEditEmail(event.target.value)}
                                        disabled={isLoading}
                                        className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#d12d3d] disabled:bg-zinc-50"
                                    />
                                </label>

                                <label className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm font-semibold text-zinc-700">
                                    <input
                                        type="checkbox"
                                        checked={editVerified}
                                        onChange={(event) => setEditVerified(event.target.checked)}
                                        disabled={isLoading}
                                        className="h-4 w-4 rounded border-zinc-300 text-[#d12d3d] focus:ring-[#d12d3d] disabled:cursor-not-allowed"
                                    />
                                    <span>He comprado en Ahorramás</span>
                                </label>

                                {message && (
                                    <p
                                        className={`mt-4 rounded-lg px-3 py-2 text-sm text-center font-semibold ${
                                            message.includes("correctamente")
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {message}
                                    </p>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 rounded-lg bg-[#d12d3d] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#b72432] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isLoading ? "Guardando..." : "Guardar Cambios"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        disabled={isLoading}
                                        className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-extrabold text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
