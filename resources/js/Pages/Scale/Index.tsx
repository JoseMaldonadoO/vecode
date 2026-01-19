import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Truck, Package, Scale, Activity, Printer, Database, Lock, ArrowRight, Warehouse, Settings, Check, List, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';

import Swal from 'sweetalert2';



export default function Index({ auth, pending_exit = [], flash }: { auth: any, pending_exit: any[], flash?: any }) {
    // Persistent scale ID logic
    const [scaleId, setScaleId] = useState<number>(1);
    const [showScaleModal, setShowScaleModal] = useState(false);
    const [viewMode, setViewMode] = useState<'menu' | 'table'>('menu');

    useEffect(() => {
        const saved = localStorage.getItem('selected_scale_id');
        if (saved) setScaleId(parseInt(saved));

        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Operación Exitosa!',
                text: flash.success,
                timer: 3000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        }
    }, [flash]);

    const handleScaleSelect = (id: number) => {
        setScaleId(id);
        localStorage.setItem('selected_scale_id', id.toString());
        setShowScaleModal(false);
    };

    const buttons = [
        { name: 'Salida', icon: Truck, color: 'bg-blue-50 text-blue-600', hover: 'hover:border-blue-500', href: route('scale.exit') + `?scale_id=${scaleId}` },
        // Append scale_id to the entry route
        { name: 'Entrada MI / MP', icon: Package, color: 'bg-indigo-50 text-indigo-600', hover: 'hover:border-indigo-500', href: route('scale.entry-mp') + `?scale_id=${scaleId}` },
        { name: 'Edita / Reimprime Ticket', icon: Printer, color: 'bg-purple-50 text-purple-600', hover: 'hover:border-purple-500', href: '#' },
        { name: 'Alta lote / almacen', icon: Database, color: 'bg-teal-50 text-teal-600', hover: 'hover:border-teal-500', href: '#' },
        { name: 'Cierre de Lote', icon: Lock, color: 'bg-red-50 text-red-600', hover: 'hover:border-red-500', href: '#' },
    ];

    return (
        <DashboardLayout user={auth.user} header="Báscula - Panel de Control">
            <Head title="Báscula" />

            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">

                {/* Scale Selector Banner */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowScaleModal(true)}
                        className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-bold text-gray-700"
                    >
                        <Settings className="w-4 h-4" />
                        Báscula Activa: <span className="text-indigo-600">#{scaleId}</span>
                    </button>
                </div>

                {viewMode === 'menu' ? (
                    /* Actions Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {buttons.map((btn, index) => {
                            const isLink = btn.href && btn.href !== '#';
                            const CardContent = () => (
                                <>
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform transform group-hover:scale-110 ${btn.color}`}>
                                        <btn.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-bold text-gray-800">{btn.name}</h3>
                                </>
                            );

                            const className = `group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${btn.hover} w-full`;

                            return isLink ? (
                                <a key={index} href={btn.href} className={className}>
                                    <CardContent />
                                </a>
                            ) : (
                                <button
                                    key={index}
                                    className={className}
                                    onClick={() => alert(`Funcionalidad '${btn.name}' en desarrollo`)}
                                >
                                    <CardContent />
                                </button>
                            );
                        })}

                        {/* Button to show pending records table */}
                        <button
                            onClick={() => setViewMode('table')}
                            className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-green-500 w-full"
                        >
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform transform group-hover:scale-110 bg-green-50 text-green-600">
                                <List className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-gray-800">Unidades en Planta</h3>
                            <span className="text-xs text-gray-500 mt-1">{pending_exit.length} unidades</span>
                        </button>
                    </div>
                ) : (
                    /* Pending Exit List - Table View */
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setViewMode('menu')}
                                    className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6 mr-1" />
                                    <span className="font-medium">Volver</span>
                                </button>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center border-l-2 border-gray-200 pl-4">
                                    <Truck className="w-6 h-6 mr-2 text-green-600" />
                                    Unidades en Planta (Pendientes de Salida)
                                </h2>
                            </div>
                            <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm">
                                {pending_exit.length} Pendientes
                            </span>
                        </div>

                        {/* Responsive Content: Table for Desktop, Cards for Mobile */}

                        {/* Desktop View (Table) */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-bold">
                                    <tr>
                                        <th className="p-4">Folio</th>
                                        <th className="p-4">Unidad / Chofer</th>
                                        <th className="p-4">Producto</th>
                                        <th className="p-4">Peso Entrada</th>
                                        <th className="p-4">Ubicación (APT)</th>
                                        <th className="p-4 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pending_exit.length > 0 ? pending_exit.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-mono font-bold text-indigo-600">{order.folio}</td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{order.driver}</div>
                                                <div className="text-sm text-gray-500 font-mono">{order.plate}</div>
                                            </td>
                                            <td className="p-4 text-gray-700">{order.product}</td>
                                            <td className="p-4 font-mono font-bold">{order.tare_weight} kg</td>
                                            <td className="p-4">
                                                <div className="flex items-center text-sm">
                                                    <Warehouse className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className={order.warehouse === 'N/A' ? 'text-amber-500 italic' : 'text-blue-600 font-bold'}>
                                                        {order.warehouse === 'N/A' ? 'Sin Asignar' : `${order.warehouse} - ${order.cubicle}`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <Link
                                                    href={route('scale.exit', order.id) + `?scale_id=${scaleId}`}
                                                    className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
                                                >
                                                    Destarar <ArrowRight className="w-4 h-4 ml-2" />
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                                                No hay unidades pendientes de salida.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View (Cards) */}
                        <div className="lg:hidden p-4 space-y-4">
                            {pending_exit.length > 0 ? pending_exit.map((order) => (
                                <div key={order.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold uppercase text-indigo-500 tracking-wider">Folio: {order.folio}</span>
                                            <h3 className="font-bold text-gray-900 text-lg">{order.driver}</h3>
                                            <p className="text-sm text-gray-500 font-mono">{order.plate}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400 uppercase">Peso Entrada</div>
                                            <div className="font-mono font-bold text-gray-800">{order.tare_weight} kg</div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Producto:</span>
                                            <span className="font-medium text-gray-800">{order.product}</span>
                                        </div>
                                        <div className="flex justify-between text-sm items-center">
                                            <span className="text-gray-500">Ubicación:</span>
                                            <span className={order.warehouse === 'N/A' ? 'text-amber-500 italic text-xs' : 'text-blue-600 font-bold text-xs'}>
                                                {order.warehouse === 'N/A' ? 'Sin Asignar' : `${order.warehouse} - ${order.cubicle}`}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={route('scale.exit', order.id) + `?scale_id=${scaleId}`}
                                        className="mt-2 w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-md active:scale-95"
                                    >
                                        Destarar Unidad <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    No hay unidades pendientes.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Scale Selection Modal */}
                <Modal show={showScaleModal} onClose={() => setShowScaleModal(false)}>
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Seleccionar Báscula de Operación
                        </h2>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {[1, 2, 3].map(id => (
                                <button
                                    key={id}
                                    onClick={() => handleScaleSelect(id)}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${scaleId === id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-200'
                                        }`}
                                >
                                    <Scale className={`w-8 h-8 ${scaleId === id ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <span className="font-bold text-lg">Báscula {id}</span>
                                    {scaleId === id && <Check className="w-4 h-4 text-indigo-600" />}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <SecondaryButton onClick={() => setShowScaleModal(false)}>
                                Cerrar
                            </SecondaryButton>
                        </div>
                    </div>
                </Modal>

            </div>
        </DashboardLayout>
    );
}
