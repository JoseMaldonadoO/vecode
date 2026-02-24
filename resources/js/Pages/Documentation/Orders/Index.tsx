import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import {
    FileText,
    Search,
    ArrowLeft,
    Filter,
    Plus,
    X,
    Save,
    Calendar,
    Hash,
    User,
    Truck,
    MapPin,
    Box,
    Scale,
    ShoppingCart,
    Ship,
    Check,
    Printer,
    ChevronsUpDown,
    CheckCircle,
    Clipboard,
    Edit,
    MoreHorizontal,
    MoreVertical,
    Settings,
} from "lucide-react";
import { useState, Fragment, FormEventHandler, useEffect } from "react";
// @ts-ignore
import { pickBy } from "lodash";
import { Combobox, Menu, Transition } from "@headlessui/react";
import Swal from 'sweetalert2';

interface Client {
    id: number;
    business_name: string;
    rfc: string;
    address: string;
}

interface Product {
    id: number;
    name: string;
    code: string;
}

interface Order {
    id: string;
    folio: string;
    sale_order?: string;
    sales_order_id?: string;
    sales_order?: {
        folio: string;
    };
    operation_type: "scale" | "burreo";
    client: {
        business_name: string;
    };
    vessel?: {
        name: string;
    };
    driver?: {
        name: string;
    };
    operator_name?: string;
    programmed_tons?: number;
    status: string;
    origin?: {
        name: string;
    } | string;
    origin_id?: number;
    created_at: string;
}

