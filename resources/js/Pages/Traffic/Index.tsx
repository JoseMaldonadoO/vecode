import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { Truck, User, ArrowRight, Save, X } from 'lucide-react';
import { useState } from 'react';

interface Order {
    id: number;
    folio: string;
    sale_order: string;
    client: { business_name: string };
    product_id: number; // simplified
    quantity_ordered: number; // simplified access via relation if needed, or stick to basic
    // For demo, we assume order has items loaded or we access via simple fields
    items?: any[];
    created_at: string;
}

interface Transporter {
    id: number;
    name: string;
    drivers: { id: number; name: string; license_number: string; }[];
    vehicles: { id: number; plate_number: string; type: string; }[];
}

export default function Index({ auth, orders, transporters }: { auth: any, orders: Order[], transporters: Transporter[] }) {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const { data, setData, put, processing, reset, errors } = useForm({
        transporter_id: '',
        driver_id: '',
        vehicle_id: ''
    });

    const handleAssignClick = (order: Order) => {
        setSelectedOrder(order);
        reset();
    };

    const closePanel = () => {
        setSelectedOrder(null);
        reset();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;

        put(`/traffic/${selectedOrder.id}`, {
            onSuccess: () => closePanel()
        });
    };

    // Filtered lists based on selected transporter
    const selectedTransporter = transporters.find(t => t.id.toString() === data.transporter_id);
    const availableDrivers = selectedTransporter?.drivers || [];
    const availableVehicles = selectedTransporter?.vehicles || [];

    return (
        <DashboardLayout user={auth.user} header="Tráfico y Logística">
            <Head title="Asignación de Tráfico" />

            <div className="flex h-[calc(100vh-200px)] gap-6">
                {/* List Column */}
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-12 text-center text-gray-500">
                                <Truck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                <p>No hay órdenes pendientes de asignación.</p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-indigo-300 transition-colors flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{order.folio}</span>
                                            <span className="text-xs text-gray-500">Ref: {order.sale_order}</span>
                                        </div>
                                        <h3 className="font-medium text-gray-900">{order.client?.business_name}</h3>
                                        <p className="text-sm text-gray-500">Pendiente de unidad</p>
                                    </div>
                                    <button
                                        onClick={() => handleAssignClick(order)}
                                        className="p-2 rounded-full hover:bg-gray-100 text-indigo-600"
                                    >
                                        <ArrowRight className="h-5 w-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Assignment Panel */}
                {selectedOrder && (
                    <div className="w-96 bg-white border-l border-gray-200 p-6 shadow-xl fixed right-0 top-16 bottom-0 z-40 overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Asignar Unidad</h3>
                            <button onClick={closePanel} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Orden Seleccionada</p>
                            <p className="font-medium text-gray-900 text-lg">{selectedOrder.folio}</p>
                            <p className="text-sm text-gray-600">{selectedOrder.client?.business_name}</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Transportista</label>
                                <select
                                    value={data.transporter_id}
                                    onChange={e => setData(data => ({ ...data, transporter_id: e.target.value, driver_id: '', vehicle_id: '' }))}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                >
                                    <option value="">Seleccione...</option>
                                    {transporters.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chofer</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <select
                                        value={data.driver_id}
                                        onChange={e => setData('driver_id', e.target.value)}
                                        disabled={!data.transporter_id}
                                        className="pl-9 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                                        required
                                    >
                                        <option value="">Seleccione chofer...</option>
                                        {availableDrivers.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.license_number})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
                                <div className="relative">
                                    <Truck className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <select
                                        value={data.vehicle_id}
                                        onChange={e => setData('vehicle_id', e.target.value)}
                                        disabled={!data.transporter_id}
                                        className="pl-9 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                                        required
                                    >
                                        <option value="">Seleccione vehículo...</option>
                                        {availableVehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.plate_number} - {v.type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                style={{ backgroundColor: '#000000', color: '#ffffff' }}
                                className="w-full inline-flex items-center justify-center rounded-md border border-transparent !bg-black px-4 py-2 text-sm font-medium !text-white shadow-sm hover:!bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Guardar Asignación
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
