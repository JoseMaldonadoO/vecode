import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { FileText, Anchor } from "lucide-react";

export default function Index({ auth }: { auth: any }) {
    const menuItems = [
        {
            name: "Nueva Orden de Embarque",
            icon: FileText,
            href: route("documentation.create"),
            description: "Crear una nueva orden de embarque.",
            color: "bg-indigo-50 text-indigo-600",
            hover: "hover:border-indigo-500",
        },
        {
            name: "Descarga de Barco",
            icon: Anchor,
            href: route("documentation.dock"),
            description: "Gestión de operadores y códigos QR.",
            color: "bg-amber-50 text-amber-600",
            hover: "hover:border-amber-500",
        },
        {
            name: "Reportes OB",
            icon: FileText,
            href: route("documentation.orders.index"),
            description: "Ver historial de descargas (Báscula/Burreo).",
            color: "bg-emerald-50 text-emerald-600",
            hover: "hover:border-emerald-500",
        },
        {
            name: "Gestion Operadores Salida",
            icon: Anchor, // or another icon like Users
            href: route("documentation.exit-operators.index"),
            description: "Registro de operadores de salida, lista de operadores y qr de operadores.",
            color: "bg-indigo-50 text-indigo-600",
            hover: "hover:border-indigo-500",
        },
    ];

    return (
        <DashboardLayout user={auth.user} header="Documentación y Embarques">
            <Head title="Documentación" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className={`group bg-white rounded-xl shadow-md border-2 border-transparent p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-xl ${item.color.includes("indigo") ? "hover:border-indigo-500" : "hover:border-amber-500"}`}
                            >
                                <div
                                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform transform group-hover:scale-110 ${item.color}`}
                                >
                                    <item.icon className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 break-words w-full">
                                    {item.name}
                                </h3>
                                <p className="text-gray-500 mt-2 text-sm">
                                    {item.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
