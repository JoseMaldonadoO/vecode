import React, { useState } from 'react';
import { Ship, Info, Maximize2, Minimize2, Anchor, Droplets } from 'lucide-react';
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
    const [isExpanded, setIsExpanded] = useState(false);
    const [hoveredHatch, setHoveredHatch] = useState<number | null>(null);

    if (!vessel || vessel.name === "-") return null;

    const isDischarge = vessel.is_discharge;
    const accentColor = isExternal ? '#22d3ee' : '#3b82f6';
    const toggleExpand = () => setIsExpanded(!isExpanded);

    const ShipSVG = ({ vertical = false }: { vertical?: boolean }) => {
        const viewBox = vertical ? "0 0 160 520" : "0 0 640 180";

        return (
            <svg
                viewBox={viewBox}
                className={`w-full h-full transition-all duration-1000 ease-in-out ${vertical ? 'max-h-[65vh]' : 'animate-float'}`}
            >
                <defs>
                    <linearGradient id={`${vessel.id}-hull-grad`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="50%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>

                    <filter id="glow-vessel" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    <linearGradient id="water-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor={accentColor} stopOpacity="0.1" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>

                {!vertical && (
                    <path
                        d="M 0,140 Q 160,130 320,140 T 640,140"
                        fill="none"
                        stroke="url(#water-grad)"
                        strokeWidth="4"
                        className="animate-pulse"
                    />
                )}

                <g filter="url(#glow-vessel)">
                    {vertical ? (
                        <path
                            d="M 45,15 L 115,15 L 135,80 L 135,440 L 115,505 L 45,505 L 25,440 L 25,80 Z"
                            fill={`url(#${vessel.id}-hull-grad)`}
                            stroke={accentColor}
                            strokeWidth="1.5"
                            strokeOpacity="0.4"
                        />
                    ) : (
                        <path
                            d="M 15,85 L 85,35 L 535,35 L 615,85 L 535,135 L 85,135 Z"
                            fill={`url(#${vessel.id}-hull-grad)`}
                            stroke={accentColor}
                            strokeWidth="1.5"
                            strokeOpacity="0.4"
                        />
                    )}

                    {vertical ? (
                        <g transform="translate(45, 15)">
                            <rect x="0" y="0" width="70" height="40" fill="#1e293b" stroke={accentColor} strokeOpacity="0.3" rx="2" />
                            <rect x="10" y="5" width="50" height="15" fill={accentColor} fillOpacity="0.1" />
                        </g>
                    ) : (
                        <g transform="translate(25, 55)">
                            <path d="M 0,30 L 10,0 L 50,0 L 60,30 Z" fill="#1e293b" stroke={accentColor} strokeOpacity="0.5" />
                            <rect x="15" y="5" width="30" height="10" fill={accentColor} fillOpacity="0.2" rx="1" />
                            <line x1="30" y1="0" x2="30" y2="-15" stroke={accentColor} strokeWidth="1" />
                            <circle cx="30" cy="-15" r="2" fill={accentColor} className="animate-pulse" />
                        </g>
                    )}

                    {vessel.hatches.map((hatch, index) => {
                        const total = vessel.hatches.length;
                        let rx, ry, rw, rh;

                        if (vertical) {
                            rw = 80;
                            rh = 320 / total;
                            rx = 40;
                            ry = 90 + (index * (rh + 12));
                        } else {
                            rw = 420 / total;
                            rh = 64;
                            rx = 100 + (index * (rw + 12));
                            ry = 53;
                        }

                        const isHovered = hoveredHatch === hatch.id;

                        return (
                            <g key={hatch.id} className="transition-all duration-300">
                                <rect
                                    x={rx} y={ry} width={rw} height={rh}
                                    fill="#0f172a"
                                    stroke={isHovered ? accentColor : "rgba(255,255,255,0.1)"}
                                    strokeWidth={isHovered ? "2.5" : "1"}
                                    rx="6"
                                    className="transition-all duration-300"
                                />
                                <rect x={rx + 4} y={ry + 4} width={rw - 8} height={rh - 8} fill="rgba(255,255,255,0.02)" rx="3" />
                                <rect
                                    x={rx + 6}
                                    y={ry + rh - 6 - ((rh - 12) * hatch.percent / 100)}
                                    width={rw - 12}
                                    height={(rh - 12) * hatch.percent / 100}
                                    fill={accentColor}
                                    fillOpacity={isHovered ? "0.9" : "0.6"}
                                    rx="3"
                                    className="transition-all duration-1000 ease-out"
                                />
                                <rect
                                    x={rx} y={ry} width={rw} height={rh}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredHatch(hatch.id)}
                                    onMouseLeave={() => setHoveredHatch(null)}
                                />
                                <text
                                    x={rx + rw / 2}
                                    y={ry + rh / 2 + 4}
                                    textAnchor="middle"
                                    className={`fill-white pointer-events-none transition-all duration-500 font-bold ${isExpanded ? 'opacity-100 text-[10px]' : 'opacity-0 text-[0px]'}`}
                                >
                                    B{hatch.id}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>
        );
    };

    return (
        <div className={`relative transition-all duration-700 ${isExpanded ? 'bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-10 mt-6 ring-1 ring-white/10 shadow-2xl' : 'bg-transparent'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-3xl ${isExternal ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-500/10 text-blue-400'} border border-white/5 shadow-inner`}>
                        <Ship size={32} className={`${vessel.stats.progress > 0 && vessel.stats.progress < 100 ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 mb-1.5 flex items-center gap-2">
                            {isDischarge ? <Droplets size={12} className="text-amber-400" /> : <Anchor size={12} className="text-green-400" />}
                            {isDischarge ? 'Carga a Bordo' : 'Progreso de Carga'}
                        </p>
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-black text-white tracking-tighter drop-shadow-md">
                                {isDischarge ? vessel.stats.on_board_mt?.toLocaleString() : vessel.stats.loaded_mt?.toLocaleString()}
                            </span>
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">TM <span className="mx-1">/</span> {vessel.stats.total_mt?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={toggleExpand}
                    className={`group flex items-center gap-3 px-6 py-3 rounded-2xl border-2 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${isExternal
                        ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
                        }`}
                >
                    {isExpanded ? <Minimize2 size={16} className="group-hover:scale-110 transition-transform" /> : <Maximize2 size={16} className="group-hover:scale-110 transition-transform" />}
                    {isExpanded ? 'COLAPSAR VISTA' : 'ESPECIFICACIONES BODEGAS'}
                </button>
            </div>

            <div className="mb-10 relative group/progress">
                <div className="flex justify-between items-center mb-3 px-1">
                    <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">{isDischarge ? 'Progreso de Vaciado' : 'Eficiencia de Operación'}</span>
                    <span className={`text-[11px] font-black ${isExternal ? 'text-cyan-400' : 'text-blue-400'} bg-white/5 px-2.5 py-1 rounded-lg border border-white/10`}>
                        {vessel.stats.progress}%
                    </span>
                </div>
                <div className="h-4 w-full bg-slate-950/80 rounded-full overflow-hidden border border-white/10 shadow-inner p-1">
                    <div
                        className={`h-full transition-all duration-1000 ease-out relative rounded-full ${isExternal ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}
                        style={{ width: `${vessel.stats.progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-shimmer skew-x-12"></div>
                    </div>
                </div>
            </div>

            <div className={`relative transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col items-center gap-12 ${isExpanded ? 'opacity-100 h-auto' : 'opacity-60 h-[100px] hover:opacity-100 overflow-hidden'}`}>
                <div className="w-full flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-grow w-full">
                        <ShipSVG vertical={false} />
                    </div>

                    {isExpanded && (
                        <div className="w-full md:w-[350px] space-y-6 animate-in slide-in-from-bottom-8 duration-700">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 group/stat hover:bg-white/10 transition-all">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5">{isDischarge ? 'Faltante' : 'Pendiente'}</p>
                                    <p className="text-2xl font-black text-white">{vessel.stats.pending_mt?.toLocaleString()}</p>
                                    <p className="text-[9px] font-bold text-white/20 mt-1">TONELADAS MÉTRICAS</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 group/stat hover:bg-white/10 transition-all">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5">Materia Prima</p>
                                    <p className="text-sm font-black text-white line-clamp-2 leading-tight h-10">{vessel.product}</p>
                                </div>
                            </div>

                            <div className={`relative overflow-hidden min-h-[140px] transition-all duration-500 rounded-[2rem] border-2 p-6 flex flex-col justify-center ${hoveredHatch
                                ? (isExternal ? 'bg-cyan-500/10 border-cyan-400/40 shadow-[0_0_40px_rgba(34,211,238,0.15)]' : 'bg-blue-500/10 border-blue-400/40 shadow-[0_0_40px_rgba(59,130,246,0.15)]')
                                : 'bg-white/5 border-white/10 opacity-60'
                                }`}>
                                {hoveredHatch ? (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full animate-ping ${isExternal ? 'bg-cyan-400' : 'bg-blue-400'}`}></div>
                                                <span className="text-xl font-black text-white tracking-tighter uppercase">Bodega {hoveredHatch}</span>
                                            </div>
                                            <Badge className={`px-3 py-1 font-black text-xs ${isExternal ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-500/20 text-blue-400'} border-none`}>
                                                {vessel.hatches.find(h => h.id === hoveredHatch)?.percent}% {isDischarge ? 'A bordo' : 'Cargado'}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-3xl font-black text-white tracking-tighter">
                                                {vessel.hatches.find(h => h.id === hoveredHatch)?.loaded_mt?.toLocaleString()}
                                                <span className="text-xs font-bold text-white/30 ml-2">TM</span>
                                            </div>
                                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{isDischarge ? 'Remanente en Bodega' : 'Total Consolidado'}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 py-4">
                                        <div className="relative">
                                            <Info size={32} className="text-white/10" />
                                            <div className="absolute inset-0 bg-white/5 blur-xl"></div>
                                        </div>
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center leading-relaxed">Pase el cursor sobre una bodega<br />para auditoría técnica</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {isExpanded && (
                    <div className="w-full md:hidden py-4 animate-in slide-in-from-top-4 duration-500">
                        <ShipSVG vertical={true} />
                        <p className="text-[10px] text-center text-white/40 font-black uppercase tracking-widest mt-6 animate-pulse">
                            Deslice para explorar la cubierta
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes float-ship {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    25% { transform: translateY(-3px) rotate(0.1deg); }
                    75% { transform: translateY(2px) rotate(-0.1deg); }
                }
                .animate-float {
                    animation: float-ship 12s ease-in-out infinite;
                }
                @keyframes shimmer-fast {
                    0% { transform: translateX(-150%) skewX(-15deg); }
                    100% { transform: translateX(150%) skewX(-15deg); }
                }
                .animate-shimmer {
                    animation: shimmer-fast 3s infinite linear;
                }
            `}</style>
        </div>
    );
};

export default InteractiveVessel;
