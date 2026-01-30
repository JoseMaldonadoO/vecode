import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import {
    FileText,
    ClipboardCheck,
    UserX,
    LogOut,
    BarChart,
    AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import Modal from "@/Components/Modal";

export default function Index({ auth }: { auth: any }) {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertAction, setAlertAction] = useState("");

    const menuItems = [
        {
            name: "Registro",
            icon: FileText,
            color: "bg-indigo-50 text-indigo-600",
            description: "Registro de entrada y control.",
        },
        {
            name: "Estatus de checklist",
            icon: ClipboardCheck,
            color: "bg-blue-50 text-blue-600",
            description: "Verificar estado de revisiones.",
        },
        {
            name: "Vetar operador",
            icon: UserX,
            color: "bg-red-50 text-red-600",
            description: "Restringir acceso a operadores.",
        },
        {
            name: "Salida de unidades",
            icon: LogOut,
            color: "bg-orange-50 text-orange-600",
            description: "Registrar salida de planta.",
        },
        {
            name: "Reporte de salidas",
            icon: BarChart,
            color: "bg-emerald-50 text-emerald-600",
            description: "Historial de movimientos.",
        },
    ];

    const handleItemClick = (name: string) => {
        setAlertAction(name);
        setIsAlertOpen(true);
    };

    return (
        <DashboardLayout user={auth.user} header="Vigilancia">
            <Head title="Vigilancia" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleItemClick(item.name)}
                                className={`group bg-white rounded-xl shadow-md border-2 border-transparent p-8 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-xl ${item.color.includes("indigo") ? "hover:border-indigo-500" : item.color.includes("blue") ? "hover:border-blue-500" : item.color.includes("red") ? "hover:border-red-500" : item.color.includes("orange") ? "hover:border-orange-500" : "hover:border-emerald-500"}`}
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
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <Modal show={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                        Módulo en Construcción
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                        La funcionalidad <strong>{alertAction}</strong> estará
                        disponible próximamente.
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => setIsAlertOpen(false)}
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
