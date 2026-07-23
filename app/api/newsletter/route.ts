import { NextResponse } from "next/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL;

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Correo electrónico inválido." },
        { status: 400 },
      );
    }

    const findResponse = await fetch(
      `${STRAPI_URL}/api/suscriptores?filters[email][$eq]=${encodeURIComponent(email)}`,
      {
        headers: STRAPI_API_TOKEN
          ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
          : {},
        cache: "no-store",
      },
    );

    if (findResponse.ok) {
      const found = await findResponse.json();

      if (found.data?.length > 0) {
        return NextResponse.json(
          { message: "Este correo ya está suscrito." },
          { status: 409 },
        );
      }
    }

    const createResponse = await fetch(`${STRAPI_URL}/api/suscriptores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(STRAPI_API_TOKEN
          ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        data: {
          email,
        },
      }),
    });

    if (!createResponse.ok) {
      return NextResponse.json(
        { message: "No se pudo guardar la suscripción." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Suscripción guardada correctamente.",
    });
  } catch {
    return NextResponse.json(
      { message: "Ocurrió un error inesperado." },
      { status: 500 },
    );
  }
}
