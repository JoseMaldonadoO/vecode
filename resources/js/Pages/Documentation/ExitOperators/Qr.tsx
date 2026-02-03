import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import QRCode from "qrcode";

interface Operator {
    id: number;
    name: string;
    transport_line: string;
    real_transport_line: string;
    unit_type: string;
    economic_number: string;
    tractor_plate: string;
    trailer_plate: string;
    brand_model: string;
}

export default function Qr({ auth, operator }: { auth: any; operator: Operator }) {
    const [qrDataUrl, setQrDataUrl] = useState("");

    useEffect(() => {
        if (operator) {
            // Generate QR Code with unique identifier
            const qrText = `OP_EXIT ${operator.id}|${operator.name}|${operator.tractor_plate}`;
            QRCode.toDataURL(qrText, { width: 300, margin: 1 }, (err, url) => {
                if (!err) setQrDataUrl(url);
            });
        }
    }, [operator]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <DashboardLayout user={auth.user} header="Impresión QR Operador">
            <Head title={`QR - ${operator.name}`} />

            <div className="max-w-4xl mx-auto py-8 px-4 print:hidden">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href={route("documentation.exit-operators.index")}
                        className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a Lista
                    </Link>

                    <button
                        onClick={handlePrint}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                        <Printer className="w-5 h-5 mr-2" />
                        IMPRIMIR QR
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
                    <div className="flex flex-col items-center">
                        <p className="text-gray-400 mb-6 text-xs font-bold uppercase tracking-[0.2em]">Vista Previa de Impresión</p>

                        {/* Preview Card */}
                        <div className="bg-white border-2 border-gray-200 w-full max-w-[21cm] p-12 shadow-inner rounded-lg">
                            <div className="flex justify-between items-start mb-10">
                                <img src="/logo_pro_agro.png" alt="Logo" className="h-16 object-contain" />
                                <div className="text-right">
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">FICHA DE<br />OPERADOR</h2>
                                    <p className="text-indigo-600 font-bold text-sm">SALIDA GENERAL</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Nombre del Operador</p>
                                        <p className="text-xl font-black text-gray-900 uppercase leading-none">{operator.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Línea Transportista</p>
                                        <p className="text-lg font-bold text-gray-800 uppercase">{operator.transport_line}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Unidad</p>
                                        <p className="text-lg font-bold text-gray-800 uppercase">{operator.unit_type} - {operator.brand_model}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 text-right">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Placa Tracto</p>
                                        <p className="text-2xl font-black text-indigo-700 font-mono">{operator.tractor_plate}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Placa Remolque</p>
                                        <p className="text-2xl font-black text-gray-700 font-mono">{operator.trailer_plate || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                {qrDataUrl && (
                                    <div className="p-4 border-4 border-gray-900 rounded-2xl">
                                        <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-[10px] text-gray-300 font-mono">ID: {operator.id} | VERIFICACIÓN DE SALIDA VECODE</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Printable View */}
            <div className="hidden print:block bg-white min-h-screen p-12">
                <div className="max-w-[21cm] mx-auto border-[10px] border-black p-16">
                    <div className="flex justify-between items-start mb-16">
                        <img src="/logo_pro_agro.png" alt="Logo" className="h-32 object-contain" />
                        <div className="text-right">
                            <h1 className="text-5xl font-black text-black leading-tight mb-2">FICHA DE<br />OPERADOR</h1>
                            <p className="text-2xl font-bold text-black border-t-4 border-black pt-2 uppercase">Salida General</p>
                        </div>
                    </div>

                    <div className="space-y-12 mb-20">
                        <div>
                            <p className="text-lg font-bold text-gray-500 uppercase mb-2">Nombre del Operador</p>
                            <p className="text-5xl font-black text-black uppercase">{operator.name}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-16">
                            <div>
                                <p className="text-lg font-bold text-gray-500 uppercase mb-2">Línea Transportista</p>
                                <p className="text-3xl font-bold text-black uppercase">{operator.transport_line}</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-500 uppercase mb-2">Unidad / Modelo</p>
                                <p className="text-3xl font-bold text-black uppercase">{operator.unit_type} - {operator.brand_model}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-16 border-y-4 border-black py-8">
                            <div>
                                <p className="text-lg font-bold text-gray-500 uppercase mb-2">Placa Tracto</p>
                                <p className="text-6xl font-black text-black font-mono">{operator.tractor_plate}</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-500 uppercase mb-2">Placa Remolque</p>
                                <p className="text-6xl font-black text-black font-mono">{operator.trailer_plate || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        {qrDataUrl && (
                            <div className="p-6 border-[8px] border-black rounded-[40px] mb-8">
                                <img src={qrDataUrl} alt="QR Code" className="w-80 h-80" />
                            </div>
                        )}
                        <p className="text-xl font-bold text-black tracking-[0.5em] uppercase">Escaneo Requerido</p>
                    </div>

                    <div className="mt-20 flex justify-between items-end border-t-2 border-dashed border-gray-400 pt-8">
                        <p className="text-sm font-mono text-gray-400 uppercase">Sistema VECODE | ID Operador: {operator.id}</p>
                        <p className="text-sm font-mono text-gray-400 uppercase">{new Date().toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 1cm; size: letter; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </DashboardLayout>
    );
}
