"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var link_1 = require("next/link");
var lucide_react_1 = require("lucide-react");
var CartProvider_1 = require("@/components/providers/CartProvider");
var LocationProvider_1 = require("@/components/providers/LocationProvider");
function formatCurrency(value) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 2
    }).format(value);
}
function CartDrawer() {
    var _a = CartProvider_1.useCart(), items = _a.items, isOpen = _a.isOpen, closeCart = _a.closeCart, removeItem = _a.removeItem, updateQuantity = _a.updateQuantity, clearCart = _a.clearCart, totalItems = _a.totalItems, subtotal = _a.subtotal;
    var region = LocationProvider_1.useLocation().region;
    react_1.useEffect(function () {
        if (!isOpen)
            return;
        var originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        var handleKeyDown = function (event) {
            if (event.key === "Escape")
                closeCart();
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, closeCart]);
    var whatsappMessage = react_1.useMemo(function () {
        var lines = items.map(function (item) {
            return "\u2022 " + item.nombre + (item.baseTela ? " (Base: " + item.baseTela + ")" : "") + (item.frenteTela ? " (Frente: " + item.frenteTela + ")" : "") + " x" + item.cantidad + " = " + formatCurrency(item.precioOferta * item.cantidad);
        });
        return encodeURIComponent("Hola, quiero completar mi compra de los siguientes productos:\n\n" + lines.join("\n") + "\n\nSubtotal: " + formatCurrency(subtotal));
    }, [items, subtotal]);
    if (!isOpen)
        return null;
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "fixed inset-0 z-[60] bg-black/40", onClick: closeCart, "aria-hidden": "true" }),
        React.createElement("aside", { role: "dialog", "aria-modal": "true", "aria-label": "Carrito de compras", className: "fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-white shadow-2xl" },
            React.createElement("header", { className: "flex items-center justify-between border-b border-zinc-200 px-5 py-4" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.ShoppingCart, { className: "h-5 w-5 text-[#d12d3d]" }),
                    React.createElement("h2", { className: "text-lg font-black text-zinc-900" },
                        "Mi Carrito (",
                        totalItems,
                        " ",
                        totalItems === 1 ? "artículo" : "artículos",
                        ")")),
                React.createElement("button", { type: "button", onClick: closeCart, className: "rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-[#d12d3d]", "aria-label": "Cerrar carrito" },
                    React.createElement(lucide_react_1.X, { className: "h-5 w-5" }))),
            items.length === 0 ? (React.createElement("div", { className: "flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center" },
                React.createElement("div", { className: "grid h-20 w-20 place-items-center rounded-full bg-zinc-100" },
                    React.createElement(lucide_react_1.ShoppingCart, { className: "h-9 w-9 text-zinc-400" })),
                React.createElement("div", null,
                    React.createElement("p", { className: "text-lg font-extrabold text-zinc-800" }, "Tu carrito est\u00E1 vac\u00EDo"),
                    React.createElement("p", { className: "mt-1 text-sm text-zinc-500" }, "Agrega productos para empezar a armar tu pedido.")),
                React.createElement(link_1["default"], { href: "/", onClick: closeCart, className: "mt-2 rounded-lg bg-[#d12d3d] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#b72432]" }, "Explorar cat\u00E1logo"))) : (React.createElement(React.Fragment, null,
                React.createElement("ul", { className: "flex-1 divide-y divide-zinc-100 overflow-y-auto px-5" }, items.map(function (item) { return (React.createElement("li", { key: item.key, className: "flex gap-4 py-5" },
                    React.createElement(link_1["default"], { href: "/producto/" + item.productId + "?categoria=" + encodeURIComponent(item.categoria), onClick: closeCart, className: "block h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-[#f5f5f6]" }, item.imagen ? (React.createElement("img", { src: item.imagen, alt: item.nombre, className: "h-full w-full object-contain" })) : (React.createElement("span", { className: "grid h-full w-full place-items-center text-[10px] font-black text-zinc-400" }, "SIN IMAGEN"))),
                    React.createElement("div", { className: "min-w-0 flex-1" },
                        React.createElement("div", { className: "flex items-start justify-between gap-2" },
                            React.createElement("div", { className: "min-w-0" },
                                React.createElement("p", { className: "text-[10px] font-black uppercase tracking-wide text-zinc-400" }, item.categoria),
                                React.createElement(link_1["default"], { href: "/producto/" + item.productId + "?categoria=" + encodeURIComponent(item.categoria), onClick: closeCart, className: "line-clamp-2 text-sm font-extrabold text-zinc-800 transition hover:text-[#d12d3d]" }, item.nombre)),
                            React.createElement("button", { type: "button", onClick: function () { return removeItem(item.key); }, className: "rounded-md p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-[#d12d3d]", "aria-label": "Eliminar " + item.nombre },
                                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))),
                        (item.baseTela || item.frenteTela) && (React.createElement("p", { className: "mt-1 text-xs text-zinc-500" },
                            item.baseTela && React.createElement("span", null,
                                "Base: ",
                                React.createElement("strong", null, item.baseTela)),
                            item.baseTela && item.frenteTela && " · ",
                            item.frenteTela && React.createElement("span", null,
                                "Frente: ",
                                React.createElement("strong", null, item.frenteTela)))),
                        React.createElement("div", { className: "mt-2 flex items-center justify-between gap-3" },
                            React.createElement("div", { className: "flex h-8 items-center overflow-hidden rounded-md border border-zinc-200" },
                                React.createElement("button", { type: "button", onClick: function () { return updateQuantity(item.key, item.cantidad - 1); }, className: "grid h-full w-8 place-items-center text-zinc-600 transition hover:bg-zinc-100", "aria-label": "Restar cantidad" },
                                    React.createElement(lucide_react_1.Minus, { className: "h-3.5 w-3.5" })),
                                React.createElement("span", { className: "grid h-full min-w-8 place-items-center border-x border-zinc-200 text-sm font-bold" }, item.cantidad),
                                React.createElement("button", { type: "button", onClick: function () { return updateQuantity(item.key, item.cantidad + 1); }, className: "grid h-full w-8 place-items-center text-zinc-600 transition hover:bg-zinc-100", "aria-label": "Sumar cantidad" },
                                    React.createElement(lucide_react_1.Plus, { className: "h-3.5 w-3.5" }))),
                            React.createElement("div", { className: "text-right" },
                                item.precioLista > item.precioOferta && (React.createElement("div", { className: "text-xs font-semibold text-zinc-400 line-through" }, formatCurrency(item.precioLista * item.cantidad))),
                                React.createElement("div", { className: "text-base font-black text-[#d12d3d]" }, formatCurrency(item.precioOferta * item.cantidad))))))); })),
                React.createElement("footer", { className: "border-t border-zinc-200 bg-zinc-50 px-5 py-4" },
                    React.createElement("div", { className: "flex items-center justify-between text-sm font-semibold text-zinc-600" },
                        React.createElement("span", null,
                            "Subtotal (",
                            totalItems,
                            " ",
                            totalItems === 1 ? "artículo" : "artículos",
                            ")"),
                        React.createElement("span", { className: "text-xl font-black text-zinc-900" }, formatCurrency(subtotal))),
                    React.createElement("p", { className: "mt-1 text-xs text-zinc-400" }, region
                        ? "Precios calculados para tu zona: " + (region === "chiapas" ? "Chiapas" : region === "tabasco" ? "Tabasco" : "Tapachula") + "."
                        : "Ingresa tu Código Postal para ver precios de tu zona en el carrito."),
                    React.createElement("button", { type: "button", className: "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#20b857] px-5 text-base font-extrabold text-white shadow-sm transition hover:bg-[#149447]", onClick: function () {
                            window.open("https://api.whatsapp.com/send?phone=529632280432&text=" + whatsappMessage, "_blank");
                        } }, "Completar pedido por WhatsApp"),
                    React.createElement("button", { type: "button", onClick: clearCart, className: "mt-2 w-full py-2 text-center text-xs font-bold text-zinc-500 transition hover:text-[#d12d3d]" }, "Vaciar carrito")))))));
}
exports["default"] = CartDrawer;
