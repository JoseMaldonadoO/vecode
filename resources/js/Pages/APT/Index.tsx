import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Printer,
    UserPlus,
    Search,
    Ship,
    Anchor,
    Scan,
    LayoutDashboard,
    Database,
    Truck,
} from "lucide-react";

export default function Index({ auth }: { auth: any }) {
    const menuItems = [
        {
            name: "Escanear Entrada",
            icon: Scan,
            href: route("apt.scanner"),
            description: "Escanear código QR para registrar entrada/salida.",
            color: "bg-purple-50 text-purple-600",
            hover: "hover:border-purple-500",
        },
        {
            name: "Status APT",
            icon: LayoutDashboard,
            href: route("apt.status"),
            description: "Visualizar ocupación de almacenes y cubículos.",
            color: "bg-indigo-50 text-indigo-600",
            hover: "hover:border-indigo-500",
        },
        {
            name: "Gestión de Lotes",
            icon: Database,
            href: route("apt.lots.index"),
            description: "Administración de lotes e inventarios.",
            color: "bg-teal-50 text-teal-600",
            hover: "hover:border-teal-500",
        },
        {
            name: "Status Unidades",
            icon: Truck,
            href: route("apt.unit-status"),
            description: "Unidades en planta esperando destare.",
            color: "bg-blue-50 text-blue-600",
            hover: "hover:border-blue-500",
        },
        {
            name: "Seguimiento de OE",
            icon: Search,
            href: route("apt.oe-tracker", { module: "apt" }),
            description: "Listado global de órdenes y embarques.",
            color: "bg-amber-50 text-amber-600",
            hover: "hover:border-amber-500",
        },
    ];

    return (
        <DashboardLayout user={auth.user} header="Administración Portuaria">
            <Head title="APT" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className={`group bg-white rounded-xl shadow-md border-2 border-transparent p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-xl ${item.color.includes("indigo") ? "hover:border-indigo-500" : item.color.includes("purple") ? "hover:border-purple-500" : "hover:border-blue-500"}`}
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
