import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
    Plus,
    Search,
    FileText,
    ArrowLeft,
    CheckCircle,
    X,
} from "lucide-react";
import { useState, useEffect } from "react";

interface Client {
    id: number;
    business_name: string;
    rfc: string;
}

interface Order {
    id: string;
    folio: string;
    sale_order: string;
    client: Client;
    product: {
        name: string;
    };
    total_quantity: number;
    loaded_quantity: number;
    balance: number;
    status: string;
    created_at: string;
}

export default function Index({
    auth,
    orders,
    flash,
}: {
    auth: any;
    orders: Order[];
    flash?: { success?: string; error?: string };
}) {
    const [search, setSearch] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const formatter = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 3,
        minimumFractionDigits: 0,
    });

    const toggleStatus = (id: string) => {
        router.patch(
            route("sales.toggle-status", id),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const filteredOrders = orders.filter(
        (order) =>
            order.folio.toLowerCase().includes(search.toLowerCase()) ||
            order.sale_order?.toLowerCase().includes(search.toLowerCase()) ||
            order.client?.business_name
                .toLowerCase()
                .includes(search.toLowerCase())
    );

    return (
        <DashboardLayout user={auth.user} header="Órdenes de Venta">
            <Head title="Órdenes de Venta" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Dynamic Alert */}
                {showAlert && flash?.success && (
                    <div className="fixed top-24 right-8 z-50 animate-fade-in-right">
                        <div className="bg-white border-l-4 border-green-500 rounded-lg shadow-2xl p-4 flex items-center max-w-md">
                            <div className="bg-green-100 p-2 rounded-full mr-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1 mr-4">
                                <h4 className="text-green-900 font-bold text-sm">Operación Exitosa</h4>
                                <p className="text-green-700 text-xs font-medium">{flash.success}</p>
                            </div>
                            <button
                                onClick={() => setShowAlert(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="md:flex md:items-center md:justify-between mb-6">
                    <div className="flex-1 min-w-0">
                        <div className="mb-4">
                            <Link
                                href={route("sales.index")}
                                className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Volver a Comercialización
                            </Link>
                        </div>
                        <h2 className="text-2xl font-bold leading-7 text-indigo-900 sm:text-3xl sm:truncate flex items-center">
                            <FileText className="mr-3 h-8 w-8 text-indigo-600" />
                            Historial de Órdenes de Venta
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        <Link
                            href={route("sales.create")}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nueva Orden de Venta
                        </Link>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por folio, cliente..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-full">
                        {filteredOrders.length} Registros
                    </span>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-indigo-800 to-indigo-900">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Orden de Venta
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Estatus
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                        Solicitado
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                        Cargado
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                                        Saldo
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">No hay órdenes registradas</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-indigo-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-700">
                                                {order.folio || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                                {order.client?.business_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold
                                                ${order.status === "created" ? "bg-blue-100 text-blue-800" : ""}
                                                ${order.status === "closed" ? "bg-red-100 text-red-800" : ""}
                                                ${order.status === "completed" ? "bg-green-100 text-green-800" : ""}
                                            `}
                                                >
                                                    {order.status === "created"
                                                        ? "ABIERTA"
                                                        : order.status === "closed"
                                                            ? "CERRADA"
                                                            : order.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                                                {formatter.format(Number(order.total_quantity))} TM
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-700 text-center">
                                                {formatter.format(Number(order.loaded_quantity))} TM
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-amber-700 text-center">
                                                {formatter.format(Number(order.balance))} TM
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <Link
                                                    href={route("sales.show", {
                                                        sale: order.id,
                                                        module: "sales_report",
                                                    })}
                                                    className="inline-flex items-center text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                                                >
                                                    Ver
                                                </Link>
                                                {order.status === "created" && (
                                                    <button
                                                        onClick={() => toggleStatus(order.id)}
                                                        className="inline-flex items-center text-red-600 hover:text-red-900 bg-red-50 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors"
                                                    >
                                                        Cerrar
                                                    </button>
                                                )}
                                                {order.status === "closed" && (
                                                    <button
                                                        onClick={() => toggleStatus(order.id)}
                                                        className="inline-flex items-center text-green-600 hover:text-green-900 bg-green-50 px-3 py-1.5 rounded-md hover:bg-green-100 transition-colors"
                                                    >
                                                        Abrir
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
