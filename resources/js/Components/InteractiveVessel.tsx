import React, { useState } from 'react';
import { Ship, Info, Maximize2, Minimize2, Anchor, Droplets, ChevronRight, Activity } from 'lucide-react';
import { Badge } from "@/Components/ui/badge";

interface Hatch {
    id: number;
    name: string;
    loaded_mt: number;
    percent: number;
}

interface VesselStats {
    total_mt: number;
    loaded_mt: number;
    pending_mt: number;
    progress: number;
    on_board_mt?: number;
}

interface InteractiveVesselProps {
    vessel: {
        id: string;
        name: string;
        stats: VesselStats;
        hatches: Hatch[];
        product: string;
        is_discharge?: boolean;
    };
    isExternal?: boolean;
}

const InteractiveVessel: React.FC<InteractiveVesselProps> = ({ vessel, isExternal = false }) => {
    const [selectedHatch, setSelectedHatch] = useState<number | null>(null);

    if (!vessel || vessel.name === "-") return null;

    const isDischarge = vessel.is_discharge;
    const accentColor = isExternal ? '#06b6d4' : '#3b82f6';
    const mainColor = '#475569'; // Steel Blue Professional

    const ShipSVG = ({ vertical = false }: { vertical?: boolean }) => {
        const viewBox = vertical ? "0 0 160 520" : "0 0 640 160";

        return (
            <svg
                viewBox={viewBox}
                className={`w-full h-full transition-all duration-700 ${vertical ? '' : 'animate-sway'}`}
            >
                <defs>
                    <linearGradient id={`${vessel.id}-hull`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#64748b" />
                        <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>

                    <pattern id="draft-lines" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="5" x2="5" y2="5" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="0.5" />
                    </pattern>
                </defs>

                <g className="vessel-body">
                    {vertical ? (
                        // Vertical Hulk (Mobile)
                        <>
                            <path d="M 40,10 L 120,10 L 140,80 L 140,440 L 120,510 L 40,510 L 20,440 L 20,80 Z" fill={`url(#${vessel.id}-hull)`} stroke="#0f172a" strokeWidth="2" />
                            {/* Bridge */}
                            <rect x="50" y="20" width="60" height="30" fill="#334155" rx="2" />
                            <rect x="55" y="25" width="50" height="10" fill="#0ea5e9" fillOpacity="0.3" />
                        </>
                    ) : (
                        // Horizontal Hulk (Desktop)
                        <>
                            <path d="M 10,80 L 70,30 L 580,30 L 630,80 L 580,130 L 70,130 Z" fill={`url(#${vessel.id}-hull)`} stroke="#0f172a" strokeWidth="2" />
                            {/* Draft Lines */}
                            <path d="M 10,80 L 70,130 L 580,130 L 630,80" fill="url(#draft-lines)" />

                            {/* Expert Details: Cranes & Bridge */}
                            <g transform="translate(30, 45)">
                                <path d="M 0,35 L 5,0 L 45,0 L 50,35 Z" fill="#334155" /> {/* Bridge structure */}
                                <rect x="10" y="5" width="30" height="12" fill="#0ea5e9" fillOpacity="0.2" rx="1" />
                            </g>

                            {/* Cranes between hatches */}
                            {[160, 300, 440].map((cx, i) => (
                                <g key={i} transform={`translate(${cx}, 30)`}>
                                    <rect x="0" y="-15" width="4" height="15" fill="#475569" />
                                    <path d="M 2,-15 L 40,-5" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                                </g>
                            ))}
                        </>
                    )}

                    {vessel.hatches.map((hatch, index) => {
                        const total = vessel.hatches.length;
                        let rx, ry, rw, rh;

                        if (vertical) {
                            rw = 80; rh = 340 / total; rx = 40; ry = 100 + (index * (rh + 10));
                        } else {
                            rw = 420 / total; rh = 60; rx = 120 + (index * (rw + 8)); ry = 50;
                        }

                        const isSelected = selectedHatch === hatch.id;

                        return (
                            <g key={hatch.id} className="cursor-pointer group" onClick={() => setSelectedHatch(isSelected ? null : hatch.id)}>
                                <rect
                                    x={rx} y={ry} width={rw} height={rh}
                                    fill="#0f172a"
                                    stroke={isSelected ? accentColor : "rgba(255,255,255,0.15)"}
                                    strokeWidth={isSelected ? "4" : "2"}
                                    rx="12"
                                    className="transition-all duration-300"
                                />
                                {/* Progress Bar inside Hatch */}
                                <rect
                                    x={rx + 2}
                                    y={ry + rh - 2 - ((rh - 4) * hatch.percent / 100)}
                                    width={rw - 4}
                                    height={(rh - 4) * hatch.percent / 100}
                                    fill={isSelected ? accentColor : (isExternal ? '#22d3ee' : '#3b82f6')}
                                    fillOpacity={isSelected ? "1" : "0.5"}
                                    rx="2"
                                    className="transition-all duration-1000 ease-out"
                                />
                                <text
                                    x={rx + rw / 2}
                                    y={ry + rh / 2 + 4}
                                    textAnchor="middle"
                                    className="fill-white/80 pointer-events-none font-black text-[9px] uppercase"
                                >
                                    {`B${hatch.id}`}
                                </text>
                                {isSelected && (
                                    <circle cx={rx + rw / 2} cy={ry - 10} r="4" fill={accentColor} className="animate-ping" />
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>
        );
    };

    return (
        <div className="relative bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-10 border border-white/5 shadow-2xl transition-all duration-500">
            {/* Header / Main Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isExternal ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-500/10 text-blue-400'} border border-white/5`}>
                        <Activity size={28} className={vessel.stats.progress > 0 && vessel.stats.progress < 100 ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {isDischarge ? <Droplets size={12} className="text-amber-400" /> : <Ship size={12} className="text-blue-400" />}
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                {isDischarge ? 'Carga Remanente' : 'Total Consolidado'}
                            </span>
                        </div>
                        <h4 className="text-4xl font-black text-white tracking-tighter leading-none">
                            {isDischarge ? vessel.stats.on_board_mt?.toLocaleString() : vessel.stats.loaded_mt?.toLocaleString()}
                            <span className="text-sm font-bold text-white/30 ml-2 tracking-normal uppercase">TM</span>
                        </h4>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Capacidad Total</span>
                        <span className="text-2xl font-black text-white/70">{vessel.stats.total_mt?.toLocaleString()} TM</span>
                    </div>
                </div>
            </div>

            {/* Global Efficiency Bar */}
            <div className="mb-12">
                <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Eficiencia de {isDischarge ? 'Vaciado' : 'Carga'}</span>
                    <span className={`text-2xl font-black ${isExternal ? 'text-cyan-400' : 'text-blue-400'}`}>{vessel.stats.progress}%</span>
                </div>
                <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden p-0.5">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${isExternal ? 'bg-cyan-500' : 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'}`}
                        style={{ width: `${vessel.stats.progress}%` }}
                    />
                </div>
            </div>

            {/* Ship Representation Section */}
            <div className="space-y-12 transition-all duration-700">
                {/* Responsive Toggling: No Duplication */}
                <div className="w-full">
                    {/* Desktop View */}
                    <div className="hidden md:block w-full px-4">
                        <ShipSVG vertical={false} />
                    </div>
                    {/* Mobile View */}
                    <div className="md:hidden w-full flex justify-center py-4">
                        <div className="w-40">
                            <ShipSVG vertical={true} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    {/* Selected Hatch Console */}
                    <div className="lg:col-span-12 xl:col-span-8">
                        <div className="bg-slate-800/40 border border-white/5 rounded-[2.5rem] p-8 h-full flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Anchor size={120} />
                            </div>

                            {selectedHatch ? (
                                <div className="relative z-10 flex flex-col justify-center gap-6 h-full">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Badge className={`${isExternal ? 'bg-cyan-500 text-cyan-950' : 'bg-blue-600 text-white'} font-black px-4 py-1.5 rounded-lg border-none`}>
                                                BODEGA {selectedHatch}
                                            </Badge>
                                            <span className="text-white/60 font-black text-[11px] uppercase tracking-widest italic">Activa</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Carga Actual</span>
                                            <h3 className="text-5xl font-black text-white tracking-tighter flex items-end gap-2">
                                                {vessel.hatches.find(h => h.id === selectedHatch)?.loaded_mt?.toLocaleString()}
                                                <span className="text-xs font-black text-white/40 mb-1 tracking-widest uppercase">TONELADAS</span>
                                            </h3>
                                        </div>

                                        <div className="bg-black/40 p-5 rounded-3xl border border-white/10 flex flex-col items-center justify-center">
                                            <span className="text-[10px] font-black text-white/40 uppercase mb-1 tracking-widest">ESTADO (%)</span>
                                            <span className={`text-5xl font-black ${isExternal ? 'text-cyan-400' : 'text-blue-400'}`}>
                                                {vessel.hatches.find(h => h.id === selectedHatch)?.percent}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-6">
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 text-white/20">
                                        <Info size={24} />
                                    </div>
                                    <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] text-center">
                                        Seleccione una bodega para <br /> auditoría de carga
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Unified General Stats Console */}
                    <div className="lg:col-span-12 xl:col-span-4">
                        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-8 group/stat hover:bg-white/10 transition-all duration-300">
                            {/* Pendiente Group */}
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block">PENDIENTE</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white block leading-tight tracking-tighter">{vessel.stats.pending_mt?.toLocaleString()}</span>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">TM</span>
                                </div>
                            </div>

                            {/* Divider Line */}
                            <div className="h-px w-full bg-white/5" />

                            {/* Producto Group */}
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block">PRODUCTO</span>
                                <span className="text-xl font-bold text-white/90 uppercase leading-tight line-clamp-2 tracking-tight">{vessel.product}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes sway {
                    0%, 100% { transform: translateY(0) rotate(0); }
                    50% { transform: translateY(-3px) rotate(0.05deg); }
                }
                .animate-sway {
                    animation: sway 10s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default InteractiveVessel;
