import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { BarChart, DonutChart, Legend, Title } from "@tremor/react";
import { Activity, Truck, Scale, Filter, Calendar, Warehouse, Box, User as UserIcon, RefreshCw, Anchor, ChevronDown } from 'lucide-react';
import { Card, CardContent } from "@/Components/ui/card";
import { useState, useEffect } from 'react';

export default function Dashboard({ auth, stats, charts, options, filters, vessel, vessels_list }: any) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        router.get(route('dashboard'), newFilters, { preserveState: true, replace: true, preserveScroll: true });
    };

    const refreshData = () => {
        setIsRefreshing(true);
        router.reload({ onFinish: () => setIsRefreshing(false) });
    };

    // Calculate chart value formatting
    const formatTonnes = (val: number) =>
        new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(val / 1000);

    const formatNumber = (val: number) =>
        new Intl.NumberFormat('en-US').format(val);

    return (
        <DashboardLayout user={auth.user} header="Centro de Mando Operativo">
            <Head title="Dashboard" />

            <div className="p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen font-sans">

                {/* Top Bar: Title & Selectors */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1e3a8a] text-white p-6 rounded-3xl shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                            <Anchor className="w-8 h-8 text-blue-200" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                Resumen-Descarga de barco <span className="text-blue-300">{vessel?.name || '---'}</span>
                            </h1>
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1">
                                {vessel?.dock ? `Muelle ${vessel.dock}` : 'Sin muelle asignado'} • ETA: {vessel?.eta ? String(vessel.eta).substring(0, 10) : '--'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Vessel Selector */}
                        <div className="relative group">
                            <select
                                value={filters.vessel_id || ''}
                                onChange={(e) => handleFilterChange('vessel_id', e.target.value)}
                                className="appearance-none bg-blue-800/50 hover:bg-blue-700 border border-blue-400/30 text-white font-bold py-2 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all cursor-pointer"
                            >
                                {vessels_list?.map((v: any) => (
                                    <option key={v.id} value={v.id} className="text-gray-900">{v.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300 pointer-events-none group-hover:text-white transition-colors" />
                        </div>

                        <button
                            onClick={refreshData}
                            className={`p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10 ${isRefreshing ? 'animate-spin' : ''}`}
                            title="Actualizar datos"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filters Row (Light) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Date Filter */}
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex items-center relative group focus-within:ring-2 ring-blue-500/20">
                        <div className="bg-blue-50 p-2 rounded-lg ml-1">
                            <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <input
                            type="date"
                            value={localFilters.date || ''}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                            className="w-full border-none text-sm font-bold text-gray-700 focus:ring-0 bg-transparent"
                        />
                        <span className="absolute right-3 text-[10px] font-black uppercase text-gray-300 tracking-wider pointer-events-none group-hover:text-blue-400 transition-colors">Fecha</span>
                    </div>

                    {/* Warehouse Filter */}
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex items-center relative group">
                        <div className="bg-indigo-50 p-2 rounded-lg ml-1">
                            <Warehouse className="w-4 h-4 text-indigo-600" />
                        </div>
                        <select
                            value={localFilters.warehouse || ''}
                            onChange={(e) => handleFilterChange('warehouse', e.target.value)}
                            className="w-full border-none text-sm font-bold text-gray-700 focus:ring-0 bg-transparent pr-8"
                        >
                            <option value="">Todos Almacenes</option>
                            {options.warehouses.map((w: string) => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>

                    {/* Cubicle Filter */}
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex items-center relative group">
                        <div className="bg-violet-50 p-2 rounded-lg ml-1">
                            <Box className="w-4 h-4 text-violet-600" />
                        </div>
                        <select
                            value={localFilters.cubicle || ''}
                            onChange={(e) => handleFilterChange('cubicle', e.target.value)}
                            className="w-full border-none text-sm font-bold text-gray-700 focus:ring-0 bg-transparent pr-8"
                        >
                            <option value="">Todos Cubículos</option>
                            {options.cubicles.map((c: string) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Operator Filter */}
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex items-center relative group">
                        <div className="bg-cyan-50 p-2 rounded-lg ml-1">
                            <UserIcon className="w-4 h-4 text-cyan-600" />
                        </div>
                        <select
                            value={localFilters.operator || ''}
                            onChange={(e) => handleFilterChange('operator', e.target.value)}
                            className="w-full border-none text-sm font-bold text-gray-700 focus:ring-0 bg-transparent pr-8 font-mono"
                        >
                            <option value="">Todos Operadores</option>
                            {options.operators.map((o: string) => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Column 1 & 2: KPIs + Main Chart + Bottom Cards */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* KPI Cards Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-l-blue-600 flex flex-col items-center justify-center text-center">
                                <h3 className="text-4xl font-black text-gray-800 tracking-tight">{formatNumber(stats.trips_completed)}</h3>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mt-1">Total de Viajes</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-l-indigo-600 flex flex-col items-center justify-center text-center">
                                <h3 className="text-4xl font-black text-gray-800 tracking-tight">{formatNumber(stats.units_in_circuit)}</h3>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mt-1">Unidades en Circuito</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-l-orange-500 flex flex-col items-center justify-center text-center">
                                <h3 className="text-4xl font-black text-gray-800 tracking-tight">{formatNumber(stats.units_discharging)}</h3>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mt-1">Unidades en Proceso</p>
                            </div>
                        </div>

                        {/* Main Chart Area */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Total: {formatNumber((stats.total_tonnage || 0) / 1000)}</h2>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">Toneladas Métricas Descargadas</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Última actualización</span>
                                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{new Date().toLocaleTimeString()}</span>
                                </div>
                            </div>

                            <div className="h-64 md:h-80">
                                <BarChart
                                    className="h-full"
                                    data={charts.daily_tonnage}
                                    index="date"
                                    categories={["total"]}
                                    colors={["slate"]}
                                    valueFormatter={(val) => `${(val / 1000).toLocaleString()} TM`}
                                    showAnimation={true}
                                    showLegend={false}
                                    yAxisWidth={50}
                                />
                            </div>
                        </div>

                        {/* Breakdown by Cubicle (Bottom Cards) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {charts.by_cubicle.slice(0, 3).map((item: any, idx: number) => (
                                <div key={idx} className="bg-[#1e40af] text-white p-4 rounded-xl shadow-lg relative overflow-hidden group flex flex-col justify-between h-32">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-5 -mt-5 blur-xl group-hover:bg-white/10 transition-colors"></div>
                                    <p className="text-3xl font-black font-mono tracking-tight group-hover:scale-105 transition-transform origin-left mt-2">
                                        {formatTonnes(item.total)}
                                    </p>
                                    <h4 className="text-xs font-bold uppercase tracking-widest opacity-70 mt-auto pt-2 border-t border-white/10">{item.label}</h4>
                                </div>
                            ))}
                            {/* Show 'More' card if > 3 */}
                            {charts.by_cubicle.length > 3 && (
                                <div className="bg-gray-100 text-gray-500 p-4 rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-widest border border-dashed border-gray-300 h-32">
                                    + {charts.by_cubicle.length - 3} más...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 3: Stats & Visuals */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center h-full">
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Porcentaje de Descarga</h3>

                        <div className="text-5xl font-black text-green-600 tracking-tighter mb-8">
                            {stats.progress_percent || 0}%
                        </div>

                        {/* Ship Graphic Container */}
                        <div className="relative w-full max-w-[300px] aspect-[4/3] flex items-end justify-center mb-8">
                            {/* Ship SVG */}
                            <svg viewBox="0 0 200 120" className="w-full h-auto drop-shadow-2xl z-10">
                                {/* Ship Base */}
                                <path d="M20,80 L180,80 L160,110 L40,110 Z" fill="#94a3b8" />
                                {/* Containers Stack 1 */}
                                <rect x="50" y="55" width="20" height="25" fill="#cbd5e1" />
                                <rect x="75" y="45" width="25" height="35" fill="#94a3b8" />
                                {/* Bridge */}
                                <rect x="110" y="40" width="30" height="40" fill="#cbd5e1" />
                                <rect x="118" y="25" width="14" height="15" fill="#94a3b8" />
                                <rect x="123" y="10" width="4" height="15" fill="#64748b" />
                                {/* Detail dots */}
                                <circle cx="130" cy="95" r="2" fill="white" />
                                <circle cx="140" cy="95" r="2" fill="white" />
                                <circle cx="150" cy="95" r="2" fill="white" />
                            </svg>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-blue-100 h-16 rounded-xl border border-blue-200 relative overflow-hidden mb-6">
                            <div
                                className="h-full bg-blue-500 flex items-center justify-center text-white font-black text-lg transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min(stats.progress_percent || 0, 100)}%` }}
                            >
                            </div>
                            <div className="absolute inset-0 flex items-center justify-between px-4">
                                <span className="text-xs font-bold text-blue-900/50 uppercase">Progreso</span>
                                <span className="text-xs font-bold text-blue-900/50">{formatTonnes(stats.total_tonnage || 0)} / {formatNumber(vessel?.programmed_tonnage || 0)}</span>
                            </div>
                        </div>

                        <div className="w-full mt-auto pt-6 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-bold text-gray-500 uppercase">Descargado:</span>
                                <span className="text-xl font-black text-gray-900 font-mono">{formatTonnes(stats.total_tonnage || 0)} TM</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-400 uppercase">Total Programado:</span>
                                <span className="text-sm font-bold text-gray-500 font-mono">{formatNumber(vessel?.programmed_tonnage || 0)} TM</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
