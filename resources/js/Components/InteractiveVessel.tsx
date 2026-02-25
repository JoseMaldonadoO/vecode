import React, { useState } from 'react';
import { Ship, Info, Maximize2, Minimize2, Anchor, ArrowRight } from 'lucide-react';

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
}

interface InteractiveVesselProps {
    vessel: {
        id: string;
        name: string;
        stats: VesselStats;
        hatches: Hatch[];
        product: string;
    };
    isExternal?: boolean;
}

const InteractiveVessel: React.FC<InteractiveVesselProps> = ({ vessel, isExternal = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hoveredHatch, setHoveredHatch] = useState<number | null>(null);

    if (!vessel || vessel.name === "-") return null;

    const accentColor = isExternal ? 'cyan' : 'blue';
    const accentHex = isExternal ? '#22d3ee' : '#3b82f6';

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const ShipSVG = ({ vertical = false }: { vertical?: boolean }) => (
        <svg
            viewBox={vertical ? "0 0 150 500" : "0 0 600 150"}
            className={`w-full h-full transition-all duration-700 ${vertical ? 'max-h-[60vh]' : ''}`}
        >
            <defs>
                <linearGradient id={`${vessel.id}-hull`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Ship Hull */}
            {vertical ? (
                // Vertical Hull (Mobile Expanded)
                <path
                    d="M 40,20 L 110,20 L 125,70 L 125,430 L 110,480 L 40,480 L 25,430 L 25,70 Z"
                    fill={`url(#${vessel.id}-hull)`}
                    stroke={accentHex}
                    strokeWidth="2"
                    strokeOpacity="0.3"
                />
            ) : (
                // Horizontal Hull (Desktop / Compact)
                <path
                    d="M 20,70 L 70,40 L 530,40 L 580,75 L 530,110 L 70,110 Z"
                    fill={`url(#${vessel.id}-hull)`}
                    stroke={accentHex}
                    strokeWidth="2"
                    strokeOpacity="0.3"
                />
            )}

            {/* Hatches */}
            {vessel.hatches.map((hatch, index) => {
                const totalHatches = vessel.hatches.length;
                let x, y, width, height;

                if (vertical) {
                    width = 70;
                    height = 340 / totalHatches;
                    x = 40;
                    y = 70 + (index * (height + 10));
                } else {
                    width = 400 / totalHatches;
                    height = 50;
                    x = 90 + (index * (width + 10));
                    y = 50;
                }

                const isHovered = hoveredHatch === hatch.id;

                return (
                    <g
                        key={hatch.id}
                        onMouseEnter={() => setHoveredHatch(hatch.id)}
                        onMouseLeave={() => setHoveredHatch(null)}
                        className="cursor-pointer"
                    >
                        {/* Hatch Container */}
                        <rect
                            x={x} y={y} width={width} height={height}
                            fill="#0f172a"
                            stroke={isHovered ? accentHex : "rgba(255,255,255,0.1)"}
                            strokeWidth={isHovered ? "2" : "1"}
                            rx="4"
                            className="transition-all duration-300"
                        />

                        {/* Hatch Progress Fill */}
                        <rect
                            x={x + 2}
                            y={vertical ? y + height - 2 - ((height - 4) * hatch.percent / 100) : y + height - 2 - ((height - 4) * hatch.percent / 100)}
                            width={width - 4}
                            height={(height - 4) * hatch.percent / 100}
                            fill={accentHex}
                            fillOpacity={isHovered ? "0.8" : "0.5"}
                            rx="2"
                            className="transition-all duration-1000 ease-out"
                            filter={isHovered ? "url(#glow)" : ""}
                        />

                        {/* Hatch Label */}
                        <text
                            x={x + width / 2}
                            y={y + height / 2 + 5}
                            textAnchor="middle"
                            className={`fill-white/40 text-[8px] font-black uppercase pointer-events-none transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
                        >
                            B{hatch.id}
                        </text>
                    </g>
                );
            })}

            {/* Bow / Stern Details */}
            {!vertical && (
                <>
                    <circle cx="50" cy="75" r="3" fill={accentHex} fillOpacity="0.5" />
                    <rect x="540" y="65" width="10" height="20" fill={accentHex} fillOpacity="0.2" rx="2" />
                </>
            )}
        </svg>
    );

    return (
        <div className={`relative transition-all duration-500 overflow-hidden ${isExpanded ? 'bg-slate-900/40 rounded-3xl p-6 mt-4 ring-1 ring-white/10' : ''}`}>
            {/* Header / Basic Stats */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${isExternal ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        <Ship size={20} className={vessel.stats.progress > 0 ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">Carga Actual</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-white tracking-tighter">
                                {vessel.stats.loaded_mt.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-white/60">TM / {vessel.stats.total_mt.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={toggleExpand}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 font-black text-[10px] uppercase transition-all active:scale-95 ${isExternal
                            ? 'border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10'
                            : 'border-blue-500/20 text-blue-400 hover:bg-blue-500/10'
                        }`}
                >
                    {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    {isExpanded ? 'Cerrar Mapa' : 'Ver Bodegas'}
                </button>
            </div>

            {/* Progress Bar (Visible even when collapsed) */}
            <div className="mb-6 relative">
                <div className="flex justify-between items-center mb-1.5 px-0.5">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Progreso Operación</span>
                    <span className={`text-[10px] font-black ${isExternal ? 'text-cyan-400' : 'text-blue-400'}`}>{vessel.stats.progress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                        className={`h-full transition-all duration-1000 ease-in-out relative ${isExternal ? 'bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'}`}
                        style={{ width: `${vessel.stats.progress}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    </div>
                </div>
            </div>

            {/* Main Ship Visualization */}
            <div className={`relative transition-all duration-700 flex flex-col md:flex-row items-center gap-8 ${isExpanded ? 'opacity-100 scale-100 h-auto py-4' : 'opacity-40 scale-95 h-20 overflow-hidden'}`}>

                {/* Visualizer */}
                <div className={`flex-1 w-full ${isExpanded ? 'md:w-3/5' : 'w-full'}`}>
                    <ShipSVG vertical={false} />
                </div>

                {/* Vertical Visualizer for Mobile (if expanded) */}
                <div className={`w-full md:hidden transition-all duration-500 ${isExpanded ? 'block' : 'hidden'}`}>
                    <ShipSVG vertical={true} />
                </div>

                {/* Details Panel (Only when expanded) */}
                {isExpanded && (
                    <div className="w-full md:w-2/5 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 gap-3">
                            {/* General Stats Group */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Pendiente</p>
                                    <p className="text-xl font-black text-white">{vessel.stats.pending_mt.toLocaleString()}<span className="text-[10px] ml-1 opacity-50">TM</span></p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Producto</p>
                                    <p className="text-xs font-black text-white truncate">{vessel.product}</p>
                                </div>
                            </div>

                            {/* Hatch detail (If hovered) */}
                            <div className={`min-h-[100px] transition-all duration-300 rounded-2xl border-2 p-4 flex flex-col justify-center ${hoveredHatch
                                    ? (isExternal ? 'bg-cyan-500/10 border-cyan-400/30' : 'bg-blue-500/10 border-blue-400/30')
                                    : 'bg-white/5 border-white/5 opacity-50'
                                }`}>
                                {hoveredHatch ? (
                                    <>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-black text-white uppercase tracking-tighter">Bodega {hoveredHatch}</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${isExternal ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {vessel.hatches.find(h => h.id === hoveredHatch)?.percent}%
                                            </span>
                                        </div>
                                        <div className="text-2xl font-black text-white">
                                            {vessel.hatches.find(h => h.id === hoveredHatch)?.loaded_mt.toLocaleString()}
                                            <span className="text-[10px] font-bold text-white/40 ml-1.5">TM CARGADO</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Info size={16} className="text-white/20" />
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest text-center">Pase el cursor sobre una bodega para ver detalles</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Action Help */}
                        <p className="text-[10px] text-center text-white/20 font-bold uppercase tracking-widest md:hidden animate-bounce mt-4">
                            Deslice para navegar entre bodegas
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
};

export default InteractiveVessel;
