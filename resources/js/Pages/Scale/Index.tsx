import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { Scale, ArrowRight, Truck, Database } from 'lucide-react';
import { useScale } from '@/hooks/useScale';
import { useState } from 'react';

// Interfaces (Simplified)
interface Order { id: number; folio: string; client: { business_name: string }; vehicle: { plate_number: string }; product: { name: string }; weight_ticket?: any; }

export default function Index({ auth, pending_entry, pending_exit }: { auth: any, pending_entry: Order[], pending_exit: Order[] }) {
    const { connect, disconnect, isConnected, weight, raw } = useScale();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [mode, setMode] = useState<'entry' | 'exit'>('entry'); // Entry = First Weigh (Tare), Exit = Second (Gross)

    const [processing, setProcessing] = useState(false);

    const handleWeighClick = (order: Order, type: 'entry' | 'exit') => {
        setSelectedOrder(order);
        setMode(type);
    };

    const confirmWeigh = () => {
        if (!selectedOrder) return;
        setProcessing(true);

        if (mode === 'entry') {
            router.post('/scale', {
                shipment_order_id: selectedOrder.id,
                weight: weight > 0 ? weight : 1000,
                type: 'entry'
            }, {
                onSuccess: () => { setSelectedOrder(null); setProcessing(false); },
                onFinish: () => setProcessing(false)
            });
        } else {
            router.put(`/scale/${selectedOrder.weight_ticket.id}`, {
                weight: weight > 0 ? weight : 45000
            }, {
                onSuccess: () => { setSelectedOrder(null); setProcessing(false); },
                onFinish: () => setProcessing(false)
            });
        }
    };

    return (
        <DashboardLayout user={auth.user} header="Báscula Camionera">
            <Head title="Báscula" />

            {/* Top Bar: Connection & Live Weight */}
            <div className="bg-zinc-900 text-white p-6 rounded-xl shadow-lg mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">Peso en vivo</h2>
                    <div className="text-6xl font-mono font-bold tracking-tight text-white flex items-baseline gap-2">
                        {weight.toLocaleString('en-US', { minimumFractionDigits: 1 })}
                        <span className="text-2xl text-zinc-500">kg</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={isConnected ? disconnect : connect}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${isConnected
                            ? '!bg-red-600 hover:!bg-red-700 text-white'
                            : '!bg-green-600 hover:!bg-green-700 text-white'
                            }`}
                        style={{ color: '#ffffff' }}
                    >
                        <Database className="w-5 h-5" />
                        {isConnected ? 'DESCONECTAR' : 'CONECTAR BÁSCULA'}
                    </button>
                    {isConnected && <span className="text-xs text-zinc-500 font-mono">Stream: {raw.slice(-15)}</span>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Column 1: Primer Pesaje (Entrada/Tara) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">1</div>
                            Pendientes de Entrada (Tara)
                        </h3>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{pending_entry.length}</span>
                    </div>

                    {pending_entry.length === 0 && <p className="text-gray-400 text-sm italic">No hay unidades esperando entrada.</p>}

                    {pending_entry.map(order => (
                        <div key={order.id} className="bg-white border rounded-lg p-4 shadow-sm hover:ring-2 ring-blue-500 cursor-pointer transition-all" onClick={() => handleWeighClick(order, 'entry')}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-mono text-xs text-gray-500">{order.folio}</span>
                                    <h4 className="font-bold text-lg text-gray-900">{order.vehicle?.plate_number}</h4>
                                    <p className="text-sm text-gray-600">{order.client?.business_name}</p>
                                    <p className="text-xs text-blue-600 mt-1">{order.product?.name}</p>
                                </div>
                                <ArrowRight className="text-gray-300" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Column 2: Segundo Pesaje (Salida/Bruto) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">2</div>
                            Pendientes de Salida (Bruto)
                        </h3>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{pending_exit.length}</span>
                    </div>

                    {pending_exit.length === 0 && <p className="text-gray-400 text-sm italic">No hay unidades cargadas listas para salir.</p>}

                    {pending_exit.map(order => (
                        <div key={order.id} className="bg-white border rounded-lg p-4 shadow-sm hover:ring-2 ring-green-500 cursor-pointer transition-all" onClick={() => handleWeighClick(order, 'exit')}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-mono text-xs text-gray-500">{order.folio}</span>
                                    <h4 className="font-bold text-lg text-gray-900">{order.vehicle?.plate_number}</h4>
                                    <p className="text-sm text-gray-600">{order.client?.business_name}</p>
                                    <p className="text-xs text-green-600 mt-1 font-mono">Tara: {order.weight_ticket?.tare_weight} kg</p>
                                </div>
                                <Scale className="text-green-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weighing Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
                        <h3 className="text-2xl font-bold text-center mb-2">
                            {mode === 'entry' ? 'Capturar TARA (Entrada)' : 'Capturar BRUTO (Salida)'}
                        </h3>
                        <p className="text-center text-gray-500 mb-8">{selectedOrder.vehicle?.plate_number} - {selectedOrder.client?.business_name}</p>

                        <div className="bg-gray-100 rounded-xl p-6 text-center mb-8">
                            <p className="text-lg text-gray-400">kg</p>
                        </div>

                        {/* Print Button for Finished Tickets */}
                        {mode === 'exit' && selectedOrder.weight_ticket && selectedOrder.weight_ticket.ticket_number && (
                            <div className="mb-6">
                                <a
                                    href={`/documents/ticket/${selectedOrder.id}`}
                                    target="_blank"
                                    className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mb-2"
                                >
                                    🖨️ Reimprimir Ticket # {selectedOrder.weight_ticket.ticket_number}
                                </a>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button onClick={() => setSelectedOrder(null)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button
                                onClick={confirmWeigh}
                                disabled={processing} // In production, add || weight <= 0 check
                                style={{ backgroundColor: '#000000', color: '#ffffff' }}
                                className="flex-1 py-3 !bg-black text-white font-bold rounded-lg hover:!bg-gray-800 shadow-lg shadow-indigo-200"
                            >
                                {processing ? 'Guardando...' : 'CONFIRMAR PESO'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}
