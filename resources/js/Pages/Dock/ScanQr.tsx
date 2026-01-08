import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { QrCode, ArrowLeft, Truck, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ScanQr({ auth }: { auth: any }) {
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        folio: ''
    });

    // We can use flash messages to show success/error feedback inside the card
    const { flash } = usePage().props as any;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dock/scan', {
            onSuccess: () => reset('folio'),
        });
    };

    return (
        <DashboardLayout user={auth.user} header="Escaneo de QR">
            <Head title="Escanear QR" />

            <div className="max-w-xl mx-auto mt-12">
                <div className="mb-6">
                    <Link href="/dock" className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al menú
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gray-900 p-8 text-center">
                        <div className="mx-auto bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <QrCode className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Simulador de Escáner</h2>
                        <p className="text-gray-400">Ingrese el folio de la orden para simular la lectura del código QR.</p>
                    </div>

                    <div className="p-8">
                        {/* Mensajes de Feedback */}
                        {flash.success && (
                            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r flex items-start">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-green-800">¡Operación Exitosa!</h4>
                                    <p className="text-sm text-green-700">{flash.success}</p>
                                </div>
                            </div>
                        )}

                        {Object.keys(errors).length > 0 && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r flex items-start">
                                <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-red-800">Error en Escaneo</h4>
                                    <ul className="text-sm text-red-700 list-disc list-inside">
                                        {Object.values(errors).map((err: any, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    FOLIO DE ORDEN
                                </label>
                                <div className="relative">
                                    <Truck className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={data.folio}
                                        onChange={e => setData('folio', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 font-mono text-lg uppercase placeholder-gray-300 transition-colors"
                                        placeholder="Ej. OV-2026-..."
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-right">Presione Enter para procesar</p>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                style={{ backgroundColor: '#000000', color: '#ffffff' }}
                                className="w-full !bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:!bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'PROCESANDO...' : 'CONFIRMAR CARGA/DESCARGA'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
