import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router } from "@inertiajs/react";
import Swal from "sweetalert2";
import {
    Ship,
    Anchor,
    Calendar,
    Clock,
    ArrowRight,
    Wind,
    AlertTriangle,
    CheckCircle,
    Droplets,
    ArrowLeft,
    FileText,
    LogOut,
    MapPin,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";

// Unicorn UI Components (Sub-components located here for single-file portability during dev)

const VesselCard = ({
    vessel,
    side,
    isExternal = false,
}: {
    vessel: any;
    side: string;
    isExternal?: boolean;
}) => {
    const isOccupied = vessel && vessel.name !== "-";

    const handleDeparture = () => {
        Swal.fire({
            title: '<span class="text-2xl font-black uppercase tracking-tight">Confirmar Salida</span>',
            html: `¿Está seguro de marcar la salida del buque <strong class="text-blue-600">${vessel.name}</strong>?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'SÍ, MARCAR SALIDA',
            cancelButtonText: 'CANCELAR',
            confirmButtonColor: isExternal ? '#06b6d4' : '#3b82f6',
            cancelButtonColor: '#64748b',
            reverseButtons: true,
        }).then((result: any) => {
            if (result.isConfirmed) {
                router.post(route('dock.vessel.mark-departure', vessel.id as any), {
                    type: isExternal ? 'external' : 'internal'
                } as any);
            }
        });
    };

    const colorClasses = isExternal
        ? (isOccupied
            ? "border-cyan-400/50 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/40 shadow-[0_20px_50px_-20px_rgba(34,211,238,0.3)]"
            : "border-slate-200 bg-slate-50 opacity-60")
        : (isOccupied
            ? "border-blue-500/50 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900 shadow-[0_20px_50px_-20px_rgba(30,58,138,0.7)]"
            : "border-slate-200 bg-slate-50 opacity-60 overflow-hidden");

    if (isExternal && !isOccupied) return null;

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 p-8 group ${colorClasses} ${!isOccupied ? "border-dashed hover:opacity-100 hover:border-slate-300 min-h-[180px]" : "min-h-[220px]"}`}
        >
            {/* Background Accent for Occupied - Now at Bottom Right for External */}
            {isOccupied && (
                <div className={`absolute bottom-0 right-0 -mb-24 -mr-24 h-80 w-80 rounded-full blur-3xl opacity-20 animate-pulse ${isExternal ? "bg-cyan-500" : "bg-blue-500"}`}></div>
            )}

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <h3 className={`text-sm font-black uppercase tracking-[0.3em] mb-4 ${isOccupied ? (isExternal ? "text-cyan-400" : "text-blue-400") : "text-slate-400"}`}>
                        {isExternal ? "Muelle Externo" : `Muelle ${side}`}
                    </h3>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-10">
                    {isOccupied ? (
                        <>
                            {/* Vessel Info Sub-Card (Left Aligned) */}
                            <div className={`flex-shrink-0 ${isExternal ? "bg-cyan-400/5 border-cyan-400/10" : "bg-white/5 border-white/10"} backdrop-blur-md border rounded-2xl p-6 md:p-8 min-w-[360px] shadow-2xl`}>
                                <div className="mb-6">
                                    <h2 className="text-4xl font-black text-white tracking-tighter leading-none mb-3">
                                        {vessel.name}
                                    </h2>
                                    <Badge
                                        variant="outline"
                                        className={`bg-transparent font-black text-xs uppercase tracking-[0.2em] px-3 py-0.5 ${isExternal ? "border-cyan-400/30 text-cyan-200" : "border-white/20 text-white/70"}`}
                                    >
                                        {vessel.type}
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    <div className={`flex items-center justify-between border-b ${isExternal ? "border-cyan-400/10" : "border-white/5"} pb-2.5`}>
                                        <div className="flex items-center gap-2">
                                            <FileText className={`w-4 h-4 ${isExternal ? "text-cyan-400/30" : "text-white/30"}`} />
                                            <span className={`${isExternal ? "text-cyan-400/40" : "text-white/40"} text-xs font-black uppercase tracking-widest`}>Operación</span>
                                        </div>
                                        <span className="text-white font-bold text-lg tracking-wide">{vessel.operation_type}</span>
                                    </div>

                                    <div className={`flex items-center justify-between border-b ${isExternal ? "border-cyan-400/10" : "border-white/5"} pb-2.5`}>
                                        <div className="flex items-center gap-2">
                                            <Clock className={`w-4 h-4 ${isExternal ? "text-cyan-400/30" : "text-white/30"}`} />
                                            <span className={`${isExternal ? "text-cyan-400/40" : "text-white/40"} text-xs font-black uppercase tracking-widest`}>Estadía</span>
                                        </div>
                                        <span className="text-white font-bold text-lg">{vessel.stay_days} <span className={`${isExternal ? "text-cyan-400/40" : "text-white/40"} font-medium text-xs ml-0.5`}>Días</span></span>
                                    </div>

                                    <div className={`flex items-center justify-between border-b ${isExternal ? "border-cyan-400/10" : "border-white/5"} pb-2.5`}>
                                        <div className="flex items-center gap-2">
                                            <Calendar className={`w-4 h-4 ${isExternal ? "text-cyan-400/30" : "text-white/30"}`} />
                                            <span className={`${isExternal ? "text-cyan-400/40" : "text-white/40"} text-xs font-black uppercase tracking-widest`}>
                                                {isExternal ? "Llegada" : "Atraco"}
                                            </span>
                                        </div>
                                        <span className="text-white font-mono font-bold text-sm tracking-tight">{isExternal ? vessel.external_arrival : (vessel.etb || vessel.berthal_datetime)}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-2">
                                            <LogOut className={`w-4 h-4 ${isExternal ? "text-cyan-400/30" : "text-white/30"}`} />
                                            <span className={`${isExternal ? "text-cyan-400/40" : "text-white/40"} text-xs font-black uppercase tracking-widest`}>Salida</span>
                                        </div>
                                        <button
                                            onClick={handleDeparture}
                                            className={`px-4 py-1.5 ${isExternal ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"} text-[10px] font-black rounded-xl border-2 flex items-center gap-2 uppercase transition-all shadow-lg active:scale-95`}
                                        >
                                            Marcar Salida
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Large Empty Space on the Right */}
                            <div className="flex-grow hidden md:block select-none opacity-5 pointer-events-none">
                                <div className={`h-20 w-full border-t border-r ${isExternal ? "border-cyan-400/10" : "border-white/5"} rounded-tr-3xl`}></div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full flex items-center justify-start py-4">
                            <div className="bg-slate-200/50 px-6 py-4 rounded-xl border border-dashed border-slate-300">
                                <h2 className="text-slate-400 text-xl font-bold uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Anchor className="w-5 h-5 opacity-40" />
                                    Muelle Disponible
                                </h2>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ArrivalsTable = ({ arrivals }: { arrivals: any[] }) => {
    const handleArrival = (vessel: any, type: 'internal' | 'external') => {
        const typeLabel = type === 'external' ? 'al Muelle Externo' : 'a Proagro';
        const color = type === 'external' ? '#06b6d4' : '#4f46e5';

        Swal.fire({
            title: '<span class="text-2xl font-black uppercase tracking-tight">Confirmar Llegada</span>',
            html: `¿Está seguro de marcar la llegada del buque <strong class="text-indigo-600">${vessel.name}</strong> ${typeLabel}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'SÍ, MARCAR LLEGADA',
            cancelButtonText: 'CANCELAR',
            confirmButtonColor: color,
            cancelButtonColor: '#64748b',
            reverseButtons: true,
        }).then((result: any) => {
            if (result.isConfirmed) {
                router.post(route('dock.vessel.mark-arrival', vessel.id as any), {
                    type: type
                } as any);
            }
        });
    };

    return (
        <Card className="border shadow-lg overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Próximos Arribos
                </CardTitle>
                <CardDescription>Programación estimada de buques</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Buque</th>
                                <th className="px-6 py-4">ETA / ETB</th>
                                <th className="px-6 py-4">Operación</th>
                                <th className="px-6 py-4">Muelle</th>
                                <th className="px-6 py-4 text-center">Llegada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {arrivals.map((arrival, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{arrival.name}</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-black">{arrival.type}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">ETA</span>
                                                <span className="font-mono text-xs">{arrival.eta}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">ETB</span>
                                                <span className="font-mono text-xs">{arrival.etb}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="font-bold border-slate-200">
                                            {arrival.operation_type}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-600 font-medium">{arrival.dock}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleArrival(arrival, 'internal')}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-all shadow-md active:scale-95 uppercase"
                                            >
                                                Marcar Llegada
                                            </button>

                                            <button
                                                onClick={() => handleArrival(arrival, 'external')}
                                                title="Marcar llegada a Muelle Externo"
                                                className="bg-cyan-500 hover:bg-cyan-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg transition-all shadow-md active:scale-95 uppercase flex items-center gap-1.5"
                                            >
                                                <MapPin className="w-3 h-3" />
                                                ME
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-4 space-y-4 bg-slate-50">
                    {arrivals.map((arrival, index) => (
                        <div key={index} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-slate-900">{arrival.name}</h4>
                                    <p className="text-[10px] text-slate-400 uppercase font-black">{arrival.type} • {arrival.dock}</p>
                                </div>
                                <Badge variant="outline" className="text-[10px] border-slate-200">
                                    {arrival.operation_type}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">ETA</p>
                                    <p className="text-xs font-mono font-bold">{arrival.eta}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">ETB</p>
                                    <p className="text-xs font-mono font-bold text-indigo-600">{arrival.etb}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleArrival(arrival, 'internal')}
                                    className="flex-1 bg-indigo-600 text-white text-[10px] font-black py-2 rounded-lg uppercase shadow-sm active:scale-95"
                                >
                                    Llegada
                                </button>
                                <button
                                    onClick={() => handleArrival(arrival, 'external')}
                                    className="flex-1 bg-cyan-500 text-white text-[10px] font-black py-2 rounded-lg uppercase shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                    <MapPin className="w-3 h-3" />
                                    ME
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default function Status({
    auth,
    active_vessels,
    arrivals,
}: {
    auth: any;
    active_vessels: any;
    arrivals: any[];
}) {
    const ecoVessel = active_vessels.eco;
    const whiskyVessel = active_vessels.whisky;
    const externalVessel = active_vessels.external;

    return (
        <DashboardLayout user={auth.user} header="Status Muelle">
            <Head title="Status Muelle" />

            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="mb-4">
                            <Link
                                href={route("dock.index")}
                                className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Volver al menú
                            </Link>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Operación Marítima
                        </h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            Terminal Marítima Pro-Agroindustria
                            <span className="text-slate-300">|</span>
                            {new Date().toLocaleDateString("es-MX", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                </div>

                {/* Main Visual: The Docks */}
                <div className="space-y-8">
                    {/* Render external dock only if occupied or relevant */}
                    <VesselCard vessel={externalVessel} side="EXTERNO" isExternal={true} />

                    <VesselCard vessel={ecoVessel} side="ECO" />
                    <VesselCard vessel={whiskyVessel} side="WHISKY" />
                </div>

                {/* Arrivals Section */}
                <div className="pt-4">
                    <ArrivalsTable arrivals={arrivals} />
                </div>

                {/* Weather / Alert Banner (Optional Unicorn Touch) */}
                <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-4 flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                        <Wind className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-800">
                            Condiciones Operativas
                        </h4>
                        <p className="text-sm text-amber-700 mt-1">
                            Salida del buque <strong>Ignacio Allende</strong>{" "}
                            sujeta a condiciones del tiempo. Muelle WHISKY
                            programado para descarga intensiva de UREA y DAP en
                            próximas semanas.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
            `}</style>
        </DashboardLayout>
    );
}
