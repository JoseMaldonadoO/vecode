import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Card as TremorCard, Metric, Text, Flex, ProgressBar, BarChart, Title, Subtitle } from "@tremor/react";
import { Activity, Truck, Scale, Users, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";

// Datos de Ejemplo para "Power BI Killer" Demo
const chartdata = [
    { time: "08:00", Camiones: 12 },
    { time: "09:00", Camiones: 25 },
    { time: "10:00", Camiones: 32 },
    { time: "11:00", Camiones: 28 },
    { time: "12:00", Camiones: 15 },
    { time: "13:00", Camiones: 20 },
    { time: "14:00", Camiones: 35 },
];

export default function Dashboard({ auth, stats, recent_orders }: { auth: any, stats: any, recent_orders: any[] }) {

    // KPI Data Wrapper
    const kpis = [
        {
            title: "Total Órdenes",
            metric: stats.total_orders,
            icon: Activity,
            color: "indigo",
            footer: "Histórico acumulado"
        },
        {
            title: "En Operación",
            metric: stats.active_orders,
            icon: Truck,
            color: "blue",
            footer: "Unidades en planta"
        },
        {
            title: "Toneladas Hoy",
            metric: (stats.tonnes_today / 1000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }),
            icon: Scale,
            color: "orange",
            footer: "Movidas recientes"
        },
        {
            title: "Usuarios",
            metric: stats.active_users,
            icon: Users,
            color: "purple",
            footer: "Registrados"
        },
    ];

    return (
        <DashboardLayout user={auth.user} header="Centro de Mando">
            <Head title="Dashboard" />

            <div className="p-4 md:p-8 space-y-8">

                {/* 1. KPIs Section (Tremor) */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {kpis.map((item) => (
                        <TremorCard key={item.title} decoration="top" decorationColor={item.color}>
                            <Flex justifyContent="start" className="space-x-4">
                                <div className={`p-2 rounded-lg bg-${item.color}-100 text-${item.color}-600`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <Text>{item.title}</Text>
                                    <Metric>{item.metric}</Metric>
                                </div>
                            </Flex>
                            <Text className="mt-4 text-xs text-gray-400">{item.footer}</Text>
                        </TremorCard>
                    ))}
                </div>

                {/* 2. Charts & Activity Section */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

                    {/* Chart (Tremor) */}
                    <TremorCard className="col-span-4">
                        <Title>Rendimiento Operativo (Hoy)</Title>
                        <Subtitle>Flujo de unidades por hora en báscula</Subtitle>
                        <BarChart
                            className="mt-6 h-72"
                            data={chartdata}
                            index="time"
                            categories={["Camiones"]}
                            colors={["blue"]}
                            valueFormatter={(number) => Intl.NumberFormat("us").format(number).toString()}
                            yAxisWidth={48}
                        />
                    </TremorCard>

                    {/* Recent Orders (Shadcn) */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Últimas Salidas</CardTitle>
                            <CardDescription>
                                Unidades liberadas recientemente.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recent_orders.length === 0 ? (
                                    <p className="text-sm text-center text-muted-foreground py-8">No hay actividad reciente.</p>
                                ) : (
                                    recent_orders.map((order: any) => (
                                        <div key={order.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">Orden #{order.folio}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.client?.business_name}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                    Completado
                                                </Badge>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(order.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t flex justify-center">
                                <Link href={route('sales.index')} className="text-sm text-blue-600 font-medium hover:underline">
                                    Ver historial completo &rarr;
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
