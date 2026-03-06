import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Truck,
    Package,
    Scale,
    Activity,
    Printer,
    Database,
    Lock,
    ArrowRight,
    Warehouse,
    Settings,
    Check,
    List,
    ArrowLeft,
    Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import PrimaryButton from "@/Components/PrimaryButton";
import Pagination from "@/Components/Pagination";

import Swal from "sweetalert2";

const Timer = ({ entryAt }: { entryAt: string }) => {
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const start = new Date(entryAt);
            const diff = now.getTime() - start.getTime();

            if (diff < 0) {
                setTime("0m");
                return;
            }

            const diffMinutes = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;

            if (hours > 0) {
                setTime(`${hours}h ${minutes}m`);
            } else {
                setTime(`${minutes}m`);
            }
        };

        updateTime();
        // Update every minute (60000ms)
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [entryAt]);

    return (
        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-flex items-center gap-1">
            <Activity className="w-3 h-3 animate-pulse" />
            {time}
        </span>
    );
};

export default function Index({
    auth,
    pending_exit,
    flash,
    clients = [],
    products = [],
    warehouses = [],
    filters = { client_id: '', product_id: '', warehouse: '', presentation: '', search: '', tab: 'sale' }
}: {
    auth: any;
    pending_exit: any;
    flash?: any;
    clients?: any[];
    products?: any[];
    warehouses?: string[];
    filters?: { client_id: string, product_id: string, warehouse: string, presentation: string, search: string, tab: string };
}) {
    // Persistent scale ID logic
    const [scaleId, setScaleId] = useState<number>(1);
    const [showScaleModal, setShowScaleModal] = useState(false);
    const [viewMode, setViewMode] = useState<"menu" | "table">("menu");
    // State for Operation Type (Venta vs Barco) - Linked to Server Filters
    const [operationType, setOperationType] = useState<'sale' | 'vessel'>(filters?.tab as 'sale' | 'vessel' || 'sale');
    // Filters State
    const [selectedClient, setSelectedClient] = useState(filters?.client_id || '');
    const [selectedProduct, setSelectedProduct] = useState(filters?.product_id || '');
    const [selectedWarehouse, setSelectedWarehouse] = useState(filters?.warehouse || '');
    const [selectedPresentation, setSelectedPresentation] = useState(filters?.presentation || '');

    const [searchQuery, setSearchQuery] = useState(filters?.search || ''); // Global search for OE, Driver, Plates

    useEffect(() => {
        const saved = localStorage.getItem("selected_scale_id");
        if (saved) setScaleId(parseInt(saved));

        if (flash?.success) {
            Swal.fire({
                icon: "success",
                title: "¡Operación Exitosa!",
                text: flash.success,
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: "top-end",
            });
        }

        // Check for view=pending in URL
        const params = new URLSearchParams(window.location.search);
        if (params.get("view") === "pending" || pending_exit.length > 0) { // Auto switch if items present?
            // Maybe not auto switch, stick to param
            if (params.get("view") === "pending") setViewMode("table");
        }
    }, [flash]);

    // Handle Filter Change
    const handleFilterChange = (key: string, value: string) => {
        // Update local state for immediate feedback if needed, but router handles overall
        if (key === 'client_id') setSelectedClient(value);
        if (key === 'product_id') setSelectedProduct(value);
        if (key === 'warehouse') setSelectedWarehouse(value);
        if (key === 'presentation') setSelectedPresentation(value);
        if (key === 'search') setSearchQuery(value);
        if (key === 'tab') setOperationType(value as 'sale' | 'vessel');

        // Reload with Inertia
        import('@inertiajs/react').then(({ router }) => {
            router.get(route(route().current() as string), {
                view: 'table',
                client_id: key === 'client_id' ? value : selectedClient,
                product_id: key === 'product_id' ? value : selectedProduct,
                warehouse: key === 'warehouse' ? value : selectedWarehouse,
                presentation: key === 'presentation' ? value : selectedPresentation,
                search: key === 'search' ? value : searchQuery,
                tab: key === 'tab' ? value : operationType,
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true
            });
        });
    };

    // ... scale select logic ...
    const handleScaleSelect = (id: number) => {
        setScaleId(id);
        localStorage.setItem("selected_scale_id", id.toString());
        setShowScaleModal(false);
    };

    // ... buttons array ...
    const buttons = [
        {
            name: "Entrada MI / MP",
            icon: Package,
            color: "bg-indigo-50 text-indigo-600",
            hover: "hover:border-indigo-500",
            href: route("scale.entry-mp") + `?scale_id=${scaleId}`,
            subtitle: "Entrada de Materia Prima"
        },
        {
            name: "Salida",
            icon: Truck,
            color: "bg-blue-50 text-blue-600",
            hover: "hover:border-blue-500",
            href: route("scale.entry-sale") + `?scale_id=${scaleId}`, // Links to EntrySale (Tara)
            subtitle: "Pesaje de Tara para Operadores de Carga de Salida"
        },
        {
            name: auth.user?.roles?.includes("Admin")
                ? "Edita / Reimprime Ticket"
                : "Reimprime Ticket",
            icon: Printer,
            color: "bg-purple-50 text-purple-600",
            hover: "hover:border-purple-500",
            href: route("scale.tickets.index"),
            subtitle: "Gestión de Tickets"
        },
    ];

    return (
        <DashboardLayout user={auth.user} header="Báscula - Panel de Control">
            <Head title="Báscula" />

            <div className={`${viewMode === 'menu' ? 'max-w-7xl' : 'max-w-[98%]'} mx-auto py-8 px-4 space-y-8`}>
                {/* Scale Selector */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowScaleModal(true)}
                        className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700"
                    >
                        <Settings className="w-4 h-4" />
                        Báscula Activa:{" "}
                        <span className="text-indigo-600">#{scaleId}</span>
                    </button>
                </div>

                {/* View Mode Content */}
                {viewMode === "menu" ? (
                    /* Menu Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {buttons.map((btn: any, index: number) => {
                            const isLink = btn.href && btn.href !== "#";

                            const content = (
                                <>
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform transform group-hover:scale-110 ${btn.color}`}>
                                        <btn.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-bold text-gray-800">{btn.name}</h3>
                                    {btn.subtitle && (
                                        <p className="text-xs text-gray-400 mt-2 font-medium px-4">
                                            {btn.subtitle}
                                        </p>
                                    )}
                                </>
                            );

                            const className = `group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${btn.hover} w-full`;

                            return isLink ? (
                                <Link key={index} href={btn.href} className={className}>
                                    {content}
                                </Link>
                            ) : (
                                <button key={index} className={className} onClick={() => Swal.fire('Info', 'Funcionalidad en desarrollo', 'info')}>
                                    {content}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setViewMode("table")}
                            className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-green-500 w-full"
                        >
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform transform group-hover:scale-110 bg-green-50 text-green-600">
                                <Scale className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-gray-800">Destare</h3>
                            <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">Unidades en Planta</div>
                            <p className="text-xs text-gray-400 mt-2 font-medium px-4 flex items-center gap-1 justify-center">
                                <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                                {pending_exit.total ?? 0} unidades activas
                            </p>
                        </button>
                    </div>
                ) : (
                    /* Table View with Filters */
                    <div className="flex flex-col gap-6">
                        {/* Header & Back Button */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setViewMode("menu")}
                                    className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-sm font-medium"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Volver
                                </button>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center border-l-4 border-indigo-500 pl-4">
                                    <Truck className="w-6 h-6 mr-2 text-indigo-600" />
                                    Pendientes de Salida
                                </h2>
                            </div>
                        </div>

                        {/* TABS & FILTERS CONTAINER */}
                        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-gray-200 pb-4">
                            {/* Operation Type Tabs */}
                            <div className="flex p-1 bg-gray-100 rounded-lg">
                                <button
                                    onClick={() => handleFilterChange('tab', 'sale')}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${operationType === 'sale'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    VENTA
                                </button>
                                <button
                                    onClick={() => handleFilterChange('tab', 'vessel')}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${operationType === 'vessel'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    BARCO
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Search Bar */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar por OE, Chofer, Placas..."
                                        className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleFilterChange('search', searchQuery)}
                                    />
                                </div>

                                {/* Warehouse Filter (Only for Vessel) */}
                                {operationType === 'vessel' && (
                                    <select
                                        value={selectedWarehouse}
                                        onChange={(e) => handleFilterChange('warehouse', e.target.value)}
                                        className="rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 w-32 font-bold text-gray-700"
                                    >
                                        <option value="">Almacén</option>
                                        {warehouses?.map((w) => (
                                            <option key={w} value={w}>{w}</option>
                                        ))}
                                    </select>
                                )}

                                {/* Presentation Filter (Only for Sales) */}
                                {operationType === 'sale' && (
                                    <select
                                        value={selectedPresentation}
                                        onChange={(e) => handleFilterChange('presentation', e.target.value)}
                                        className="rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 w-32 font-bold text-gray-700"
                                    >
                                        <option value="">Presentación</option>
                                        <option value="GRANEL">GRANEL</option>
                                        <option value="ENVASADO">ENVASADO</option>
                                    </select>
                                )}

                                {/* Product Filter */}
                                <select
                                    value={selectedProduct}
                                    onChange={(e) => handleFilterChange('product_id', e.target.value)}
                                    className="rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 max-w-[150px] font-bold text-gray-700"
                                >
                                    <option value="">Producto</option>
                                    {products?.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>

                                {/* Client Filter */}
                                <select
                                    value={selectedClient}
                                    onChange={(e) => handleFilterChange('client_id', e.target.value)}
                                    className="rounded-lg border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500 max-w-[150px] font-bold text-gray-700"
                                >
                                    <option value="">Cliente</option>
                                    {clients?.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.business_name || c.name}</option>
                                    ))}
                                </select>

                                <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm ml-auto">
                                    {pending_exit.total ?? 0} Registros
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gradient-to-r from-indigo-800 to-indigo-900 text-white shadow-lg">
                                        <tr>
                                            {/* Col 1: Removed Type */}
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider rounded-tl-lg">Folio</th>
                                            {operationType === 'sale' && (
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">OE</th>
                                            )}
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Cliente</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Chofer</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Placas</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">{operationType === 'sale' ? 'Línea Real' : 'Línea de Transporte'}</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Producto</th>
                                            {/* Removed Peso Entrada */}
                                            {operationType === 'vessel' && (
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Barco</th>
                                            )}
                                            {operationType === 'sale' && (
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Ton. Prog.</th>
                                            )}
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Tiempo en Planta</th>
                                            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider rounded-tr-lg">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {pending_exit.data.length > 0 ? (
                                            pending_exit.data.map((order: any) => (
                                                <tr key={order.id} className="hover:bg-indigo-50 transition-all duration-200 group">
                                                    {/* Folio */}
                                                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">{order.folio}</td>
                                                    {operationType === 'sale' && (
                                                        <td className="px-6 py-4 font-mono font-bold text-indigo-900 border-l border-indigo-100">
                                                            {order.oe_folio || 'N/A'}
                                                        </td>
                                                    )}
                                                    {/* Cliente */}
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-800 text-xs leading-tight uppercase">{order.provider}</div>
                                                    </td>
                                                    {/* Chofer */}
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-800">{order.driver}</div>
                                                    </td>
                                                    {/* Placas */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded leading-none">TRACTO</span>
                                                                <span className="text-xs font-bold text-indigo-700 font-mono">{order.vehicle_plate}</span>
                                                            </div>
                                                            {order.trailer_plate && order.trailer_plate !== 'N/A' && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-[10px] font-black bg-indigo-100 text-indigo-500 px-1.5 py-0.5 rounded leading-none">REMOLQUE</span>
                                                                    <span className="text-xs font-bold text-amber-700 font-mono">{order.trailer_plate}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {/* Línea de Transporte */}
                                                    <td className="px-6 py-4 text-gray-700 font-medium text-sm">
                                                        {order.real_transport_line || 'N/A'}
                                                    </td>
                                                    {/* Producto */}
                                                    <td className="px-6 py-4 text-gray-800 font-bold">{order.product}</td>

                                                    {/* Barco (Only for Vessel) */}
                                                    {operationType === 'vessel' && (
                                                        <td className="px-6 py-4 text-gray-800 font-bold">
                                                            {order.vessel_name}
                                                        </td>
                                                    )}

                                                    {/* Ton. Prog. (Create Only for Sale) */}
                                                    {operationType === 'sale' && (
                                                        <td className="px-6 py-4 font-mono font-bold text-gray-700">
                                                            {order.programmed_weight ? Number(order.programmed_weight).toFixed(2) : '---'} TM
                                                        </td>
                                                    )}
                                                    {/* Tiempo en Planta */}
                                                    <td className="px-6 py-4">
                                                        <Timer entryAt={order.entry_at} />
                                                    </td>
                                                    {/* Acción */}
                                                    <td className="px-6 py-4 text-center">
                                                        <Link
                                                            href={route("scale.exit", order.id) + `?scale_id=${scaleId}`}
                                                            className="inline-flex items-center justify-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm hover:shadow-md text-sm"
                                                        >
                                                            Destarar <ArrowRight className="w-4 h-4 ml-1.5" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                    <Truck className="mx-auto h-12 w-12 text-indigo-200 mb-3" />
                                                    <p className="text-lg font-medium text-gray-900">No hay unidades pendientes</p>
                                                    <p className="text-sm text-gray-500">En esta categoría.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View (Filtered) */}
                            <div className="lg:hidden p-4 space-y-4">
                                {pending_exit.data.length > 0 ? (
                                    pending_exit.data.map((order: any) => (
                                        <div
                                            key={order.id}
                                            className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col gap-3"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-xs font-bold uppercase text-indigo-500 tracking-wider">
                                                        Folio: {order.folio}
                                                        {operationType === 'sale' && (
                                                            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-black">
                                                                OE: {order.oe_folio}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <h3 className="font-bold text-gray-900 text-lg">
                                                        {order.driver}
                                                    </h3>
                                                    <p className="text-sm text-gray-400 font-mono">
                                                        {order.vehicle_plate}
                                                        {order.trailer_plate && order.trailer_plate !== 'N/A' && ` / ${order.trailer_plate}`}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1">
                                                        {order.provider}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <Timer entryAt={order.entry_at} />
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Transp.:</span>
                                                    <span className="font-medium text-gray-800">{order.real_transport_line || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Producto:</span>
                                                    <span className="font-bold text-gray-800">{order.product}</span>
                                                </div>

                                                {/* Barco only for vessel */}
                                                {operationType === 'vessel' && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Barco:</span>
                                                        <span className="font-bold text-indigo-600">{order.vessel_name}</span>
                                                    </div>
                                                )}

                                                {operationType === 'sale' && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Ton. Prog.:</span>
                                                        <span className="font-mono text-gray-800">
                                                            {order.programmed_weight ? Number(order.programmed_weight).toFixed(2) : '---'} TM
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Warehouse only for vessel */}
                                                {operationType === 'vessel' && (
                                                    <div className="flex justify-between text-sm items-center">
                                                        <span className="text-gray-500">Ubicación:</span>
                                                        <span className={order.warehouse === "N/A" ? "text-amber-500 italic text-xs" : "text-blue-600 font-bold text-xs"}>
                                                            {order.warehouse === "N/A" ? "Sin Asignar" : `${order.warehouse} - ${order.cubicle}`}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <Link
                                                href={route("scale.exit", order.id) + `?scale_id=${scaleId}`}
                                                className="mt-2 w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-md active:scale-95"
                                            >
                                                Destarar Unidad <ArrowRight className="w-5 h-5 ml-2" />
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        No hay unidades en esta lista.
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Pagination Component */}
                        <Pagination links={pending_exit.links} />
                    </div>
                )}
            </div>

            {/* Scale Selection Modal */}
            <Modal
                show={showScaleModal}
                onClose={() => setShowScaleModal(false)}
            >
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Seleccionar Báscula de Operación
                    </h2>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[1, 2, 3].map((id: number) => (
                            <button
                                key={id}
                                onClick={() => handleScaleSelect(id)}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${scaleId === id
                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                    : "border-gray-200 hover:border-indigo-200"
                                    }`}
                            >
                                <Scale
                                    className={`w-8 h-8 ${scaleId === id ? "text-indigo-600" : "text-gray-400"}`}
                                />
                                <span className="font-bold text-lg">
                                    Báscula {id}
                                </span>
                                {scaleId === id && (
                                    <Check className="w-4 h-4 text-indigo-600" />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <SecondaryButton
                            onClick={() => setShowScaleModal(false)}
                        >
                            Cerrar
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>
        </DashboardLayout >
    );
}
