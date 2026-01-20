import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card as TremorCard, Metric, Text, Flex, BarChart, Title, Subtitle, DonutChart, Legend } from "@tremor/react";
import { Activity, Truck, Scale, Users, Filter, Calendar, Warehouse, Box, User as UserIcon, RefreshCw, ChevronRight, Anchor } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { useState, useEffect } from 'react';

export default function Dashboard({ auth, stats, charts, options, filters, vessel }: any) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        router.get(route('dashboard'), newFilters, { preserveState: true, replace: true, preserveScroll: true });
    };

    const refreshData = () => {
        setIsRefreshing(true);
        router.reload({ onFinish: () => setIsRefreshing(false) });
    };

    const kpis = [
        {
            title: "Viajes Descargados",
            metric: stats.trips_completed,
            icon: Truck,
            color: "green",
            footer: "Hoy / Filtrado",
            bg: "bg-green-50"
        },
        {
            title: "Unidades en Circuito",
            metric: stats.units_in_circuit,
            icon: RefreshCw,
            color: "blue",
            footer: "En planta ahora",
            bg: "bg-blue-50"
        },
        {
            title: "Unidades en Descarga",
            metric: stats.units_discharging,
            icon: Activity,
            color: "orange",
            footer: "En almacén",
            bg: "bg-orange-50"
        },
        {
            title: "Toneladas Hoy",
            metric: (stats.total_tonnes / 1000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " TM",
            icon: Scale,
            color: "indigo",
            footer: "Total neto movido",
            bg: "bg-indigo-50"
        },
    ];

    return (
        <DashboardLayout user={auth.user} header="Centro de Mando Operativo">
            <Head title="Dashboard" />

            <div className="p-4 md:p-8 space-y-8 bg-[#f8fafc]">

                {/* Header Banner & Vessel Info */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-[2rem] p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="p-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl rotate-3">
                                <Anchor className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">
                                    Resumen - Descarga de Barco
                                </h1>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-200 font-bold uppercase tracking-widest text-xs">Vessel Active:</span>
                                    <span className="text-white font-mono font-black border-b-2 border-blue-400">{vessel?.name || 'Cargando...'}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={refreshData}
                            className={`p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-gray-400 mr-2">
                        <Filter className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Filtros</span>
                    </div>

                    <div className="flex-1 min-w-[200px] relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={localFilters.date}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-xl text-sm font-bold focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex-1 min-w-[150px] relative">
                        <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={localFilters.warehouse}
                            onChange={(e) => handleFilterChange('warehouse', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-xl text-sm font-bold focus:ring-blue-500"
                        >
                            <option value="">Todos Almacenes</option>
                            {options.warehouses.map((w: string) => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[150px] relative">
                        <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={localFilters.cubicle}
                            onChange={(e) => handleFilterChange('cubicle', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-xl text-sm font-bold focus:ring-blue-500"
                        >
                            <option value="">Todos Cubículos</option>
                            {options.cubicles.map((c: string) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px] relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={localFilters.operator}
                            onChange={(e) => handleFilterChange('operator', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-xl text-sm font-bold focus:ring-blue-500"
                        >
                            <option value="">Todos Operadores</option>
                            {options.operators.map((o: string) => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                </div>

                {/* KPIs Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {kpis.map((item) => (
                        <Card key={item.title} className="border-none shadow-xl shadow-gray-100 overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <Flex justifyContent="between" alignItems="center">
                                        <div className={`p-4 rounded-2xl ${item.bg}`}>
                                            <item.icon className={`w-8 h-8 text-${item.color}-600 group-hover:scale-110 transition-transform`} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{item.title}</p>
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{item.metric}</h2>
                                        </div>
                                    </Flex>
                                </div>
                                <div className={`px-6 py-3 ${item.bg}/50 flex justify-between items-center`}>
                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider font-mono">
                                        {item.footer}
                                    </span>
                                    <ChevronRight className={`w-3 h-3 text-${item.color}-500`} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Visuals Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Discharging Graphic (Vessel Progress) */}
                    <div className="lg:col-span-12 xl:col-span-5 bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                Estado de la Operación
                            </h3>
                            <p className="text-sm text-gray-400 font-bold mb-8">Rendimiento acumulado hoy</p>
                        </div>

                        <div className="relative py-12 flex items-center justify-center">
                            {/* Custom SVG Ship Illustration */}
                            <svg viewBox="0 0 200 120" className="w-full h-auto max-w-[350px] drop-shadow-2xl">
                                <path
                                    d="M20,80 L180,80 L160,110 L40,110 Z"
                                    fill="#1e3a8a"
                                    className="animate-pulse"
                                />
                                <rect x="50" y="55" width="20" height="25" fill="#3b82f6" opacity="0.8" />
                                <rect x="75" y="45" width="25" height="35" fill="#2563eb" />
                                <rect x="105" y="40" width="30" height="40" fill="#1d4ed8" />
                                <rect x="140" y="60" width="15" height="20" fill="#3b82f6" opacity="0.7" />
                                <path d="M100,20 L100,40 M90,30 L110,30" stroke="#cbd5e1" strokeWidth="2" />
                                <circle cx="165" cy="95" r="3" fill="white" opacity="0.3" />
                                <circle cx="175" cy="95" r="2" fill="white" opacity="0.2" />
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-24">
                                <span className="text-5xl font-black text-gray-900 tracking-tighter">19%</span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Eficiencia Estimada</span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Descargado:</span>
                                <span className="text-xl font-black text-blue-900">{(stats.total_tonnes / 1000).toFixed(1)} TM</span>
                            </div>
                            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-[19%] shadow-lg shadow-blue-200"></div>
                            </div>
                        </div>
                    </div>

                    {/* Chart: Tonnes by Cubicle */}
                    <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
                        <Title className="font-black text-xl text-gray-900 tracking-tight">Distribución por Ubicación</Title>
                        <Subtitle className="font-bold text-gray-400 mb-6">Tonelaje neto por almacén y cubículo</Subtitle>
                        <BarChart
                            className="mt-6 h-80"
                            data={charts.by_cubicle}
                            index="label"
                            categories={["total"]}
                            colors={["blue"]}
                            valueFormatter={(val) => `${(val / 1000).toLocaleString()} TM`}
                            showAnimation={true}
                            yAxisWidth={60}
                        />
                    </div>

                    {/* Chart: Tonnes by Operator */}
                    <div className="lg:col-span-12 bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <Title className="font-black text-xl text-gray-900 tracking-tight">Aportación por Operador</Title>
                            <Subtitle className="font-bold text-gray-400 mb-6">Tonelaje movido por operadora logística</Subtitle>
                            <Legend
                                categories={charts.by_operator.map((o: any) => o.label)}
                                colors={["blue", "indigo", "cyan", "violet", "fuchsia", "sky"]}
                                className="mt-4"
                            />
                        </div>
                        <DonutChart
                            className="h-80 mt-6"
                            data={charts.by_operator}
                            category="total"
                            index="label"
                            colors={["blue", "indigo", "cyan", "violet", "fuchsia", "sky"]}
                            valueFormatter={(val) => `${(val / 1000).toLocaleString()} TM`}
                            showAnimation={true}
                        />
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
