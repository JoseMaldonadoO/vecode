import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Scale, Truck, Search, Save, AlertCircle, Link as LinkIcon, Box, FileText, User, MapPin } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import axios from 'axios';

export default function EntryMP({ auth }: { auth: any }) {
    const [weight, setWeight] = useState<number>(0);
    const [isConnected, setIsConnected] = useState(false);
    const [qrValue, setQrValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [lotes, setLotes] = useState<string[]>([]); // To be populated

    // Serial Port Refs
    const portRef = useRef<any>(null);
    const readerRef = useRef<any>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        shipment_order_id: '',
        tare_weight: '',
        seal: '',
        lot: '',
        container_type: 'N/A', // PROAGRO, FERTINAL, N/A
        container_id: '', // Warehouse if Lot is N/A
        observations: '',
    });

    // Mock Lotes for now if not passed from backend, or fetch them
    useEffect(() => {
        // Ideally fetch from backend. For now hardcod or leave empty
        // In a real scenario we'd use usePage props or an API call
        setLotes(['LOTE-001', 'LOTE-A23', 'LOTE-B99']);
    }, []);

    // Effect to update form weight when scale weight changes
    useEffect(() => {
        setData('tare_weight', weight.toString());
    }, [weight]);

    const handleSerialConnect = async () => {
        if ('serial' in navigator) {
            try {
                const port = await (navigator as any).serial.requestPort();
                await port.open({ baudRate: 9600, dataBits: 8, parity: "none", stopBits: 1 });
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
                            // Extract numbers
                            const match = buffer.match(/(\d+(?:\.\d+)?)/);
                            if (match) {
                                setWeight(parseFloat(match[1]));
                            }
                            buffer = '';
                        }
                    }
                }
            } catch (error) {
                console.error("Serial error:", error);
                alert("Error al conectar con la báscula: " + error);
            }
        } else {
            alert("Web Serial API no soportada en este navegador.");
        }
    };

    const searchOrder = async () => {
        if (!qrValue) return;
        setIsLoading(true);
        try {
            const response = await axios.get(route('scale.search-qr'), { params: { qr: qrValue } });
            setOrderDetails(response.data);
            setData('shipment_order_id', response.data.id);
        } catch (error) {
            console.error("Search error:", error);
            alert("No se encontró la orden con ese código QR/ID.");
            setOrderDetails(null);
        } finally {
            setIsLoading(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (weight <= 0) {
            alert("El peso debe ser mayor a 0.");
            return;
        }
        post(route('scale.entry.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <DashboardLayout user={auth.user} header="Báscula - Entrada MI / MP">
            <Head title="Entrada MI / MP" />

            <div className="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                    <InputLabel value="Escanea o captura QR:" className="text-lg" />
                    <TextInput
                        value={qrValue}
                        onChange={(e) => setQrValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchOrder()}
                        className="w-48 text-lg"
                        placeholder="QR / ID Orden"
                        autoFocus
                    />
                    <PrimaryButton onClick={searchOrder} disabled={isLoading}>
                        {isLoading ? 'Buscando...' : <><Search className="w-4 h-4 mr-2" /> Buscar</>}
                    </PrimaryButton>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: SCALE Display */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center">
                            <h2 className="text-gray-500 font-semibold mb-2">PESO ACTUAL</h2>
                            <div className="bg-black rounded-lg p-6 mb-4 shadow-inner">
                                <span className={`text-6xl font-mono font-bold ${weight > 0 ? 'text-[#39ff33]' : 'text-gray-600'}`}>
                                    {weight > 0 ? `${weight} Kg` : 'S/C'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleSerialConnect}
                                    type="button"
                                    className={`flex items-center justify-center px-4 py-3 rounded-lg border font-bold transition-all ${isConnected
                                            ? 'bg-green-100 text-green-700 border-green-300'
                                            : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                                        }`}
                                >
                                    <LinkIcon className="w-5 h-5 mr-2" />
                                    {isConnected ? 'Conectado' : 'Enlazar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {/* Manual read logic if needed, mostly auto via hook */ }}
                                    className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 font-bold hover:bg-gray-200"
                                >
                                    <Scale className="w-5 h-5 mr-2" />
                                    Capturar
                                </button>
                            </div>
                        </div>

                        {/* Order Summary Card */}
                        {orderDetails && (
                            <div className="bg-green-50 rounded-xl shadow border border-green-200 p-6">
                                <h3 className="text-green-800 font-bold flex items-center mb-4">
                                    <Truck className="w-5 h-5 mr-2" />
                                    Datos del Proveedor
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-green-100 pb-2">
                                        <span className="text-green-600">Nombre:</span>
                                        <span className="font-bold text-gray-800">{orderDetails.provider}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-green-100 pb-2">
                                        <span className="text-green-600">Origen:</span>
                                        <span className="font-bold text-gray-800">{orderDetails.origin}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-green-100 pb-2">
                                        <span className="text-green-600">Destino:</span>
                                        <span className="font-bold text-gray-800">{orderDetails.destination}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Form Details */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 text-lg">Registro de Entrada</h3>
                            {orderDetails && <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">Orden #{orderDetails.id.substring(0, 8)}</span>}
                        </div>

                        <form onSubmit={submit} className="p-6 space-y-6">

                            {/* Transportista Section */}
                            <div className="space-y-4">
                                <h4 className="flex items-center text-sm font-bold text-gray-500 uppercase tracking-wider bg-gray-50 p-2 rounded">
                                    <Truck className="w-4 h-4 mr-2" /> Datos del Transportista
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel value="Transporte (Línea)" />
                                        <TextInput value={orderDetails?.transport_line || ''} readOnly className="w-full bg-gray-50" />
                                    </div>
                                    <div>
                                        <InputLabel value="Carta Porte" />
                                        <TextInput value={orderDetails?.carta_porte || ''} readOnly className="w-full bg-gray-50" />
                                    </div>
                                    <div>
                                        <InputLabel value="Operador" />
                                        <TextInput value={orderDetails?.driver || ''} readOnly className="w-full bg-gray-50" />
                                    </div>
                                    <div>
                                        <InputLabel value="Tipo de Unidad" />
                                        <TextInput value={orderDetails?.vehicle_type || ''} readOnly className="w-full bg-gray-50" />
                                    </div>
                                    <div>
                                        <InputLabel value="Placa Tracto" />
                                        <TextInput value={orderDetails?.vehicle_plate || ''} readOnly className="w-full bg-gray-50" />
                                    </div>
                                    <div>
                                        <InputLabel value="Placa Remolque" />
                                        <TextInput value={orderDetails?.trailer_plate || ''} readOnly className="w-full bg-gray-50" />
                                    </div>
                                </div>
                            </div>

                            {/* Embarque Section */}
                            <div className="space-y-4">
                                <h4 className="flex items-center text-sm font-bold text-gray-500 uppercase tracking-wider bg-gray-50 p-2 rounded">
                                    <Box className="w-4 h-4 mr-2" /> Del Embarque
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1">
                                        <InputLabel value="Producto" />
                                        <TextInput value={orderDetails?.product || ''} readOnly className="w-full bg-gray-50" />
                                    </div>
                                    <div>
                                        <InputLabel value="Presentación" />
                                        <TextInput value={orderDetails?.presentation || ''} readOnly className="w-full bg-gray-50" />
                                    </div>
                                    <div>
                                        <InputLabel value="Carga Programada" />
                                        <TextInput value={orderDetails?.programmed_weight ? `${orderDetails.programmed_weight} Kg` : ''} readOnly className="w-full bg-gray-50" />
                                    </div>
                                </div>
                            </div>

                            {/* Bascula Input Section */}
                            <div className="space-y-4 border-t pt-4">
                                <h4 className="flex items-center text-sm font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 p-2 rounded">
                                    <Scale className="w-4 h-4 mr-2" /> Datos de Báscula
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <InputLabel value="Envase" />
                                        <select
                                            className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.container_type}
                                            onChange={(e) => setData('container_type', e.target.value)}
                                        >
                                            <option value="N/A">N/A</option>
                                            <option value="PROAGRO">PROAGRO</option>
                                            <option value="FERTINAL">FERTINAL</option>
                                        </select>
                                    </div>
                                    <div>
                                        <InputLabel value="Lote" />
                                        <select
                                            className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            value={data.lot}
                                            onChange={(e) => setData('lot', e.target.value)}
                                        >
                                            <option value="">Seleccione un lote</option>
                                            {lotes.map((l, i) => <option key={i} value={l}>{l}</option>)}
                                            <option value="N/A">N/A</option>
                                        </select>
                                    </div>
                                    {data.lot === 'N/A' && (
                                        <div>
                                            <InputLabel value="Almacén / Detalles" />
                                            <TextInput
                                                value={data.container_id}
                                                onChange={(e) => setData('container_id', e.target.value)}
                                                className="w-full"
                                                placeholder="Especifique almacén"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel value="Sello" />
                                        <TextInput
                                            value={data.seal}
                                            onChange={(e) => setData('seal', e.target.value)}
                                            className="w-full"
                                            required
                                        />
                                        {errors.seal && <p className="text-red-500 text-xs mt-1">{errors.seal}</p>}
                                    </div>
                                    <div>
                                        <InputLabel value="Operador de Báscula" />
                                        <TextInput value={auth.user.name} readOnly className="w-full bg-gray-100" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Observaciones" />
                                    <TextInput
                                        value={data.observations}
                                        onChange={(e) => setData('observations', e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <PrimaryButton disabled={processing || !data.shipment_order_id} className="w-full md:w-auto h-12 text-lg">
                                    <Save className="w-5 h-5 mr-2" />
                                    Guardar Entrada
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
