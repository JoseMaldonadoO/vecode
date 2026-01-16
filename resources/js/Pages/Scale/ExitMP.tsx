import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Scale, Truck, Save, Link as LinkIcon, AlertCircle, Warehouse, Box, ArrowRight, Search, Camera, X } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';

export default function ExitMP({ auth, order, active_scale_id = 1 }: { auth: any, order?: any, active_scale_id?: number }) {
    // State for Search
    const [qrValue, setQrValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

    // State for Weighing
    const [weight, setWeight] = useState<number>(0);
    const [isConnected, setIsConnected] = useState(false);
    const portRef = useRef<any>(null);
    const readerRef = useRef<any>(null);

    const { data, setData, post, processing } = useForm({
        shipment_order_id: order?.id || '',
        weight: '', // Second Weight
        scale_id: active_scale_id, // Exit Scale
    });

    useEffect(() => {
        setData('weight', weight.toString());
    }, [weight]);

    const handleSerialConnect = async () => {
        if ('serial' in navigator) {
            try {
                const port = await (navigator as any).serial.requestPort();
                await port.open({ baudRate: 9600 });
                setIsConnected(true);
                portRef.current = port;
                const textDecoder = new TextDecoderStream();
                const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
                const reader = textDecoder.readable.getReader();
                readerRef.current = reader;
                let buffer = '';
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    if (value) {
                        buffer += value;
                        if (buffer.includes('\n') || buffer.includes('\r')) {
                            const match = buffer.match(/(\d+(?:\.\d+)?)/);
                            if (match) setWeight(parseFloat(match[1]));
                            buffer = '';
                        }
                    }
                }
            } catch (error) {
                console.error("Serial error:", error);
                alert("Error al conectar: " + error);
            }
        } else {
            alert("API Web Serial no soportada.");
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (weight <= 0) { alert("Peso debe ser mayor a 0."); return; }
        post(route('scale.exit.store'));
    };

    const searchOrder = async (codeOverride?: string) => {
        const query = codeOverride || qrValue;
        if (!query) return;

        setIsLoading(true);
        if (codeOverride) setQrValue(codeOverride);

        try {
            // Use same generic search
            const response = await axios.get(route('scale.search-qr'), { params: { qr: query } });
            const res = response.data;

            if (res && res.type === 'shipment_order') {
                // Navigate to Exit with ID
                // We could just set state, but full page reload is safer for state reset
                router.visit(route('scale.exit', res.id) + `?scale_id=${active_scale_id}`);
            } else {
                alert("Código no válido para Salida (debe ser una Orden activa).");
            }
        } catch (error) {
            console.error("Search error:", error);
            alert("Orden no encontrada.");
        } finally {
            setIsLoading(false);
        }
    };

    // If no order, show Search Screen
    if (!order) {
        return (
            <DashboardLayout user={auth.user} header="Báscula - Salida / Destare">
                <Head title="Buscar Salida" />
                <div className="max-w-xl mx-auto py-12 px-4">
                    <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                        <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Escanear para Salida</h2>
                        <p className="text-gray-500 mb-6">Escanee el QR del chofer o ingrese el folio de la orden para registrar el peso de salida.</p>

                        {showCamera && (
                            <div className="w-full max-w-sm mx-auto mb-6 bg-black rounded-lg overflow-hidden relative shadow-2xl animate-fade-in-down">
                                <QrReader
                                    onResult={(result: any, error) => {
                                        if (!!result) {
                                            const text = typeof result.getText === 'function' ? result.getText() : result.text;
                                            if (text) {
                                                setQrValue(text);
                                                setShowCamera(false);
                                                searchOrder(text);
                                            }
                                        }
                                    }}
                                    constraints={{ facingMode: 'environment' }}
                                    videoStyle={{ width: '100%' }}
                                    className="w-full"
                                />
                                <p className="text-white text-center py-2 text-sm">Apunte al código QR...</p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowCamera(!showCamera)}
                                className={`p-3 rounded-lg border transition-colors ${showCamera ? 'bg-red-100 border-red-200 text-red-600' : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {showCamera ? <X className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
                            </button>
                            <TextInput
                                value={qrValue}
                                onChange={(e) => setQrValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchOrder()}
                                className="w-full text-lg border-indigo-200 focus:border-indigo-500"
                                placeholder="QR / Folio..."
                                autoFocus={!showCamera}
                            />
                            <PrimaryButton onClick={() => searchOrder()} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                                {isLoading ? '...' : 'Buscar'}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Net Weight Calculation (Preview)
    // Always Positive logic: abs(Current - Entry)
    const currentWeight = weight > 0 ? weight : 0;
    const entryWeight = parseFloat(order.entry_weight) || 0;
    const netWeight = Math.abs(currentWeight - entryWeight);

    return (
        <DashboardLayout user={auth.user} header={`Salida / Destare - ${order.folio}`}>
            <Head title="Salida Báscula" />

            <div className="py-6 max-w-7xl mx-auto px-4 space-y-6">

                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <Truck className="w-6 h-6 mr-2 text-indigo-500" />
                            {order.transport_line}
                        </h2>
                        <div className="flex gap-4 text-sm text-gray-500 mt-1">
                            <span>Placa: <strong className="text-gray-700">{order.vehicle_plate}</strong></span>
                            <span>Chofer: <strong className="text-gray-700">{order.driver}</strong></span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs uppercase text-gray-400">Folio</span>
                        <span className="font-mono font-bold text-xl text-indigo-600">{order.folio}</span>
                    </div>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT: Scale */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="bg-gray-900 p-6 text-center relative">
                                <h2 className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">Peso Bruto (Salida)</h2>
                                <div className="text-6xl font-mono font-bold text-[#39ff33] tracking-tighter">
                                    {weight > 0 ? weight : '0.00'} <span className="text-2xl text-gray-500">kg</span>
                                </div>
                                {auth.user?.roles?.some((r: string) => r.toLowerCase().includes('admin')) && (
                                    <div className="mt-2 flex justify-center">
                                        <input
                                            type="number"
                                            className="w-32 bg-gray-800 text-white border-gray-700 text-center rounded-lg text-sm"
                                            placeholder="Manual Admin"
                                            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleSerialConnect}
                                    type="button"
                                    className={`flex items-center justify-center px-4 py-3 rounded-xl font-bold transition-all ${isConnected ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                                >
                                    <LinkIcon className="w-5 h-5 mr-2" />
                                    {isConnected ? 'Conectado' : 'Conectar'}
                                </button>
                                <button type="button" className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50">
                                    <Scale className="w-5 h-5 mr-2" /> Capturar
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Box className="w-5 h-5 text-gray-400" />
                                <h3 className="font-bold text-gray-700">Cálculo de Peso</h3>
                            </div>
                            <div className="space-y-3 font-mono text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Peso Entrada (Tara):</span>
                                    <span className="font-bold">{entryWeight} kg</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Peso Salida (Bruto):</span>
                                    <span className="font-bold">{currentWeight} kg</span>
                                </div>
                                <div className="border-t border-gray-100 pt-2 flex justify-between text-lg text-indigo-600 font-bold">
                                    <span>Peso Neto:</span>
                                    <span>{netWeight} kg</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Details */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Warehouse Assignment Info (Read Only) */}
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <h3 className="text-lg font-bold text-blue-800 flex items-center mb-4">
                                <Warehouse className="w-5 h-5 mr-2" />
                                Asignación de Almacén (APT)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <span className="block text-xs uppercase text-blue-400 font-bold">Almacén</span>
                                    <div className="text-xl font-bold text-blue-900">{order.warehouse}</div>
                                </div>
                                <div>
                                    <span className="block text-xs uppercase text-blue-400 font-bold">Cubículo / Posición</span>
                                    <div className="text-xl font-bold text-blue-900">{order.cubicle}</div>
                                </div>
                            </div>
                            {order.warehouse === 'N/A' && (
                                <div className="mt-4 flex items-center text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Advertencia: No se ha asignado almacén en APT. Verifique antes de dar salida.
                                </div>
                            )}
                        </div>

                        {/* Order Info */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                                Detalles de la Carga
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="Cliente / Proveedor" />
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-bold text-gray-700">
                                        {order.provider}
                                    </div>
                                </div>
                                <div>
                                    <InputLabel value="Producto" />
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-bold text-gray-700">
                                        {order.product}
                                    </div>
                                </div>
                                <div>
                                    <InputLabel value="Referencia" />
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
                                        {order.reference || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <InputLabel value="Consignado a" />
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
                                        {order.consignee || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <PrimaryButton disabled={processing || weight <= 0} className="w-full h-16 text-xl bg-indigo-600 hover:bg-indigo-700 shadow-xl transform transition hover:scale-[1.01] flex justify-center items-center">
                                <Save className="w-6 h-6 mr-2" />
                                REGISTRAR PESO NETO Y SALIDA
                            </PrimaryButton>
                        </div>

                    </div>

                </form>
            </div>
        </DashboardLayout>
    );
}
