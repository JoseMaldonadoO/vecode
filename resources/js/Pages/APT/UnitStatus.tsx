import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router } from "@inertiajs/react";
import { 
    Truck, 
    ArrowLeft, 
    Filter, 
    Search,
    Clock,
    User,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { pickBy } from "lodash";

const Timer = ({ entryAt }: { entryAt: string }) => {
    const [elapsed, setElapsed] = useState("");

    useEffect(() => {
        const calculate = () => {
            const start = new Date(entryAt).getTime();
            const now = new Date().getTime();
            const diff = now - start;

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            let timeStr = "";
            if (hours > 0) timeStr += `${hours}h `;
            timeStr += `${minutes}m`;
            if (hours === 0 && minutes < 5) timeStr += ` ${seconds}s`;

            setElapsed(timeStr);
        };

        calculate();
        const interval = setInterval(calculate, 60000);
        return () => clearInterval(interval);
    }, [entryAt]);

    return (
        <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            <Clock className="w-3.5 h-3.5" />
            <span>{elapsed}</span>
        </div>
    );
};

const Pagination = ({ links }: { links: any[] }) => {
    if (links.length <= 3) return null;

    return (
        <div className="flex items-center justify-center gap-1 py-6 bg-white border-t border-gray-100">
            {links.map((link, i) => {
                const isNext = link.label.includes('Next');
                const isPrev = link.label.includes('Previous');
                
                return (
                    <Link
                        key={i}
                        href={link.url || '#'}
                        preserveScroll
                        className={`
                            inline-flex items-center justify-center min-w-[40px] h-10 rounded-lg text-sm font-bold transition-all
                            ${link.active 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                                : link.url 
                                    ? 'bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200' 
                                    : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'}
                        `}
                        dangerouslySetInnerHTML={{ 
                            __html: isPrev ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>' : 
                                    isNext ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>' : 
                                    link.label 
                        }}
                    />
                );
            })}
        </div>
    );
};

export default function UnitStatus({ 
    auth, 
    pending_exit, 
    filters,
    clients = [],
    products = []
}: any) {
    const [selectedTab, setSelectedTab] = useState(filters.tab || 'sale');
    const [selectedClient, setSelectedClient] = useState(filters.client_id || '');
    const [selectedProduct, setSelectedProduct] = useState(filters.product_id || '');
    const [selectedWarehouse, setSelectedWarehouse] = useState(filters.warehouse || '');

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = pickBy({
            ...filters,
            [key]: value
        });

        if (key === 'tab') {
            setSelectedTab(value);
            // Reset other filters when changing tabs to avoid conflicts
            delete newFilters.client_id;
            delete newFilters.product_id;
            delete newFilters.warehouse;
            setSelectedClient('');
            setSelectedProduct('');
            setSelectedWarehouse('');
        }

        router.get(route('apt.unit-status'), newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    return (
        <DashboardLayout user={auth.user} header="APT - Estatus de Unidades en Planta">
            <Head title="Estatus de Unidades APT" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link
                            href={route('apt.index')}
                            className="inline-flex items-center text-gray-500 hover:text-indigo-600 font-bold text-sm transition-colors mb-2 group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
                            Volver al Tablero
                        </Link>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Estatus de Unidades</h2>
                        <p className="text-gray-500 font-medium">Visualización de unidades en proceso de descarga.</p>
                    </div>

                    <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm self-start">
                        <button
                            onClick={() => handleFilterChange('tab', 'sale')}
                            className={`px-6 py-2 rounded-lg font-black text-sm transition-all ${selectedTab === 'sale' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Comercialización
                        </button>
                        <button
                            onClick={() => handleFilterChange('tab', 'vessel')}
                            className={`px-6 py-2 rounded-lg font-black text-sm transition-all ${selectedTab === 'vessel' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Barcos / Operaciones
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-sm mr-2">
                        <Filter className="w-4 h-4" />
                        <span>Filtros:</span>
                    </div>

                    <select
                        value={selectedWarehouse}
                        onChange={(e) => {
                            setSelectedWarehouse(e.target.value);
                            handleFilterChange('warehouse', e.target.value);
                        }}
                        className="rounded-xl border-gray-200 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all min-w-[140px]"
                    >
                        <option value="">Cualquier Almacén</option>
                        <option value="Almacén 1">Almacén 1</option>
                        <option value="Almacén 2">Almacén 2</option>
                        <option value="Almacén 3">Almacén 3</option>
                        <option value="Almacén 4">Almacén 4</option>
                        <option value="Almacén 5">Almacén 5</option>
                    </select>

                    <select
                        value={selectedProduct}
                        onChange={(e) => {
                            setSelectedProduct(e.target.value);
                            handleFilterChange('product_id', e.target.value);
                        }}
                        className="rounded-xl border-gray-200 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all min-w-[140px]"
                    >
                        <option value="">Producto</option>
                        {products?.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <select
                        value={selectedClient}
                        onChange={(e) => {
                            setSelectedClient(e.target.value);
                            handleFilterChange('client_id', e.target.value);
                        }}
                        className="rounded-xl border-gray-200 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all min-w-[140px]"
                    >
                        <option value="">Cliente</option>
                        {clients?.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.business_name || c.name}</option>
                        ))}
                    </select>

                    <div className="ml-auto">
                        <span className="bg-green-50 text-green-700 border border-green-100 font-black px-4 py-1.5 rounded-full text-xs shadow-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            {pending_exit.total ?? 0} En Planta
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">OE / Folio</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Cliente / Proveedor</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Chofer</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Tracto</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Ubicación</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Producto</th>
                                    {selectedTab === 'vessel' && (
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Barco</th>
                                    )}
                                    <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Permanencia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {pending_exit.data.length > 0 ? (
                                    pending_exit.data.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-indigo-50/30 transition-all duration-200">
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-black text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded text-xs border border-indigo-100">
                                                    {order.oe_folio || order.folio || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-black text-gray-900 text-xs leading-tight uppercase max-w-[200px] truncate">
                                                    {order.provider || order.client?.name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div className="font-bold text-gray-800 text-sm">{order.driver}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xl font-black text-indigo-800 font-mono tracking-wider tabular-nums">
                                                    {order.vehicle_plate}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-indigo-600">{order.warehouse || 'Sin Asignar'}</span>
                                                    {order.cubicle && order.cubicle !== 'N/A' && (
                                                        <span className="text-[10px] font-black text-gray-400">CUB: {order.cubicle}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-black uppercase border border-gray-200 shadow-sm">
                                                    {order.product}
                                                </span>
                                            </td>
                                            {selectedTab === 'vessel' && (
                                                <td className="px-6 py-4 text-gray-900 font-black text-xs uppercase">
                                                    {order.vessel?.name || 'N/A'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <Timer entryAt={order.entry_at} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={selectedTab === 'vessel' ? 8 : 7} className="px-6 py-20 text-center text-gray-500">
                                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                                                <Truck className="h-10 w-10 text-gray-300" />
                                            </div>
                                            <p className="text-xl font-black text-gray-900">Sin unidades en planta</p>
                                            <p className="text-sm text-gray-400 font-medium">No se encontraron movimientos registrados en este momento.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="lg:hidden p-4 space-y-4 bg-gray-50/50">
                        {pending_exit.data.length > 0 ? (
                            pending_exit.data.map((order: any) => (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-3">
                                        <Timer entryAt={order.entry_at} />
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase font-mono">
                                                {order.oe_folio || order.folio || 'N/A'}
                                            </span>
                                            <span className="px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase">
                                                {order.warehouse || 'SIN UBICACIÓN'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">PLACA TRACTO</span>
                                            <h3 className="font-black text-indigo-900 text-2xl tracking-tighter tabular-nums flex items-baseline gap-2">
                                                {order.vehicle_plate}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 border-t border-gray-50 pt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-0.5">CHOFER</span>
                                                <span className="font-bold text-gray-900 text-sm leading-tight uppercase">{order.driver}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-1">
                                            <div>
                                                <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1 block">PRODUCTO</span>
                                                <span className="inline-block bg-gray-100 border border-gray-200 text-gray-800 px-2 py-0.5 rounded text-[11px] font-black uppercase">
                                                    {order.product}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1 block">CLIENTE / PROV.</span>
                                                <span className="text-[11px] font-bold text-gray-700 uppercase line-clamp-2 leading-tight">
                                                    {order.provider || order.client?.name || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        {selectedTab === 'vessel' && (
                                            <div className="mt-1 pt-3 border-t border-gray-50">
                                                <span className="text-[9px] font-black text-indigo-400 uppercase leading-none mb-1 block tracking-wider">BARCO OPERANDO</span>
                                                <span className="text-sm font-black text-indigo-900 uppercase">
                                                    {order.vessel?.name || 'N/A'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-gray-400 italic bg-white rounded-2xl border border-dashed border-gray-200">
                                <Truck className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                                <p className="font-black text-gray-400">No hay unidades para mostrar.</p>
                            </div>
                        )}
                    </div>

                    <Pagination links={pending_exit.links} />
                </div>
            </div>
        </DashboardLayout>
    );
}
