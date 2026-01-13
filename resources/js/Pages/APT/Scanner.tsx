import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { QrCode, ArrowLeft, Save, Search, Scan, Camera, X } from 'lucide-react';
import axios from 'axios';
import { QrReader } from 'react-qr-reader';

export default function Scanner({ auth, recentScans }: { auth: any, recentScans: any[] }) {
    const [scanInput, setScanInput] = useState('');
    const [isScanning, setIsScanning] = useState(true);
    const [scannedOperator, setScannedOperator] = useState<any>(null);
    const [showCamera, setShowCamera] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        operator_id: '',
        warehouse: '',
        cubicle: '',
    });

    // Keep focus on input for continuous scanning (if not using camera)
    useEffect(() => {
        if (isScanning && !showCamera && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isScanning, scannedOperator, showCamera]);

    const handleCodeFound = async (code: string) => {
        if (!code) return;

        // Same logic as manual handleScan
        const match = code.match(/OP:(\d+)/i) || code.match(/^(\d+)$/);

        if (match) {
            const id = match[1];
            try {
                const response = await axios.get(route('apt.operators.search') + `?q=${id}`);
                const operator = response.data.find((op: any) => op.id.toString() === id);

                if (operator) {
                    setScannedOperator(operator);
                    setData('operator_id', operator.id);
                    setIsScanning(false);
                    setShowCamera(false); // Close camera on success
                    setScanInput(code); // Show what was scanned
                } else {
                    alert('Operador no encontrado con ID: ' + id);
                    if (!showCamera) setScanInput('');
                }
            } catch (error) {
                console.error("Error fetching operator:", error);
                alert('Error al buscar operador.');
            }
        } else {
            if (!showCamera) {
                alert('Formato de QR no válido.');
                setScanInput('');
            }
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
                setScannedOperator(null);
                setScanInput('');
                setIsScanning(true);
            }
        });
    };

    const cancelScan = () => {
        setScannedOperator(null);
        setScanInput('');
        setIsScanning(true);
        setShowCamera(false);
        reset();
    };

    return (
        <DashboardLayout user={auth.user} header="Escáner de Entrada (APT)">
            <Head title="Escáner APT" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

                {/* Scanner Input Area */}
                {!scannedOperator ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center">
                        <div className="mb-6">
                            <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Scan className="w-12 h-12 text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Listo para Escanear</h2>
                            <p className="text-gray-500 mt-2">Apunte el lector al código QR del operador o use la cámara.</p>
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
                                            // Handle both zxing Result object (getText) and simple objects (text)
                                            const text = typeof result.getText === 'function' ? result.getText() : result.text;
                                            handleCodeFound(text);
                                        }
                                    }}
                                    constraints={{ facingMode: 'environment' }}
                                    videoStyle={{ width: '100%' }}
                                    className="w-full"
                                />
                                <p className="text-white text-center py-2 text-sm">Apunte cámara al QR</p>
                            </div>
                        ) : (
                            <div className="flex justify-center mb-6">
                                <button
                                    onClick={() => setShowCamera(true)}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                                >
                                    <Camera className="w-5 h-5" />
                                    Activar Cámara
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
                                        placeholder="Esperando lectura de QR..."
                                        autoComplete="off"
                                    />
                                    <QrCode className="w-6 h-6 text-gray-400 absolute left-3 top-3.5" />
                                </div>
                                <div className="mt-4 text-xs text-gray-400">
                                    Presione Enter si ingresa el ID manualmente
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    /* Form Area - After Scan */
                    <div className="bg-white rounded-xl shadow-lg border border-indigo-200 overflow-hidden mb-6">
                        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg flex items-center">
                                <Scan className="w-5 h-5 mr-2" />
                                Operador Identificado
                            </h3>
                            <button onClick={cancelScan} className="text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded transition-colors">
                                Cancelar / Escanear otro
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Operator Info Card */}
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Datos del Operador</h4>
                                <div className="space-y-4">
                                    <div>
                                        <span className="block text-xs text-gray-400">Nombre</span>
                                        <span className="text-lg font-bold text-gray-800">{scannedOperator.operator_name}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="block text-xs text-gray-400">Tracto</span>
                                            <span className="font-medium text-gray-700">{scannedOperator.tractor_plate}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400">Económico</span>
                                            <span className="font-medium text-gray-700">{scannedOperator.economic_number}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400">Remolque</span>
                                            <span className="font-medium text-gray-700">{scannedOperator.trailer_plate || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-gray-400">Tipo</span>
                                            <span className="font-medium text-gray-700">{scannedOperator.unit_type}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400">Transportista</span>
                                        <span className="font-medium text-gray-700">{scannedOperator.transporter_line}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Assignment Form */}
                            <div className="flex flex-col justify-center">
                                <form onSubmit={submitForm} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Asignar Almacén
                                        </label>
                                        <select
                                            value={data.warehouse}
                                            onChange={e => setData('warehouse', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                                            required
                                            autoFocus
                                        >
                                            <option value="">Seleccionar Almacén...</option>
                                            <option value="Almacén 1">Almacén 1</option>
                                            <option value="Almacén 2">Almacén 2</option>
                                            <option value="Almacén 3">Almacén 3</option>
                                            <option value="Almacén 4">Almacén 4</option>
                                            <option value="Patio">Patio</option>
                                        </select>
                                        {errors.warehouse && <div className="text-red-500 text-xs mt-1">{errors.warehouse}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Asignar Cubículo
                                        </label>
                                        <input
                                            type="text"
                                            value={data.cubicle}
                                            onChange={e => setData('cubicle', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                                            placeholder="Ej. C-12, Norte, etc."
                                            required
                                        />
                                        {errors.cubicle && <div className="text-red-500 text-xs mt-1">{errors.cubicle}</div>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center transition-all disabled:opacity-50 text-lg"
                                    >
                                        <Save className="w-6 h-6 mr-2" />
                                        Registrar Entrada
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}


                {/* Recent Scans Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-gray-700 font-bold text-md">Escaneos Recientes (Hoy)</h3>
                        <span className="text-xs text-gray-500 bg-white border px-2 py-1 rounded-full">{recentScans.length} registros</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operador</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación Asignada</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentScans.length > 0 ? (
                                    recentScans.map((scan) => (
                                        <tr key={scan.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{scan.operator?.operator_name}</div>
                                                <div className="text-xs text-gray-500">{scan.operator?.transporter_line}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {scan.operator?.economic_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {scan.warehouse} - {scan.cubicle}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {scan.user_id}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No hay registros de escaneo hoy.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
