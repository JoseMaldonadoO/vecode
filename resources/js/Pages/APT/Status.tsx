import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react'; // Link removed as unused
import { Warehouse, Box, Truck, CheckCircle, AlertTriangle, ArrowRight, Package } from 'lucide-react';

// --- Unicorn Components ---

const WarehouseCard = ({ wh }: { wh: any }) => {
    // Almacén 1-3 (Flat)
    const isOccupied = wh.occupied;

    return (
        <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 group h-full
            ${isOccupied
                ? 'border-indigo-500 bg-gradient-to-br from-indigo-900 to-slate-900 shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)]'
                : 'border-slate-200 bg-white/50 border-dashed hover:border-indigo-300 hover:bg-white'
            }`}>

            {/* Background Effects */}
            {isOccupied && (
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
            )}

            <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className={`text-sm font-bold uppercase tracking-wider ${isOccupied ? 'text-indigo-200' : 'text-slate-500'}`}>
                            Ubicación
                        </h3>
                        <h2 className={`text-2xl font-extrabold ${isOccupied ? 'text-white' : 'text-slate-700'}`}>
                            {wh.name}
                        </h2>
                    </div>
                    <div className={`p-2 rounded-xl ${isOccupied ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-100 text-slate-400'}`}>
                        <Warehouse className="w-8 h-8" />
                    </div>
                </div>

                {/* Status Content */}
                {isOccupied ? (
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">{wh.details?.product || 'Producto Desconocido'}</p>
                                    <p className="text-indigo-200 text-xs text-wrap break-all">Folio: {wh.details?.folio}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                                <div>
                                    <span className="block text-indigo-300">Operador</span>
                                    <span className="text-white font-medium">{wh.details?.operator_name?.split(' ')[0]}</span>
                                </div>
                                <div>
                                    <span className="block text-indigo-300">Placas</span>
                                    <span className="text-white font-medium">{wh.details?.vehicle_plate || wh.details?.tractor_plate}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                            Ocupado / En Uso
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                            <CheckCircle className="w-8 h-8 text-slate-300" />
                        </div>
                        <span className="font-medium">Disponible</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const CubicleGrid = ({ wh }: { wh: any }) => {
    // Almacén 4-5 (Cubicles)
    const occupancyRate = wh.occupancy_percentage;

    // Explicit Color Maps for Tailwind
    const getBadgeStyle = (rate: number) => {
        if (rate > 80) return 'bg-red-100 text-red-700 border-red-200';
        if (rate > 40) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-green-100 text-green-700 border-green-200';
    };

    const getProgressStyle = (rate: number) => {
        // Gradient logic is fine as inline style or explicit classes
        // We'll keep the inline gradient style used below, but ensure the badge uses the function above.
        return {};
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                        {wh.name}
                        <span className={`text-xs px-2 py-1 rounded-full border ${getBadgeStyle(occupancyRate)}`}>
                            {occupancyRate}% Ocupado
                        </span>
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Capacidad: 8 Cubículos (Divisiones Internas)</p>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                    <Box className="w-6 h-6 text-indigo-600" />
                </div>
            </div>

            {/* Grid */}
            <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1 bg-slate-50/50">
                {wh.cubicles.map((cubicle: any) => (
                    <div
                        key={cubicle.id}
                        className={`relative rounded-xl p-4 border transition-all duration-300 group
                            ${cubicle.occupied
                                ? 'bg-white border-indigo-200 shadow-md ring-2 ring-indigo-500/20'
                                : 'bg-slate-50 border-slate-200 border-dashed hover:border-slate-300 hover:bg-white'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${cubicle.occupied ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                                C-{cubicle.id}
                            </span>
                            {cubicle.occupied ? (
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            ) : (
                                <div className="w-2 h-2 bg-slate-300 rounded-full" />
                            )}
                        </div>

                        {cubicle.occupied ? (
                            <div className="space-y-2 animate-fade-in">
                                <div className="flex items-start gap-2">
                                    <Package className="w-4 h-4 text-indigo-500 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">
                                            {cubicle.details?.product}
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                                    <p className="truncate">Op: {cubicle.details?.operator_name?.split(' ')[0]}</p>
                                    <p className="font-mono text-[10px] text-slate-400">{cubicle.details?.folio}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-16 flex items-center justify-center text-slate-300 text-xs font-medium">
                                Libre
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer Bar */}
            <div className="h-2 w-full bg-slate-100">
                <div
                    className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r from-green-400 via-amber-400 to-red-500`}
                    style={{ width: `${occupancyRate}%` }}
                />
            </div>
        </div>
    );
};


export default function Status({ auth, warehouses }: { auth: any, warehouses: any[] }) {
    const flatWarehouses = warehouses.filter(w => w.type === 'flat');
    const cubicledWarehouses = warehouses.filter(w => w.type === 'cubicles');

    return (
        <DashboardLayout user={auth.user} header="Status APT">
            <Head title="Status APT" />

            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 animate-fade-in">

                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Estado de Almacenes</h1>
                        <p className="text-slate-500 mt-1">Visualización entiempo real de la ocupación en Terminal APT.</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 bg-slate-50 px-3 py-1 rounded-full border">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Actualizado: {new Date().toLocaleTimeString()}
                    </div>
                </div>

                {/* Row 1: Flat Warehouses (1-3) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {flatWarehouses.map((wh, idx) => (
                        <div key={idx} className="h-64">
                            <WarehouseCard wh={wh} />
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 text-slate-300">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-xs font-bold uppercase tracking-widest">Almacenes Divisionados</span>
                    <div className="h-px bg-slate-200 flex-1" />
                </div>

                {/* Row 2: Cubicled Warehouses (4-5) */}
                <div className="space-y-8">
                    {cubicledWarehouses.map((wh, idx) => (
                        <CubicleGrid key={idx} wh={wh} />
                    ))}
                </div>

            </div>

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
                .animate-fade-in {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
            `}</style>
        </DashboardLayout>
    );
}
