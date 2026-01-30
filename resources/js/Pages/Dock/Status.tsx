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
}: {
    vessel: any;
    side: "ECO" | "WHISKY";
}) => {
    const isOccupied = vessel && vessel.name !== "-";

    return (
        <div
            className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 ${
                isOccupied
                    ? "border-blue-500 bg-gradient-to-br from-slate-900 to-blue-900 shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]"
                    : "border-slate-200 bg-slate-50 border-dashed opacity-70 hover:opacity-100 hover:border-slate-300"
            } p-6 h-full flex flex-col justify-between group`}
        >
            {/* Background Animation for Occupied */}
            {isOccupied && (
                <>
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl animate-pulse delay-700"></div>
                </>
            )}

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h3
                        className={`text-sm font-bold uppercase tracking-widest ${isOccupied ? "text-blue-200" : "text-slate-400"}`}
                    >
                        Muelle {side}
                    </h3>
                    {isOccupied ? (
                        <h2 className="text-3xl font-extrabold text-white mt-1 drop-shadow-lg tracking-tight">
                            {vessel.name}
                        </h2>
                    ) : (
                        <h2 className="text-2xl font-bold text-slate-300 mt-1">
                            Disponible
                        </h2>
                    )}
                </div>
                {isOccupied && (
                    <Badge
                        variant="outline"
                        className="bg-blue-500/10 text-blue-200 border-blue-500/50 backdrop-blur-md px-3 py-1 font-bold"
                    >
                        {vessel.type}
                    </Badge>
                )}
            </div>

            {/* Ship Visual (CSS Art / Icon) */}
            <div className="relative z-10 my-8 flex justify-center">
                {isOccupied ? (
                    <div className="animate-float">
                        {/* Simple illustration representation using Lucid icons scaled up */}
                        <Ship
                            className={`w-32 h-32 ${side === "ECO" ? "text-blue-400" : "text-indigo-400"} drop-shadow-2xl`}
                            strokeWidth={1}
                        />
                        <div className="absolute bottom-[-10px] w-40 h-4 bg-black/20 blur-xl rounded-full"></div>
                    </div>
                ) : (
                    <Anchor className="w-20 h-20 text-slate-200" />
                )}
            </div>

            {/* Stats Grid */}
            {isOccupied && (
                <div className="relative z-10 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                        <p className="text-blue-200/70 text-xs">Operación</p>
                        <p className="text-white font-bold">
                            {vessel.operation_type}
                        </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                        <p className="text-blue-200/70 text-xs">Estadía</p>
                        <p className="text-white font-bold">
                            {vessel.stay_days} Días
                        </p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10 col-span-2">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-blue-200/70 text-xs">
                                    Atraco (ETB)
                                </p>
                                <p className="text-white font-mono">
                                    {vessel.etb || vessel.berthal_datetime}
                                </p>
                            </div>
                            <Clock className="w-4 h-4 text-blue-400" />
                        </div>
                    </div>
                </div>
            )}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
