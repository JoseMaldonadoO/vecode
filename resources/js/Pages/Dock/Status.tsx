import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
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
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
    Card as TremorCard,
    Title,
    Text,
    Metric,
    Flex,
    ProgressBar,
    Tracker,
    Color,
} from "@tremor/react";

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
                            <div className="flex-shrink-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 min-w-[360px] shadow-2xl">
                                <div className="mb-6">
                                    <h2 className="text-4xl font-black text-white tracking-tighter leading-none mb-3">
                                        {vessel.name}
                                    </h2>
                                    <Badge
                                        variant="outline"
                                        className={`bg-transparent font-black text-xs uppercase tracking-[0.2em] px-3 py-0.5 border-white/20 text-white/70`}
                                    >
                                        {vessel.type}
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-white/30" />
                                            <span className="text-white/40 text-xs font-black uppercase tracking-widest">Operación</span>
                                        </div>
                                        <span className="text-white font-bold text-lg tracking-wide">{vessel.operation_type}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-white/30" />
                                            <span className="text-white/40 text-xs font-black uppercase tracking-widest">Estadía</span>
                                        </div>
                                        <span className="text-white font-bold text-lg">{vessel.stay_days} <span className="text-white/40 font-medium text-xs ml-0.5">Días</span></span>
                                    </div>

                                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-white/30" />
                                            <span className="text-white/40 text-xs font-black uppercase tracking-widest">
                                                {isExternal ? "Llegada" : "Atraco"}
                                            </span>
                                        </div>
                                        <span className="text-white font-mono font-bold text-sm tracking-tight">{isExternal ? vessel.external_arrival : (vessel.etb || vessel.berthal_datetime)}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-2">
                                            <Anchor className="w-4 h-4 text-white/30" />
                                            <span className="text-white/40 text-xs font-black uppercase tracking-widest">Status</span>
                                        </div>
                                        <div className={`px-3 py-1 ${isExternal ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/20" : "bg-green-500/20 text-green-400 border-green-500/20"} text-xs font-black rounded-full border flex items-center gap-2 uppercase`}>
                                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isExternal ? "bg-cyan-500" : "bg-green-500"}`}></span>
                                            Ocupado
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Large Empty Space on the Right */}
                            <div className="flex-grow hidden md:block select-none opacity-5 pointer-events-none">
                                <div className="h-20 w-full border-t border-r border-white/5 rounded-tr-3xl"></div>
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

const ArrivalsTable = ({ arrivals }: { arrivals: any[] }) => (
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
                            <th className="px-6 py-4">Estadía Est.</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {arrivals.map((arrival, idx) => (
                            <tr
                                key={idx}
                                className="hover:bg-slate-50 transition-colors"
                            >
                                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                        {arrival.type}
                                    </div>
                                    {arrival.name}
                                </td>
                                <td className="px-6 py-4 font-mono text-slate-600">
                                    <div>ETA: {arrival.eta}</div>
                                    <div className="text-indigo-600 font-bold">
                                        ETB: {arrival.etb}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-800">
                                        {arrival.operation_type}
                                    </div>
                                    {arrival.product && (
                                        <div className="text-xs text-slate-500">
                                            {arrival.product}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        variant="outline"
                                        className="border-indigo-200 text-indigo-700 bg-indigo-50"
                                    >
                                        {arrival.dock}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-600">
                                    {arrival.est_stay} Días
                                </td>
                                <td className="px-6 py-4">
                                    {arrival.is_anchored ? (
                                        <Badge className="bg-amber-500 hover:bg-amber-600">
                                            <Anchor className="w-3 h-3 mr-1" />{" "}
                                            Fondeado
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-300">
                                            Programado
                                        </Badge>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
                {arrivals.map((arrival, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-xl border border-slate-100 shadow-sm p-4"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                    {arrival.type}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">
                                        {arrival.name}
                                    </h4>
                                    <Badge
                                        variant="outline"
                                        className="text-xs border-indigo-200 text-indigo-600 bg-indigo-50 mt-1"
                                    >
                                        {arrival.dock}
                                    </Badge>
                                </div>
                            </div>
                            {arrival.is_anchored ? (
                                <Badge className="bg-amber-500 text-xs">
                                    <Anchor className="w-3 h-3" />
                                </Badge>
                            ) : (
                                <Badge className="bg-slate-200 text-slate-600 text-xs">
                                    Prog.
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-3 bg-slate-50 p-3 rounded-lg">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                                    ETA
                                </p>
                                <p className="font-mono text-slate-700">
                                    {arrival.eta}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                                    ETB
                                </p>
                                <p className="font-mono text-indigo-600 font-bold">
                                    {arrival.etb}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm font-medium text-slate-800">
                                    {arrival.operation_type}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {arrival.product}
                                </p>
                            </div>
                            <span className="text-xs font-bold text-slate-400">
                                {arrival.est_stay} Días Est.
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

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
