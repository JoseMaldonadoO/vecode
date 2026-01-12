import { Head, router, Link } from '@inertiajs/react';
import { ShieldCheck, Truck, Clock, ArrowRight, User } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
interface Order {
    id: string;
    folio: string;
    client: { business_name: string };
    transporter: { name: string };
    driver: { name: string };
    vehicle: { plate_number: string };
    status: string;
    entry_at?: string;
}

export default function Index({ auth, expected, in_plant }: { auth: any, expected: Order[], in_plant: Order[] }) {
    const [processing, setProcessing] = useState<string | null>(null);

    const authorizeEntry = (id: string) => {
        setProcessing(id);
        router.post(route('surveillance.store'), {
            shipment_order_id: id
        }, {
            onFinish: () => setProcessing(null)
        });
    };

    return (
        <DashboardLayout user={auth.user} header="Vigilancia Física (Control de Acceso)">
            <Head title="Vigilancia" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Column 1: Expected (Pre-registered by Traffic) */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="bg-indigo-50 px-6 py-4 border-b flex justify-between items-center">
                        <h3 className="font-bold text-indigo-900 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                            Esperando Arribo
                        </h3>
                        <span className="bg-indigo-200 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">
                            {expected.length}
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {expected.length === 0 && (
                            <div className="p-8 text-center text-gray-400">
                                <p>No hay unidades programadas.</p>
                                <p className="text-xs mt-2">¿Ya asignó choferes en el módulo de <Link href={route('traffic.index')} className="text-indigo-500 underline">Tráfico</Link>?</p>
                            </div>
                        )}
                        {expected.map(order => (
                            <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 font-mono">{order.vehicle.plate_number}</h4>
                                        <p className="text-sm text-gray-500">{order.transporter.name}</p>
                                    </div>
                                    <span className="text-xs font-mono text-gray-400">{order.folio}</span>
                                </div>

                                <div className="flex items-center text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded">
                                    <User className="w-4 h-4 mr-2" />
                                    {order.driver.name}
                                </div>

                                <button
                                    onClick={() => authorizeEntry(order.id)}
                                    disabled={processing === order.id}
                                    style={{ backgroundColor: '#000000', color: '#ffffff' }}
                                    className="w-full !bg-black text-white font-bold py-3 rounded-lg hover:!bg-gray-800 shadow-lg flex items-center justify-center transition-all"
                                >
                                    {processing === order.id ? 'Procesando...' : (
                                        <>
                                            <ShieldCheck className="w-5 h-5 mr-2" />
                                            AUTORIZAR INGRESO
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 2: In Plant (Authorized) */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="bg-emerald-50 px-6 py-4 border-b flex justify-between items-center">
                        <h3 className="font-bold text-emerald-900 flex items-center">
                            <Truck className="w-5 h-5 mr-2 text-emerald-500" />
                            Unidades en Planta
                        </h3>
                        <span className="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">
                            {in_plant.length}
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {in_plant.length === 0 && (
                            <div className="p-8 text-center text-gray-400">
                                La planta está vacía.
                            </div>
                        )}
                        {in_plant.map(order => (
                            <div key={order.id} className="p-6 border-l-4 border-emerald-500">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-lg text-gray-900 font-mono">{order.vehicle?.plate_number}</h4>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                        ${order.status === 'authorized' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}
                                     `}>
                                        {order.status === 'authorized' ? 'EN PATIO' : order.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mb-1">{order.transporter?.name}</p>
                                {order.entry_at && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        Entrada: {new Date(order.entry_at).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