interface PageProps {
    orders: {
        data: Order[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
    clients: Client[];
    products: Product[];
    sales_orders: any[];
    default_folio: string;
    auth: any;
}

export default function Index({
    auth,
    orders,
    filters,
    clients,
    products,
    sales_orders,
    default_folio,
}: PageProps) {
    const { flash } = usePage<any>().props;
    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "active"); // Default to active if not present
    const [showAlert, setShowAlert] = useState(!!flash?.success);

    useEffect(() => {
        if (flash?.success) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    const handleSearch = (newSearch?: string, newStatus?: string) => {
        const s = newSearch !== undefined ? newSearch : search;
        const st = newStatus !== undefined ? newStatus : status;

        router.get(
            route("documentation.orders.index"),
            pickBy({ search: s, status: st }),
            { preserveState: true },
        );
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setStatus(value);
        handleSearch(search, value);
    };

    return (
        <DashboardLayout user={auth.user} header="Órdenes de Embarque">
            <Head title="Órdenes de Embarque" />

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
                                href={route("documentation.index")}
                                className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Volver a Documentación
                            </Link>
                        </div>
                        <h2 className="text-2xl font-bold leading-7 text-indigo-900 sm:text-3xl sm:truncate flex items-center">
                            <FileText className="mr-3 h-8 w-8 text-indigo-600" />
                            Órdenes de Embarque
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        <Link
                            href={route("documentation.create")}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nueva Orden de Embarque
                        </Link>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                            placeholder="Buscar por folio, cliente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleSearch()
                            }
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={status}
                            onChange={handleStatusChange}
                            className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                        >
                            <option value="active">Órdenes Activas</option>
                            <option value="cancelled">Canceladas</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-indigo-800 to-indigo-900">
                                <tr className="text-white">
                                    <th className="sticky left-0 px-4 py-4 text-center text-xs font-bold uppercase tracking-wider bg-indigo-800 z-10 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)]">
                                        <Settings className="w-5 h-5 mx-auto opacity-50" />
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                                        Folio
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                                        Orden
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                                        Operador
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                                        Tons. Prog.
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                                        Estatus
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                                        Origen
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                                        Fecha
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.data.length > 0 ? (
                                    orders.data.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-indigo-50 transition-colors duration-150 group"
                                        >
                                            <td className="sticky left-0 px-4 py-4 whitespace-nowrap text-center text-sm font-medium bg-white group-hover:bg-indigo-50 z-10 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)] transition-colors">
                                                <Menu as="div" className="relative inline-block text-left">
                                                    <div>
                                                        <Menu.Button className="inline-flex justify-center w-full px-2 py-2 text-sm font-medium text-gray-700 bg-transparent rounded-full hover:bg-white/50 focus:outline-none transition-all group-hover:bg-indigo-100/50">
                                                            <MoreHorizontal className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600" aria-hidden="true" />
                                                        </Menu.Button>
                                                    </div>
                                                    <Transition
                                                        as={Fragment}
                                                        enter="transition ease-out duration-100"
                                                        enterFrom="transform opacity-0 scale-95"
                                                        enterTo="transform opacity-100 scale-100"
                                                        leave="transition ease-in duration-75"
                                                        leaveFrom="transform opacity-100 scale-100"
                                                        leaveTo="transform opacity-0 scale-95"
                                                    >
                                                        <Menu.Items className="absolute left-full top-0 ml-2 w-48 origin-top-left bg-white divide-y divide-gray-100 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                                            <div className="px-1 py-1">
                                                                {order.status !== 'cancelled' && (
                                                                    <>
                                                                        <Menu.Item>
                                                                            {({ active }) => (
                                                                                <a
                                                                                    href={route("documentation.print-order", order.id)}
                                                                                    target="_blank"
                                                                                    className={`${active ? 'bg-indigo-600 text-white' : 'text-gray-900'} group flex rounded-lg items-center w-full px-3 py-2 text-sm transition-colors font-bold`}
                                                                                >
                                                                                    <Printer className={`w-4 h-4 mr-2 ${active ? 'text-white' : 'text-gray-500'}`} />
                                                                                    Imprimir
                                                                                </a>
                                                                            )}
                                                                        </Menu.Item>
                                                                        <Menu.Item>
                                                                            {({ active }) => (
                                                                                <Link
                                                                                    href={route("documentation.edit", order.id)}
                                                                                    className={`${active ? 'bg-indigo-600 text-white' : 'text-gray-900'} group flex rounded-lg items-center w-full px-3 py-2 text-sm transition-colors font-bold`}
                                                                                >
                                                                                    <Edit className={`w-4 h-4 mr-2 ${active ? 'text-white' : 'text-indigo-500'}`} />
                                                                                    Editar
                                                                                </Link>
                                                                            )}
                                                                        </Menu.Item>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="px-1 py-1">
                                                                {order.status !== 'cancelled' ? (
                                                                    <Menu.Item>
                                                                        {({ active }) => (
                                                                            <button
                                                                                onClick={() => {
                                                                                    Swal.fire({
                                                                                        title: '¿Cancelar Orden?',
                                                                                        text: "Esta acción cambiará el estatus a cancelado.",
                                                                                        icon: 'warning',
                                                                                        showCancelButton: true,
                                                                                        confirmButtonColor: '#ef4444',
                                                                                        cancelButtonColor: '#6b7280',
                                                                                        confirmButtonText: 'Sí, cancelar',
                                                                                        cancelButtonText: 'Cancelar'
                                                                                    }).then((result) => {
                                                                                        if (result.isConfirmed) {
                                                                                            router.visit(route('documentation.cancel', order.id), {
                                                                                                method: 'patch',
                                                                                                preserveScroll: true,
                                                                                                preserveState: true,
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }}
                                                                                className={`${active ? 'bg-red-600 text-white' : 'text-red-600'} group flex rounded-lg items-center w-full px-3 py-2 text-sm transition-colors font-bold`}
                                                                            >
                                                                                <X className={`w-4 h-4 mr-2 ${active ? 'text-white' : 'text-red-500'}`} />
                                                                                Cancelar
                                                                            </button>
                                                                        )}
                                                                    </Menu.Item>
                                                                ) : (
                                                                    <Menu.Item>
                                                                        {({ active }) => (
                                                                            <button
                                                                                onClick={() => {
                                                                                    Swal.fire({
                                                                                        title: '¿Re-abrir Orden?',
                                                                                        text: "La orden volverá a estar activa y se podrá editar.",
                                                                                        icon: 'question',
                                                                                        showCancelButton: true,
                                                                                        confirmButtonColor: '#10b981',
                                                                                        cancelButtonColor: '#6b7280',
                                                                                        confirmButtonText: 'Sí, re-abrir',
                                                                                        cancelButtonText: 'Cancelar'
                                                                                    }).then((result) => {
                                                                                        if (result.isConfirmed) {
                                                                                            router.visit(route('documentation.reopen', order.id), {
                                                                                                method: 'patch',
                                                                                                preserveScroll: true,
                                                                                                preserveState: true,
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }}
                                                                                className={`${active ? 'bg-green-600 text-white' : 'text-green-600'} group flex rounded-lg items-center w-full px-3 py-2 text-sm transition-colors font-bold`}
                                                                            >
                                                                                <CheckCircle className={`w-4 h-4 mr-2 ${active ? 'text-white' : 'text-green-500'}`} />
                                                                                Re-abrir
                                                                            </button>
                                                                        )}
                                                                    </Menu.Item>
                                                                )}
                                                            </div>
                                                        </Menu.Items>
                                                    </Transition>
                                                </Menu>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-indigo-700 uppercase">
                                                    {order.folio}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium italic">
                                                {order.sales_order?.folio || order.sale_order || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-medium">
                                                {order.client?.business_name || "CLIENTE GENERAL"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium uppercase">
                                                {order.operator_name || order.driver?.name || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-bold">
                                                {order.programmed_tons ? Number(order.programmed_tons).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"} TM
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === "active" || order.status === "created"
                                                        ? "bg-green-100 text-green-800"
                                                        : order.status === "cancelled"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {order.status === "active" || order.status === "created"
                                                        ? "ABIERTA"
                                                        : order.status === "cancelled"
                                                            ? "CANCELADA"
                                                            : order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-medium">
                                                {(typeof order.origin === 'object' ? order.origin?.name : order.origin) || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.created_at
                                                    ? new Date(
                                                        order.created_at,
                                                    ).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">
                                                No se encontraron órdenes
                                            </p>
                                            <p className="text-sm">
                                                Intenta ajustar los filtros de estatus.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {
                        orders.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 md:flex md:items-center md:justify-between">
                                <div className="text-sm text-gray-500 mb-4 md:mb-0">
                                    Mostrando{" "}
                                    <span className="font-medium">
                                        {orders.from}
                                    </span>{" "}
                                    a{" "}
                                    <span className="font-medium">{orders.to}</span>{" "}
                                    de{" "}
                                    <span className="font-medium">
                                        {orders.total}
                                    </span>{" "}
                                    resultados
                                </div>
                                <div className="flex justify-center space-x-1">
                                    {orders.links.map((link, key) =>
                                        link.url ? (
                                            <Link
                                                key={key}
                                                href={link.url}
                                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${link.active
                                                    ? "bg-indigo-600 text-white shadow-sm"
                                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                                    }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ) : (
                                            <span
                                                key={key}
                                                className="px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ),
                                    )}
                                </div>
                            </div>
                        )
                    }
                </div >
            </div >
        </DashboardLayout >
    );
}
