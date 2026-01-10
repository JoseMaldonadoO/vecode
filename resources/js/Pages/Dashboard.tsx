import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Activity, Truck, Scale, Users, TrendingUp } from 'lucide-react';

export default function Dashboard({ auth, stats, recent_orders }: { auth: any, stats: any, recent_orders: any[] }) {
    return (
        <DashboardLayout user={auth.user} header="Inicio">
            <Head title="Dashboard" />

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Orders Card */}
                <div className="rounded-xl border bg-white text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-gray-500">Total Órdenes</span>
                        <Activity className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total_orders}</div>
                    <p className="text-xs text-muted-foreground text-gray-500 flex items-center mt-1">
                        Histórico acumulado
                    </p>
                </div>

                {/* Operations Card */}
                <div className="rounded-xl border bg-white text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-gray-500">En Operación</span>
                        <Truck className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.active_orders}</div>
                    <p className="text-xs text-blue-600 mt-1">Unidades en planta</p>
                </div>

                {/* Scale Card */}
                <div className="rounded-xl border bg-white text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-gray-500">Toneladas Hoy</span>
                        <Scale className="h-4 w-4 text-orange-500" />
                    </div>
                    {/* Display formatted number. Assuming KG in DB, divide by 1000 for Tons */}
                    <div className="text-2xl font-bold text-gray-900">
                        {(stats.tonnes_today / 1000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-orange-600 mt-1">Movidas recientes</p>
                </div>

                {/* Users Card */}
                <div className="rounded-xl border bg-white text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-gray-500">Usuarios Sistema</span>
                        <Users className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.active_users}</div>
                    <p className="text-xs text-gray-500 mt-1">Registrados</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                {/* Charts Area Placeholder */}
                <div className="col-span-4 rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg text-gray-800">Resumen de Operaciones</h3>
                    </div>
                    <div className="h-[300px] w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p>Gráfica de Rendimiento</p>
                            <p className="text-xs text-gray-400">(Próximamente)</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="col-span-3 rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg text-gray-800">Últimas Salidas</h3>
                        <Link href="/sales" className="text-sm text-indigo-600 hover:underline">Ver todas</Link>
                    </div>
                    <div className="space-y-4">
                        {recent_orders.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No hay actividad reciente.</p>
                        ) : (
                            recent_orders.map((order: any) => (
                                <div key={order.id} className="flex items-center border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                                    <div className="ml-0 space-y-1">
                                        <p className="text-sm font-medium leading-none text-gray-900">Orden {order.folio}</p>
                                        <p className="text-xs text-gray-500">
                                            {order.client?.business_name} • {new Date(order.updated_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                        Completado
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
