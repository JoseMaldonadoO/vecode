import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react'; // Added useForm, usePage
import { Anchor, QrCode, Users, Ship, ArrowRight } from 'lucide-react'; // Added ArrowRight

export default function Index({ auth }: { auth: any }) {
    // QR Logic extracted here
    const { data: qrData, setData: setQrData, post: postQr, processing: qrProcessing, errors: qrErrors, reset: resetQr } = useForm({
        folio: ''
    });

    const { flash } = usePage().props as { flash?: { success?: string, error?: string } };

    const submitQr = (e: React.FormEvent) => {
        e.preventDefault();
        postQr('/dock/scan', {
            onSuccess: () => resetQr('folio'),
            preserveScroll: true
        });
    };
    return (
        <DashboardLayout user={auth.user} header="Muelle (Operaciones Marítimas)">
            <Head title="Muelle" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8">
                {/* 1. Registro de Barco */}
                <Link
                    href="/dock/vessel"
                    className="group bg-white rounded-xl shadow-lg border border-transparent p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:shadow-indigo-100 transition-all duration-300"
                >
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                        <Ship className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Registro de Barco</h3>
                    <p className="text-sm text-gray-500">
                        Dar de alta nueva operación, asignar cliente y producto.
                    </p>
                </Link>

                {/* 2. Registro de Operadores (Placeholder) */}
                <div className="group bg-white rounded-xl shadow-lg border border-transparent p-8 flex flex-col items-center justify-center text-center hover:border-gray-300 transition-all duration-300 opacity-60 cursor-not-allowed">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Registro de Operadores</h3>
                    <p className="text-sm text-gray-500">
                        Gestión de cuadrillas (Próximamente).
                    </p>
                </div>

                {/* 3. Escaneo de QR */}
                {/* 3. Escaneo de QR (Integrado) */}
                <div className="bg-white rounded-xl shadow-lg border border-transparent overflow-hidden md:col-span-1">
                    <div className="bg-indigo-900 p-6 text-center">
                        <QrCode className="w-10 h-10 text-white mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-white">Escáner Rápido</h3>
                    </div>
                    <div className="p-6">
                        <form onSubmit={submitQr} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Folio de Orden
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={qrData.folio}
                                        onChange={e => setQrData('folio', e.target.value)}
                                        className="w-full rounded-lg border-2 border-gray-200 font-mono text-center uppercase focus:border-indigo-500 focus:ring-0 pl-2 pr-10"
                                        placeholder="OV-2026-..."
                                    />
                                    {qrData.folio && (
                                        <button
                                            type="button"
                                            onClick={() => resetQr('folio')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                {qrErrors.folio && <p className="text-red-500 text-xs mt-1">{qrErrors.folio}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={qrProcessing}
                                style={{ backgroundColor: '#000000', color: '#ffffff' }}
                                className="w-full !bg-black text-white font-bold py-3 rounded-lg hover:!bg-gray-800 disabled:opacity-50 transition-all flex justify-center items-center"
                            >
                                {qrProcessing ? '...' : <ArrowRight className="w-5 h-5" />}
                            </button>
                        </form>
                        {/* Flash Message for QR */}
                        {flash?.success && (
                            <div className="mt-4 p-3 bg-green-50 text-green-700 text-xs rounded border border-green-100 flex items-center">
                                <span className="font-bold mr-1">¡Listo!</span> {flash.success}
                            </div>
                        )}
                        {flash?.error && (
                            <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded border border-red-100 flex items-center">
                                <span className="font-bold mr-1">Error:</span> {flash.error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
