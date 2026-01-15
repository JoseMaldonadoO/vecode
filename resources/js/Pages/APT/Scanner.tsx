import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { QrCode, ArrowLeft, Save, Search, Scan, Camera, X, AlertTriangle, CheckCircle, Warehouse } from 'lucide-react';
import axios from 'axios';
import { QrReader } from 'react-qr-reader';

export default function Scanner({ auth, recentScans }: { auth: any, recentScans: any[] }) {
    const [scanInput, setScanInput] = useState('');
    const [isScanning, setIsScanning] = useState(true);
    const [scanResult, setScanResult] = useState<any>(null);
    const [showCamera, setShowCamera] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        qr: '',
        warehouse: '',
        cubicle: '',
        operation_type: 'scale', // 'scale' or 'burreo'
    });

    // Keep focus on input
    useEffect(() => {
        if (isScanning && !showCamera && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isScanning, scanResult, showCamera]);

    const handleCodeFound = async (code: string) => {
        if (!code) return;

        // Clean code if needed
        const cleanCode = code.trim();

        try {
            // Re-use Scale Controller's powerful search which handles OP: tags and Order IDs
            const response = await axios.get(route('scale.search-qr'), { params: { qr: cleanCode } });

            if (response.data) {
                setScanResult(response.data);
                setData('qr', cleanCode); // Store the raw QR for backend validation/linking
                setIsScanning(false);
                setShowCamera(false);
                setScanInput(cleanCode);
                clearErrors();
            }
        } catch (error) {
            console.error("Search Error:", error);
            alert('Código no encontrado o formato inválido.');
            if (!showCamera) setScanInput('');
        }
    };

    const handleScan = (e: React.FormEvent) => {
        e.preventDefault();
        handleCodeFound(scanInput);
    };

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('apt.scanner.store'), {
            onSuccess: () => {
                reset();
                setScanResult(null);
                setScanInput('');
                setIsScanning(true);
            }
        });
    };

    const cancelScan = () => {
        setScanResult(null);
        setScanInput('');
        setIsScanning(true);
        setShowCamera(false);
        reset();
    };

    return (
        <DashboardLayout user={auth.user} header="APT - Escáner y Asignación">
            <Head title="Escáner APT" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

                {/* Errors Top */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm" role="alert">
                        <p className="font-bold">Error en la operación</p>
                        <ul className="list-disc pl-5">
                            {Object.values(errors).map((err: any, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}

                {/* Scanner Input Area */}
                {!scanResult ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center transition-all duration-300">
                        <div className="mb-6">
                            <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Scan className="w-12 h-12 text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Escanear Unidad</h2>
                            <p className="text-gray-500 mt-2">Apunte el lector al QR de la Orden o del Operador.</p>
                        </div>

                        {showCamera ? (
                            <div className="max-w-sm mx-auto mb-6 relative bg-black rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setShowCamera(false)}
                                    className="absolute top-2 right-2 z-10 bg-white/80 p-1 rounded-full text-gray-800 hover:bg-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                <QrReader
                                    onResult={(result: any, error) => {
                                        if (!!result) {
                                            const text = typeof result.getText === 'function' ? result.getText() : result.text;
                                            handleCodeFound(text);
                                        }
                                    }}
                                    constraints={{ facingMode: 'environment' }}
                                    videoStyle={{ width: '100%' }}
                                    className="w-full"
                                />
                                <p className="text-white text-center py-2 text-sm">Escaneando...</p>
                            </div>
                        ) : (
                            <div className="flex justify-center mb-6">
                                <button
                                    onClick={() => setShowCamera(true)}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                                >
                                    <Camera className="w-5 h-5" />
                                    Usar Cámara
                                </button>
                            </div>
                        )}

                        {!showCamera && (
                            <form onSubmit={handleScan} className="max-w-md mx-auto">
                                <div className="relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={scanInput}
                                        onChange={e => setScanInput(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-indigo-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 text-lg transition-all"
                                        placeholder="Escanee o escriba código..."
                                        autoComplete="off"
                                    />
                                    <QrCode className="w-6 h-6 text-gray-400 absolute left-3 top-3.5" />
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    /* Assignment Form */
                    <div className="bg-white rounded-xl shadow-lg border border-indigo-200 overflow-hidden mb-6 animate-fade-in-up">
                        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg flex items-center">
                                <CheckCircle className="w-6 h-6 mr-2" />
                                Unidad Identificada
                            </h3>
                            <button onClick={cancelScan} className="text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded transition-colors">
                                Cancelar
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Identified Data */}
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Detalles de la Orden</h4>

                                    <div className="mb-3">
                                        <span className="block text-xs text-gray-400">Producto</span>
                                        <div className="text-lg font-bold text-gray-800">{scanResult.product || 'N/A'}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="block text-xs text-gray-400">Operador</span>
                                            <div className="font-medium text-gray-700">{scanResult.driver || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400">Placas</span>
                                            <div className="font-medium text-gray-700">{scanResult.vehicle_plate || 'N/A'}</div>
                                        </div>
                                    </div>

                                    {scanResult.status && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <span className="block text-xs text-gray-400">Estado Actual</span>
                                            <div className={`font-bold inline-block px-2 py-0.5 rounded text-sm ${scanResult.status === 'loading' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {scanResult.status === 'loading' ? 'EN PROCESO (OK)' : scanResult.status.toUpperCase()}
                                            </div>
                                            {scanResult.status !== 'loading' && data.operation_type === 'scale' && (
                                                <p className="text-red-500 text-xs mt-1 font-bold">
                                                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                                                    Precaución: No parece estar en proceso de carga.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={submitForm} className="space-y-6 flex flex-col justify-center">

                                {/* Operation Type */}
                                <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                                    <label className={`flex-1 text-center py-2 rounded-md cursor-pointer transition-all ${data.operation_type === 'scale' ? 'bg-white shadow-sm text-indigo-700 font-bold' : 'text-gray-500'}`}>
                                        <input
                                            type="radio"
                                            className="hidden"
                                            name="op_type"
                                            checked={data.operation_type === 'scale'}
                                            onChange={() => setData('operation_type', 'scale')}
                                        />
                                        Descarga Báscula
                                    </label>
                                    <label className={`flex-1 text-center py-2 rounded-md cursor-pointer transition-all ${data.operation_type === 'burreo' ? 'bg-white shadow-sm text-indigo-700 font-bold' : 'text-gray-500'}`}>
                                        <input
                                            type="radio"
                                            className="hidden"
                                            name="op_type"
                                            checked={data.operation_type === 'burreo'}
                                            onChange={() => setData('operation_type', 'burreo')}
                                        />
                                        Burreo
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Asignar Almacén
                                    </label>
                                    <select
                                        value={data.warehouse}
                                        onChange={e => setData('warehouse', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 text-lg"
                                        required
                                        autoFocus
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        <option value="Almacén 1">Almacén 1</option>
                                        <option value="Almacén 2">Almacén 2</option>
                                        <option value="Almacén 3">Almacén 3</option>
                                        <option value="Almacén 4">Almacén 4</option>
                                        <option value="Almacén 5">Almacén 5</option>
                                        <option value="Patio">Patio</option>
                                    </select>
                                </div>

                                {/* Cubicle - Only for WH 4/5 */}
                                {(data.warehouse === 'Almacén 4' || data.warehouse === 'Almacén 5' || data.warehouse === '4' || data.warehouse === '5') && (
                                    <div className="animate-fade-in-up">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Asignar Cubículo
                                        </label>
                                        <input
                                            type="text"
                                            value={data.cubicle}
                                            onChange={e => setData('cubicle', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 text-lg"
                                            placeholder="Ej. C-1"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Requerido para Almacén 4 y 5</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center transition-all disabled:opacity-50 text-xl"
                                >
                                    <Save className="w-6 h-6 mr-2" />
                                    Confirmar Asignación
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Recent Scans */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-gray-700 font-bold text-md">Movimientos Recientes</h3>
                        <span className="text-xs text-gray-500 bg-white border px-2 py-1 rounded-full">{recentScans.length} registros</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentScans.map((scan) => (
                                    <tr key={scan.id}>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                                                {scan.warehouse} {scan.cubicle ? `- ${scan.cubicle}` : ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {/* Ideally verify if we can show Order info here easily if relationship exists */}
                                            Scan ID: {scan.id}
                                        </td>
                                    </tr>
                                ))}
                                {recentScans.length === 0 && (
                                    <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-400">Sin movimientos hoy.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
