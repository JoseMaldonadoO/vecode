import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Box,
    ShieldCheck,
    ArrowRight,
} from "lucide-react";

export default function Index({ auth }: { auth: any }) {
    const menuItems = [
        {
            name: "Gestión Pesos Burreo",
            icon: ShieldCheck,
            href: route("traffic.burreo.index"),
            description: "Administrar pesos provisionales y de calado.",
            color: "from-indigo-600 to-indigo-800",
            lightColor: "bg-indigo-50 text-indigo-600",
            shadow: "shadow-indigo-200",
        },
        {
            name: "Productos",
            icon: Box,
            href: route("traffic.products.index"),
            description: "Alta y lista de productos.",
            color: "from-amber-500 to-amber-700",
            lightColor: "bg-amber-50 text-amber-600",
            shadow: "shadow-amber-200",
        },
    ];

    return (
        <DashboardLayout user={auth.user} header="Tráfico y Logística">
            <Head title="Tráfico y Logística" />

            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="group relative bg-white rounded-[2.5rem] p-1 shadow-2xl transition-all duration-500 hover:-translate-y-2"
                        >
                            {/* Borde dinámico con gradiente */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-[2.5rem] opacity-0 group-hover:opacity-10 scale-[1.02] transition-all duration-500`} />

                            <div className="relative bg-white rounded-[2.4rem] p-8 md:p-10 flex flex-col items-center text-center h-full border border-gray-100">
                                {/* Contenedor de Icono Premium */}
                                <div className={`w-24 h-24 rounded-3xl ${item.lightColor} flex items-center justify-center mb-8 shadow-inner relative overflow-hidden group-hover:rotate-12 transition-transform duration-500`}>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                                    <item.icon className="w-12 h-12 relative z-10" />
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4 group-hover:text-indigo-900 transition-colors">
                                    {item.name}
                                </h3>

                                <p className="text-gray-500 font-medium leading-relaxed max-w-xs mb-8">
                                    {item.description}
                                </p>

                                {/* Botón de acción integrado */}
                                <div className={`mt-auto inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r ${item.color} text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg ${item.shadow} group-hover:px-12 transition-all duration-500`}>
                                    Acceder
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
