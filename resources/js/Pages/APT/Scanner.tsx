import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { QrCode, ArrowLeft, Save, Search, Scan, Camera, X, AlertTriangle, CheckCircle, Warehouse, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { QrReader } from 'react-qr-reader';
import Modal from '@/Components/Modal';

export default function Scanner({ auth, recentScans, occupiedFlat = [], occupiedCubicles = [] }: { auth: any, recentScans: any[], occupiedFlat?: string[], occupiedCubicles?: string[] }) {
    const [scanInput, setScanInput] = useState('');
    const [isScanning, setIsScanning] = useState(true);
    const [scanResult, setScanResult] = useState<any>(null);
    const [showCamera, setShowCamera] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Edit State
    const [editingScan, setEditingScan] = useState<any>(null);
    const [viewingUnit, setViewingUnit] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        qr: '',
        warehouse: '',
        cubicle: '',
        operation_type: 'scale', // 'scale' or 'burreo'
    });

    const editForm = useForm({
        warehouse: '',
        cubicle: '',
    });

    // Keep focus on input
    useEffect(() => {
        if (isScanning && !showCamera && !editingScan && !deletingId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isScanning, scanResult, showCamera, editingScan, deletingId]);

    const handleCodeFound = async (code: string) => {
        if (!code) return;
        const cleanCode = code.trim();
        try {
            const response = await axios.get(route('scale.search-qr'), { params: { qr: cleanCode } });
            if (response.data) {
                setScanResult(response.data);
                setData('qr', cleanCode);

                // Auto-select based on Vessel Preference
                if (response.data.apt_operation_type) {
                    setData('operation_type', response.data.apt_operation_type);
                } else if (response.data.force_burreo) {
                    setData('operation_type', 'burreo');
                } else {
                    setData('operation_type', 'scale');
                }

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

    // Edit Handlers
    const startEdit = (scan: any) => {
        setEditingScan(scan);
        editForm.setData({
            warehouse: scan.warehouse,
            cubicle: scan.cubicle || '',
        });
        editForm.clearErrors();
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(route('apt.scanner.update', editingScan.id), {
            onSuccess: () => {
                setEditingScan(null);
                editForm.reset();
            }
        });
    };

    // Delete Handlers
    const confirmDelete = () => {
        if (!deletingId) return;
        router.delete(route('apt.scanner.destroy', deletingId), {
            onSuccess: () => setDeletingId(null)
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <Link href={route('apt.index')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver al menú
                </Link>
            </div>

            {/* Edit Modal */}
            {editingScan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-xl font-bold text-gray-800">Editar Asignación</h3>
                            <button onClick={() => setEditingScan(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={submitEdit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Almacén</label>
                                <select
                                    value={editForm.data.warehouse}
                                    onChange={e => editForm.setData('warehouse', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="Almacén 1">Almacén 1</option>
                                    <option value="Almacén 2">Almacén 2</option>
                                    <option value="Almacén 3">Almacén 3</option>
                                    <option value="Almacén 4">Almacén 4</option>
                                    <option value="Almacén 5">Almacén 5</option>
                                </select>
                            </div>

                            {(editForm.data.warehouse === 'Almacén 4' || editForm.data.warehouse === 'Almacén 5') && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cubículo</label>
                                    <select
                                        value={editForm.data.cubicle}
                                        onChange={e => editForm.setData('cubicle', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                            <option key={num} value={num.toString()}>{num}</option>
                                        ))}
                                    </select>
                                    {editForm.errors.cubicle && <p className="text-red-500 text-xs mt-1">{editForm.errors.cubicle}</p>}
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingScan(null)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md disabled:opacity-50"
                                >
                                    {editForm.processing ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Unit Modal */}
            {viewingUnit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-xl font-bold text-gray-800">Detalles de la Unidad</h3>
                            <button onClick={() => setViewingUnit(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Operadora Logística</span>
                                <div className="text-lg font-black text-indigo-900">
                                    {(viewingUnit.shipment_order || viewingUnit.shipmentOrder)?.operator_name || viewingUnit.operator?.operator_name || 'N/A'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">No. Económico</span>
                                    <div className="font-bold text-gray-800">
                                        {(viewingUnit.shipment_order || viewingUnit.shipmentOrder)?.unit_number ||
                                            (viewingUnit.shipment_order || viewingUnit.shipmentOrder)?.economic_number ||
                                            viewingUnit.operator?.economic_number || 'N/A'}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tipo de Unidad</span>
                                    <div className="font-bold text-gray-800">
                                        {(viewingUnit.shipment_order || viewingUnit.shipmentOrder)?.unit_type || viewingUnit.operator?.unit_type || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Placas Tractor</span>
                                    <div className="font-bold text-gray-800">
                                        {(viewingUnit.shipment_order || viewingUnit.shipmentOrder)?.tractor_plate || viewingUnit.operator?.tractor_plate || 'N/A'}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Placas Remolque</span>
                                    <div className="font-bold text-gray-800">
                                        {(viewingUnit.shipment_order || viewingUnit.shipmentOrder)?.trailer_plate || viewingUnit.operator?.trailer_plate || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Línea Transportista</span>
                                <div className="font-bold text-gray-800">
                                    {(viewingUnit.shipment_order || viewingUnit.shipmentOrder)?.transport_company || viewingUnit.operator?.transporter_line || 'N/A'}
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between text-xs text-gray-400 italic">
                                <span>Folio: {(viewingUnit.shipment_order || viewingUnit.shipmentOrder)?.folio || 'DIRECTO'}</span>
                                <span>ID Escaneo: {viewingUnit.id}</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => setViewingUnit(null)}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg"
                            >
                                Cerrar Detalles
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center animate-scale-in">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">¿Eliminar Registro?</h3>
                        <p className="text-gray-500 mb-6">Esta acción eliminará el registro del historial. No afecta el estatus de la orden si ya fue procesada, pero borrará la evidencia de este escaneo.</p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            <form onSubmit={submitForm} className="space-y-6 flex flex-col justify-center">
                                <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                                    {(scanResult.apt_operation_type === 'scale' || !scanResult.apt_operation_type) && (
                                        <label className={`flex-1 text-center py-2 rounded-md cursor-pointer transition-all ${data.operation_type === 'scale'
                                            ? 'bg-white shadow-sm text-indigo-700 font-bold'
                                            : scanResult.force_burreo
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : 'text-gray-500'}`}>
                                            <input
                                                type="radio"
                                                className="hidden"
                                                name="op_type"
                                                checked={data.operation_type === 'scale'}
                                                onChange={() => !scanResult.force_burreo && setData('operation_type', 'scale')}
                                                disabled={scanResult.force_burreo}
                                            />
                                            {scanResult.force_burreo ? <span className="line-through decoration-2">Descarga Báscula</span> : 'Descarga Báscula'}
                                        </label>
                                    )}
                                    {(scanResult.apt_operation_type === 'burreo' || !scanResult.apt_operation_type) && (
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
                                    )}
                                </div>
                                {scanResult.force_burreo && (
                                    <div className="text-amber-600 text-sm font-bold text-center -mt-4 mb-2">
                                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                                        Modo Burreo Activado Automáticamente (ETB Detectado)
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Asignar Almacén
                                    </label>
                                    <select
                                        value={data.warehouse}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setData(data => ({
                                                ...data,
                                                warehouse: val,
                                                cubicle: (val === 'Almacén 4' || val === 'Almacén 5') ? data.cubicle : ''
                                            }));
                                        }}
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
                                    </select>
                                </div>
                                {(data.warehouse === 'Almacén 4' || data.warehouse === 'Almacén 5') && (
                                    <div className="animate-fade-in-up">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Asignar Cubículo
                                        </label>
                                        <select
                                            value={data.cubicle}
                                            onChange={e => setData('cubicle', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 text-lg"
                                            required
                                        >
                                            <option value="">-- Seleccionar --</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                                <option key={num} value={num.toString()}>
                                                    {num}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Requerido para Almacén 4 y 5 (Opciones 1-8)</p>
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
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 mt-8">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                        <h3 className="text-indigo-900 font-bold text-lg flex items-center gap-2">
                            <Scan className="w-5 h-5 text-indigo-600" />
                            Movimientos Recientes
                        </h3>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">{recentScans.length} registros</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-indigo-800 to-indigo-900">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Hora</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Ubicación</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">No. Económico</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentScans.map((scan) => (
                                    <tr key={scan.id} className="hover:bg-indigo-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                            {new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                                                {scan.warehouse} {(scan.warehouse === 'Almacén 4' || scan.warehouse === 'Almacén 5') && scan.cubicle ? `- Cubículo ${scan.cubicle}` : ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                            {(scan.shipment_order || scan.shipmentOrder)?.unit_number ||
                                                (scan.shipment_order || scan.shipmentOrder)?.economic_number ||
                                                scan.operator?.economic_number || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setViewingUnit(scan)}
                                                    className="inline-flex items-center text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                                                    title="Ver detalles de unidad"
                                                >
                                                    <Search className="w-4 h-4 mr-1.5" />
                                                    Ver
                                                </button>
                                                <button
                                                    onClick={() => startEdit(scan)}
                                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-colors border border-transparent hover:border-gray-200"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(scan.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-md transition-colors border border-transparent hover:border-gray-200"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {recentScans.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            <Scan className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">Sin movimientos hoy</p>
                                            <p className="text-sm">Los registros aparecerán aquí.</p>
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
