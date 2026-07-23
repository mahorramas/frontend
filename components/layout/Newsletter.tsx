"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail) {
            setStatus("error");
            setMessage("Escribe tu correo electrónico.");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            const response = await fetch("/api/newsletter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: cleanEmail }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "No se pudo guardar tu correo.");
            }

            setStatus("success");
            setMessage("Listo, te avisaremos cuando haya nuevas ofertas.");
            setEmail("");
        } catch (error) {
            setStatus("error");
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al suscribirte.",
            );
        }
    }

    return (
        <section className="bg-[#F4F4F5] py-12 border-b border-[#E4E4E7]">
            <div className="max-w-7xl mx-auto px-6 flex flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-[#1A1A1A]">
                        Recibe nuestras ofertas
                    </h2>
                    <p className="mt-2 text-sm font-medium text-[#626264]">
                        Suscríbete y sé el primero en enterarte de descuentos y nuevos modelos.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2 ">
                    <div className="flex w-full md:w-auto max-w-md gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="tu@correo.com"
                            className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-md px-4 py-2 text-sm text-[#1A1A1A] flex-1 outline-none focus:border-[#CE2C3C]"
                            disabled={status === "loading"}
                        />

                        <button
                            type="submit"
                            disabled={status === "loading"}
                            className="h-12 rounded-lg bg-[#CE2C3C] px-6 text-sm font-bold text-[#FAFAFA] transition hover:bg-[#A8202D] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {status === "loading" ? "Enviando..." : "Suscribirme"}
                        </button>
                    </div>

                    {message && (
                        <p
                            className={`text-sm font-medium ${status === "success" ? "text-green-600" : "text-[#CE2C3C]"
                                }`}
                        >
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </section>
    );
}