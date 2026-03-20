import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowLeft,
    Search,
    Clock,
    CheckCircle2,
    Hourglass,
    Package,
    Warehouse,
    Calendar,
    Printer,
    RefreshCw,
    X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface OeRow {
    id: string;
    num: number;
    folio: string;
    tractor_plate: string;
    operator_name: string;
    unit_type: string;
    transport_company: string;
    client: string;
    warehouse: string;
    product: string;
    presentation: string;
    programmed_tons: number;
    is_pending: boolean;
    created_at: string;       // ISO8601
    completed_at: string | null; // ISO8601 or null
    status: string;
    ticket_status: 'checkmark' | 'x' | null;
    in_plant: boolean;
}

interface PageProps {
    auth: any;
    envasado: OeRow[];
    granel: OeRow[];
    saderEnvasado: OeRow[];
    saderGranel: OeRow[];
    context_module?: string;
    filters: {
        search: string;
        module?: string;
        in_plant: string;
    };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [
        h > 0 ? String(h).padStart(2, "0") : null,
        String(m).padStart(2, "0"),
        String(s).padStart(2, "0"),
    ]
        .filter(Boolean)
        .join(":");
}

// ─── Timer Cell ──────────────────────────────────────────────────────────────

function TimerCell({ row }: { row: OeRow }) {
    const [elapsed, setElapsed] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (row.is_pending) {
            // Live counter from created_at
            const startMs = new Date(row.created_at).getTime();
            const tick = () => {
                const secs = Math.floor((Date.now() - startMs) / 1000);
                setElapsed(Math.max(0, secs));
            };
            tick();
            intervalRef.current = setInterval(tick, 1000);
        } else {
            // Fixed duration
            if (row.completed_at) {
                const startMs = new Date(row.created_at).getTime();
                const endMs = new Date(row.completed_at).getTime();
                setElapsed(Math.floor((endMs - startMs) / 1000));
            }
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [row.is_pending, row.created_at, row.completed_at]);

    const isPending = row.is_pending;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono font-bold ${isPending
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
                }`}
        >
            {isPending ? (
                <Hourglass className="w-3 h-3 flex-shrink-0" />
            ) : (
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
            )}
            {formatDuration(elapsed)}
        </span>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ row }: { row: OeRow }) {
    if (!row.is_pending) {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                COMPLETADA
            </span>
        );
    }

    // "En Planta" logic: true if backend says in_plant
    const label = row.in_plant ? "SÍ" : "NO";
    const cls = row.in_plant
        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
        : "bg-red-100 text-red-800 border border-red-200";

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}
        >
            {label}
        </span>
    );
}

// ─── Table ───────────────────────────────────────────────────────────────────

function OeTable({
    rows,
    showWarehouse,
}: {
    rows: OeRow[];
    showWarehouse: boolean;
}) {
    if (rows.length === 0) {
        return (
            <div className="py-12 text-center text-gray-400">
                <Package className="mx-auto h-12 w-12 mb-3 opacity-40" />
                <p className="text-sm font-medium">No hay registros en esta sección</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gradient-to-r from-indigo-800 to-indigo-900 text-white">
                    <tr>
                        <th className="px-4 py-3 text-center font-bold uppercase tracking-wider text-xs w-10">Ticket</th>
                        <th className="px-4 py-3 text-center font-bold uppercase tracking-wider text-xs w-12">#</th>
                        <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-xs">OE</th>
                        <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-xs">Placa Tracto</th>
                        <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-xs">Operador</th>
                        <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-xs">Tipo Unidad</th>
                        <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-xs">Línea Transp.</th>
                        <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-xs">Cliente</th>
                        {showWarehouse && (
                            <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-xs">Almacén</th>
                        )}
                        <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-xs">Producto</th>
                        <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-xs">Tons. Prog.</th>
                        <th className="px-4 py-3 text-center font-bold uppercase tracking-wider text-xs">En Planta</th>
                        <th className="px-4 py-3 text-center font-bold uppercase tracking-wider text-xs">Cronómetro</th>
                        <th className="px-4 py-3 text-center font-bold uppercase tracking-wider text-xs">Reimp.</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {rows.map((row) => (
                        <tr
                            key={row.id}
                            className={`transition-colors duration-100 ${row.is_pending
                                ? "hover:bg-amber-50"
                                : "hover:bg-emerald-50"
                                }`}
                        >
                            <td className="px-4 py-3 text-center">
                                {row.ticket_status === 'checkmark' && (
                                    <div className="flex justify-center" title="Ticket generado (Pendiente de carga)">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    </div>
                                )}
                                {row.ticket_status === 'x' && (
                                    <div className="flex justify-center" title="Sin ticket generado">
                                        <X className="w-5 h-5 text-red-500" />
                                    </div>
                                )}
                                {!row.ticket_status && <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-400 font-semibold">{row.num}</td>
                            <td className="px-4 py-3 font-bold text-indigo-700 uppercase whitespace-nowrap">
                                {row.folio}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap font-mono text-gray-700 uppercase">
                                {row.tractor_plate}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-800 font-medium uppercase">
                                {row.operator_name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                {row.unit_type}
                            </td>
                            <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate" title={row.transport_company}>
                                {row.transport_company}
                            </td>
                            <td className="px-4 py-3 text-gray-800 font-medium max-w-[180px] truncate" title={row.client}>
                                {row.client}
                            </td>
                            {showWarehouse && (
                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                    {row.warehouse !== "N/A" ? (
                                        <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold">
                                            <Warehouse className="w-3.5 h-3.5" />
                                            {row.warehouse}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </td>
                            )}
                            <td className="px-4 py-3 text-gray-700 max-w-[200px]" title={row.product}>
                                {row.product}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-indigo-900 whitespace-nowrap">
                                {row.programmed_tons.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}{" "}
                                TM
                            </td>
                            <td className="px-4 py-3 text-center">
                                <StatusBadge row={row} />
                            </td>
                            <td className="px-4 py-3 text-center">
                                <TimerCell row={row} />
                            </td>
                            <td className="px-4 py-3 text-center">
                                <a
                                    href={row.id ? `/documentation/shipment-orders/${row.id}/print` : "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-colors"
                                    title="Reimprimir OE"
                                >
                                    <Printer className="w-4 h-4" />
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Section ─────────────────────────────────────────────────────────────────

function Section({ rows, label }: { rows: OeRow[]; label: string }) {
    const [subTab, setSubTab] = useState<"pending" | "completed">("pending");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const pending = rows.filter((r) => r.is_pending);
    const completed = rows.filter((r) => !r.is_pending);
    const currentItems = subTab === "pending" ? pending : completed;

    // Paginación lógica
    const totalPages = Math.ceil(currentItems.length / pageSize);
    const paginatedItems = currentItems.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Resetear página al cambiar de pestaña
    useEffect(() => {
        setCurrentPage(1);
    }, [subTab]);

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            {/* Sub-tab bar */}
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setSubTab("pending")}
                    className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${subTab === "pending"
                        ? "bg-amber-50 text-amber-700 border-b-2 border-amber-500"
                        : "text-gray-500 hover:bg-gray-50"
                        }`}
                >
                    <Hourglass className="w-4 h-4" />
                    Pendientes
                    <span
                        className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${subTab === "pending"
                            ? "bg-amber-200 text-amber-800"
                            : "bg-gray-200 text-gray-600"
                            }`}
                    >
                        {pending.length}
                    </span>
                </button>
                <button
                    onClick={() => setSubTab("completed")}
                    className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${subTab === "completed"
                        ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500"
                        : "text-gray-500 hover:bg-gray-50"
                        }`}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Completadas
                    <span
                        className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${subTab === "completed"
                            ? "bg-emerald-200 text-emerald-800"
                            : "bg-gray-200 text-gray-600"
                            }`}
                    >
                        {completed.length}
                    </span>
                </button>
            </div>

            {/* Table */}
            <OeTable rows={paginatedItems} showWarehouse={subTab === "completed"} />

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        Mostrando <span className="font-bold">{(currentPage - 1) * pageSize + 1}</span> a <span className="font-bold">{Math.min(currentPage * pageSize, currentItems.length)}</span> de <span className="font-bold">{currentItems.length}</span> registros
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-3 py-1 rounded border border-gray-300 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${currentPage === i + 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-3 py-1 rounded border border-gray-300 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

            {/* Totals footer */}
            {currentItems.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-6 text-sm text-gray-600">
                    <span>
                        <strong className="text-gray-800">{currentItems.length}</strong> registros totales
                    </span>
                    <span>
                        Tons. Programadas:{" "}
                        <strong className="text-indigo-800">
                            {currentItems
                                .reduce((s, r) => s + r.programmed_tons, 0)
                                .toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            TM
                        </strong>
                    </span>
                </div>
            )}
        </div>
    );
}


// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
    { key: "envasado", label: "Envasado", color: "indigo" },
    { key: "granel", label: "Granel", color: "blue" },
    { key: "saderEnvasado", label: "Envasado SADER", color: "green" },
    { key: "saderGranel", label: "Granel SADER", color: "amber" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function OeTrackerIndex({
    auth,
    envasado,
    granel,
    saderEnvasado,
    saderGranel,
    filters,
}: PageProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("envasado");
    const [search, setSearch] = useState(filters.search || "");
    const [inPlant, setInPlant] = useState(filters.in_plant || "all");

    const data: Record<TabKey, OeRow[]> = { envasado, granel, saderEnvasado, saderGranel };

    const applyFilters = (newSearch?: string, newInPlant?: string) => {
        router.get(
            "/documentation/oe-tracker",
            { 
                search: newSearch ?? search, 
                in_plant: newInPlant ?? inPlant,
                module: filters.module 
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") applyFilters(search);
    };

    const tabColorMap: Record<string, string> = {
        indigo: "border-indigo-500 text-indigo-700 bg-indigo-50",
        blue: "border-blue-500 text-blue-700 bg-blue-50",
        green: "border-green-600 text-green-700 bg-green-50",
        amber: "border-amber-500 text-amber-700 bg-amber-50",
    };

    const tabIdleMap: Record<string, string> = {
        indigo: "hover:text-indigo-700 hover:bg-indigo-50",
        blue: "hover:text-blue-700 hover:bg-blue-50",
        green: "hover:text-green-700 hover:bg-green-50",
        amber: "hover:text-amber-700 hover:bg-amber-50",
    };

    return (
        <DashboardLayout user={auth.user} header="Seguimiento de OE del Día">
            <Head title="Seguimiento de OE" />

            <div className="py-8 max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Link
                            href={filters.module === 'scale' ? "/scale" : "/documentation"}
                            className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors mb-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            {filters.module === 'scale' ? "Volver a Báscula" : "Volver a Documentación"}
                        </Link>
                        <h2 className="text-2xl font-bold text-indigo-900 flex items-center">
                            <Clock className="mr-3 h-7 w-7 text-indigo-600" />
                            Monitoreo Global de OE
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Listado de todas las órdenes pendientes y completadas (Sin corte operativo)
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                placeholder="Buscar folio, operador…"
                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-56 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* En Planta Filter */}
                        <div className="relative">
                            <select
                                value={inPlant}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setInPlant(val);
                                    applyFilters(search, val);
                                }}
                                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-indigo-500 focus:border-indigo-500 font-bold text-gray-700 h-[38px]"
                            >
                                <option value="all">Filtro: En Planta (Todos)</option>
                                <option value="si">Solo: SÍ (En Planta)</option>
                                <option value="no">Solo: NO (Sin Ticket)</option>
                            </select>
                        </div>

                        <button
                            onClick={() => applyFilters(search)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Actualizar
                        </button>
                    </div>
                </div>

                {/* Presentation Tabs */}
                <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                    {TABS.map((tab) => {
                        const total = data[tab.key].length;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${isActive
                                    ? `${tabColorMap[tab.color]} border-b-4`
                                    : `border-transparent text-gray-500 ${tabIdleMap[tab.color]}`
                                    }`}
                            >
                                {tab.label}
                                <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive
                                        ? "bg-white/70 text-gray-800"
                                        : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {total}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Active Section */}
                <Section
                    rows={data[activeTab]}
                    label={TABS.find((t) => t.key === activeTab)!.label}
                />
            </div>
        </DashboardLayout>
    );
}
