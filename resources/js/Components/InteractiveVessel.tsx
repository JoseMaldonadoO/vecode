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
                style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }}
            >
                <defs>
                    <linearGradient id={`${vessel.id}-hull`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>

                    <linearGradient id="hatcher-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={isExternal ? '#22d3ee' : '#3b82f6'} stopOpacity="0.7" />
                        <stop offset="100%" stopColor={isExternal ? '#0891b2' : '#1d4ed8'} stopOpacity="0.9" />
                    </linearGradient>
                </defs>

                <g className="vessel-body">
                    {vertical ? (
                        // Vertical Hulk (Mobile) - Sharper Capsule
                        <>
                            <rect x="20" y="30" width="120" height="460" fill={`url(#${vessel.id}-hull)`} stroke="#475569" strokeWidth="3" rx="60" />
                            {/* Bow Diamond */}
                            <rect x="65" y="10" width="30" height="30" fill="#475569" transform="rotate(45, 80, 25)" rx="2" />
                            {/* Stern Finish */}
                            <path d="M 20,440 A 60,60 0 0 0 140,440 L 140,490 L 20,490 Z" fill="#1e293b" opacity="0.4" />
                        </>
                    ) : (
                        // Horizontal Hulk (Desktop) - Aligned & Sharp
                        <>
                            {/* Main Capsule Body */}
                            <rect x="30" y="30" width="580" height="100" fill={`url(#${vessel.id}-hull)`} stroke="#475569" strokeWidth="3" rx="50" />

                            {/* Bow Detail (Diamond on the left) */}
                            <rect x="15" y="65" width="30" height="30" fill="#475569" transform="rotate(45, 30, 80)" rx="2" />

                            {/* Stern Detail (Right finish accent) */}
                            <path d="M 550,30 L 580,30 A 50,50 0 0 1 580,130 L 550,130 Z" fill="#0f172a" fillOpacity="0.4" />

                            {/* Subtle line to show structure */}
                            <line x1="100" y1="31.5" x2="550" y2="31.5" stroke="white" strokeOpacity="0.1" strokeWidth="2" />
                        </>
                    )}

                    {vessel.hatches.map((hatch, index) => {
                        const total = vessel.hatches.length;
                        let rx, ry, rw, rh;

                        if (vertical) {
                            rw = 80; rh = 340 / total; rx = 40; ry = 100 + (index * (rh + 10));
                        } else {
                            // Perfectly centered hatches
                            rw = 440 / total; rh = 70; rx = 90 + (index * (rw + 8)); ry = 45;
                        }

                        const isSelected = selectedHatch === hatch.id;

                        return (
                            <g key={hatch.id} className="cursor-pointer group" onClick={() => setSelectedHatch(isSelected ? null : hatch.id)}>
                                {/* Hold Container */}
                                <rect
                                    x={rx} y={ry} width={rw} height={rh}
                                    fill="#0f172a"
                                    fillOpacity="0.5"
                                    stroke={isSelected ? accentColor : "#475569"}
                                    strokeWidth={isSelected ? "3" : "2"}
                                    rx="8"
                                    className="transition-all duration-300 group-hover:stroke-slate-400"
                                />

                                {/* Fill Level (Progress) - Sharp corners for better definition */}
                                <rect
                                    x={rx + 2}
                                    y={ry + rh - 2 - ((rh - 4) * hatch.percent / 100)}
                                    width={rw - 4}
                                    height={(rh - 4) * hatch.percent / 100}
                                    fill={isSelected ? accentColor : `url(#hatcher-fill)`}
                                    fillOpacity={isSelected ? "1" : "0.8"}
                                    rx="4"
                                    className="transition-all duration-1000 ease-out"
                                />

                                {hatch.percent > 0 && hatch.percent < 100 && (
                                    <line
                                        x1={rx + 2}
                                        y1={ry + rh - 2 - ((rh - 4) * hatch.percent / 100)}
                                        x2={rx + rw - 2}
                                        y2={ry + rh - 2 - ((rh - 4) * hatch.percent / 100)}
                                        stroke={isExternal ? '#22d3ee' : '#60a5fa'}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        className="animate-pulse"
                                    />
                                )}

                                <text
                                    x={rx + rw / 2}
                                    y={ry + rh / 2 + 5}
                                    textAnchor="middle"
                                    className={`fill-white pointer-events-none font-black text-[10px] uppercase tracking-wider ${isSelected ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'} transition-opacity`}
                                    style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}
                                >
                                    {`B${hatch.id}`}
                                </text>

                                {isSelected && (
                                    <circle cx={rx + rw / 2} cy={ry + rh + 12} r="3" fill={accentColor} className="animate-bounce" />
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
                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Badge className={`${isExternal ? 'bg-cyan-500 text-cyan-950' : 'bg-blue-600 text-white'} font-black px-4 py-1.5 rounded-lg border-none`}>
                                                BODEGA {selectedHatch}
                                            </Badge>
                                            <span className="text-white/60 font-black text-[11px] uppercase tracking-widest italic">Activa</span>
                                        </div>

                                        <div className="bg-black/50 px-6 py-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center backdrop-blur-md">
                                            <span className="text-[9px] font-black text-white/40 uppercase mb-1 tracking-widest leading-none">ESTADO</span>
                                            <span className={`text-4xl font-black leading-none ${isExternal ? 'text-cyan-400' : 'text-blue-400'}`}>
                                                {vessel.hatches.find(h => h.id === selectedHatch)?.percent}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block mb-2">Carga Consolidada</span>
                                        <h3 className="text-6xl font-black text-white tracking-tighter flex items-end gap-3 flex-wrap">
                                            {vessel.hatches.find(h => h.id === selectedHatch)?.loaded_mt?.toLocaleString()}
                                            <span className="text-xs font-black text-white/40 mb-2 tracking-widest uppercase">TONELADAS</span>
                                        </h3>
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
