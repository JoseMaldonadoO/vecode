import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm } from "@inertiajs/react";
import {
    Scale,
    Truck,
    Search,
    Save,
    Link as LinkIcon,
    Box,
    User,
    MapPin,
    Anchor,
    AlertCircle,
    FileText,
    Settings,
    Camera,
    X,
} from "lucide-react";
import { QrReader } from "react-qr-reader";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import axios from "axios";

export default function EntrySale({
    auth,
    active_scale_id = 1,
}: {
    auth: any;
    active_scale_id?: number;
}) {
    const [weight, setWeight] = useState<number>(0);
    const [isConnected, setIsConnected] = useState(false);
    const [qrValue, setQrValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showCamera, setShowCamera] = useState(false); // Camera State
    const [orderDetails, setOrderDetails] = useState<any>(null); // For display only

    // Serial Port Refs
    const portRef = useRef<any>(null);
    const readerRef = useRef<any>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        shipment_order_id: "", // Nullable/Empty if new logic
        vessel_id: "",
        scale_id: active_scale_id, // Use prop

        // Manual / Derived
        client_id: "", // provider ID
        product_id: "",
        provider: "", // Text fallback
        product: "", // Text fallback

        withdrawal_letter: "", // "Carta de Retiro"
        reference: "", // "Referencia"
        consignee: "", // "Consignado"
        destination: "", // "Destino"
        origin: "", // "Origen"
        bill_of_lading: "", // "Carta Porte"

        // Transport (Snapshot)
        driver: "",
        vehicle_plate: "",
        trailer_plate: "",
        vehicle_type: "",
        transport_line: "",
        economic_number: "",

        // Scale
        tare_weight: "",
        observations: "",
    });

    useEffect(() => {
        setData("scale_id", active_scale_id);
    }, [active_scale_id]);

    // ... existing Serial/Search logic ...

    // Inside Render, remove Selector and show static Badge
    // ...
    //   <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full md:w-64 flex flex-col justify-center items-center">
    //      <div className="flex items-center gap-2 mb-2 text-gray-500 uppercase text-xs font-bold tracking-wider">
    //          <Settings className="w-4 h-4" /> Báscula Activa
    //      </div>
    //      <div className="text-3xl font-bold text-indigo-600">
    //          #{active_scale_id}
    //      </div>
    //   </div>

    useEffect(() => {
        setData("tare_weight", weight.toString());
    }, [weight]);

    const handleSerialConnect = async () => {
        if ("serial" in navigator) {
            try {
                const port = await (navigator as any).serial.requestPort();
                await port.open({ baudRate: 9600 });
                setIsConnected(true);
                portRef.current = port;
                const textDecoder = new TextDecoderStream();
                const readableStreamClosed = port.readable.pipeTo(
                    textDecoder.writable,
                );
                const reader = textDecoder.readable.getReader();
                readerRef.current = reader;
                let buffer = "";
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    if (value) {
                        buffer += value;
                        if (buffer.includes("\n") || buffer.includes("\r")) {
                            const match = buffer.match(/(\d+(?:\.\d+)?)/);
                            if (match) setWeight(parseFloat(match[1]));
                            buffer = "";
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

    const searchOrder = async (codeOverride?: string) => {
        const query = codeOverride || qrValue;
        if (!query) return;

        setIsLoading(true);
        if (codeOverride) setQrValue(codeOverride); // Sync UI

        try {
            const response = await axios.get(route("scale.search-qr"), {
                params: { qr: query },
            });
            const res = response.data;
            setOrderDetails(res);

            if (res.type === "vessel_operator") {
                // New Entry from Vessel Scan
                setData((prev) => ({
                    ...prev,
                    shipment_order_id: "", // It's new
                    vessel_id: res.vessel_id,
                    client_id: res.client_id || "",
                    product_id: res.product_id || "",
                    provider: res.provider,
                    product: res.product,

                    reference: res.reference || "",
                    origin: res.origin,
                    transport_line: res.transport_line,
                    driver: res.driver,
                    vehicle_type: res.vehicle_type,
                    vehicle_plate: res.vehicle_plate,
                    trailer_plate: res.trailer_plate,
                    economic_number: res.economic_number,

                    withdrawal_letter: res.suggested_withdrawal_letter || "",
                    // Manual fields reset
                    consignee: "",
                    destination: "",
                    bill_of_lading: "",
                }));
            } else {
                // Existing Shipment Order
                setData((prev) => ({
                    ...prev,
                    shipment_order_id: res.id,
                    provider: res.provider,
                    product: res.product,
                    origin: res.origin,
                    transport_line: res.transporter,
                    driver: res.driver,
                    vehicle_plate: res.vehicle_plate,
                    trailer_plate: res.trailer_plate,
                    vehicle_type: res.vehicle_type,

                    withdrawal_letter: res.withdrawal_letter || "",
                    reference: res.reference || "",
                    consignee: res.consignee || "",
                    destination: res.destination || "",
                    bill_of_lading: res.carta_porte || "",
                }));
            }
        } catch (error) {
            console.error("Search error:", error);
            alert("No encontrado.");
            setOrderDetails(null);
        } finally {
            setIsLoading(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation: Weigh > 0? User might want to save manual wait if serial fails, but generally > 0.
        // if (weight <= 0) { alert("Peso debe ser mayor a 0."); return; }
        if (!data.driver) {
            alert("Faltan datos de conductor.");
            return;
        }
        post(route("scale.entry.store"), {
            onSuccess: () => {
                reset();
                setOrderDetails(null);
                setQrValue("");
            },
        });
    };

    return (
        <DashboardLayout
            user={auth.user}
            header="Báscula - Salida / Carga (Peso Tara)"
        >
            <Head title="Salida (Carga)" />

            <div className="py-6 max-w-7xl mx-auto px-4 space-y-6">
                {/* Top Bar: Search & Scale Selector */}
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {/* Search */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <Search className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800 text-lg">
                                    Búsqueda
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Escanea QR de Operador (Barco) o Folio
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto items-center">
                            {/* Camera Toggle */}
                            <button
                                type="button"
                                onClick={() => setShowCamera(!showCamera)}
                                className={`p-3 rounded-lg border transition-colors ${showCamera ? "bg-red-100 border-red-200 text-red-600" : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"}`}
                                title={
                                    showCamera
                                        ? "Cerrar Cámara"
                                        : "Abrir Cámara"
                                }
                            >
                                {showCamera ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Camera className="w-5 h-5" />
                                )}
                            </button>

                            <TextInput
                                value={qrValue}
                                onChange={(e) => setQrValue(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && searchOrder()
                                }
                                className="w-full md:w-64 text-lg border-indigo-200 focus:border-indigo-500"
                                placeholder="QR / ID..."
                                autoFocus={!showCamera}
                            />
                            <PrimaryButton
                                onClick={() => searchOrder()}
                                disabled={isLoading}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {isLoading ? "..." : "Buscar"}
                            </PrimaryButton>
                        </div>
                    </div>

                    {/* Camera View */}
                    {showCamera && (
                        <div className="w-full max-w-sm mx-auto mb-6 bg-black rounded-lg overflow-hidden relative shadow-2xl animate-fade-in-down">
                            <QrReader
                                onResult={(result: any, error) => {
                                    if (!!result) {
                                        const text =
                                            typeof result.getText === "function"
                                                ? result.getText()
                                                : result.text;
                                        if (text) {
                                            setQrValue(text);
                                            setShowCamera(false);
                                            // Auto-search can be tricky if state update isn't fast enough, so we pass text directly
                                            // But searchOrder uses state 'qrValue'.
                                            // We should modify searchOrder to accept an argument or use effect.
                                            // For safety, let's just set value and let user click or trigger explicitly if we refactor.
                                            // Actually, let's refactor searchOrder to take optional arg.
                                            searchOrder(text);
                                        }
                                    }
                                }}
                                constraints={{ facingMode: "environment" }}
                                videoStyle={{ width: "100%" }}
                                className="w-full"
                            />
                            <p className="text-white text-center py-2 text-sm">
                                Apunte al código QR...
                            </p>
                        </div>
                    )}

                    {/* Scale Badge (Read Only) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full md:w-64 flex flex-col justify-center items-center">
                        <div className="flex items-center gap-2 mb-2 text-gray-500 uppercase text-xs font-bold tracking-wider">
                            <Settings className="w-4 h-4" /> Báscula Activa
                        </div>
                        <div className="text-3xl font-bold text-indigo-600">
                            #{active_scale_id}
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                    {/* LEFT COLUMN: Weight & Connection (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="bg-gray-900 p-6 text-center">
                                <h2 className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">
                                    Peso Bruto (Entrada)
                                </h2>
                                <div className="text-6xl font-mono font-bold text-[#39ff33] tracking-tighter">
                                    {weight > 0 ? weight : "0.00"}{" "}
                                    <span className="text-2xl text-gray-500">
                                        kg
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleSerialConnect}
                                    type="button"
                                    className={`flex items-center justify-center px-4 py-3 rounded-xl font-bold transition-all ${isConnected ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"}`}
                                >
                                    <LinkIcon className="w-5 h-5 mr-2" />
                                    {isConnected ? "Conectado" : "Conectar"}
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                                >
                                    <Scale className="w-5 h-5 mr-2" /> Capturar
                                </button>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div
                            className={`rounded-2xl p-6 border ${orderDetails ? (orderDetails.type === "vessel_operator" ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200") : "bg-gray-50 border-gray-200"}`}
                        >
                            <h3 className="font-bold text-gray-800 flex items-center mb-2">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                Estado del Registro
                            </h3>
                            <p className="text-sm text-gray-600">
                                {orderDetails
                                    ? orderDetails.type === "vessel_operator"
                                        ? "Nueva Entrada (Barco detectado)"
                                        : "Orden Existente (Precargada)"
                                    : "Esperando lectura de QR..."}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Form Fields (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* 1. Origen y Documentación */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center mb-4 pb-2 border-b border-gray-100">
                                <Anchor className="w-5 h-5 mr-2 text-indigo-500" />
                                Origen y Documentación
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <InputLabel value="Proveedor / Cliente *" />
                                    <TextInput
                                        value={data.provider || ""}
                                        onChange={(e) =>
                                            setData("provider", e.target.value)
                                        }
                                        readOnly={!!data.client_id}
                                        className={`w-full ${data.client_id ? "bg-gray-50" : ""}`}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Producto *" />
                                    <TextInput
                                        value={data.product || ""}
                                        onChange={(e) =>
                                            setData("product", e.target.value)
                                        }
                                        readOnly={!!data.product_id}
                                        className={`w-full ${data.product_id ? "bg-gray-50" : ""}`}
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Referencia (Si Barco=N/A)" />
                                    <TextInput
                                        value={data.reference}
                                        onChange={(e) =>
                                            setData("reference", e.target.value)
                                        }
                                        className="w-full"
                                        placeholder="Ej. Orden de Venta"
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Carta de Retiro (Sugerido)" />
                                    <TextInput
                                        value={data.withdrawal_letter}
                                        onChange={(e) =>
                                            setData(
                                                "withdrawal_letter",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full"
                                        placeholder="Consecutivo..."
                                    />
                                </div>
                                {/* Force Origin if needed */}
                                <div>
                                    <InputLabel value="Origen" />
                                    <TextInput
                                        value={data.origin}
                                        onChange={(e) =>
                                            setData("origin", e.target.value)
                                        }
                                        readOnly={!!orderDetails?.origin}
                                        className="w-full bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Destino */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center mb-4 pb-2 border-b border-gray-100">
                                <MapPin className="w-5 h-5 mr-2 text-red-500" />
                                Destino
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Consignado a (Cliente Manual)" />
                                    <TextInput
                                        value={data.consignee}
                                        onChange={(e) =>
                                            setData("consignee", e.target.value)
                                        }
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Destino Final" />
                                    <TextInput
                                        value={data.destination}
                                        onChange={(e) =>
                                            setData(
                                                "destination",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Transporte (Read Only mostly) */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center mb-4 pb-2 border-b border-gray-100">
                                <Truck className="w-5 h-5 mr-2 text-amber-500" />
                                Transporte (QR)
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono bg-amber-50 p-4 rounded-xl mb-4">
                                <div>
                                    <span className="block text-gray-500 uppercase">
                                        Línea
                                    </span>
                                    <span className="font-bold text-gray-800">
                                        {data.transport_line || "-"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 uppercase">
                                        Operador
                                    </span>
                                    <span className="font-bold text-gray-800">
                                        {data.driver || "-"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 uppercase">
                                        Placa
                                    </span>
                                    <span className="font-bold text-gray-800">
                                        {data.vehicle_plate || "-"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 uppercase">
                                        Remolque
                                    </span>
                                    <span className="font-bold text-gray-800">
                                        {data.trailer_plate || "-"}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Carta Porte (Manual si aplica)" />
                                    <TextInput
                                        value={data.bill_of_lading}
                                        onChange={(e) =>
                                            setData(
                                                "bill_of_lading",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 4. Báscula (Simplified) */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center mb-4 pb-2 border-b border-gray-100">
                                <Scale className="w-5 h-5 mr-2 text-green-600" />
                                Datos de Pesaje
                            </h3>
                            {/* Removed Lot/Seal/Container Type as per request */}
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <div>
                                    <InputLabel value="Observaciones" />
                                    <TextInput
                                        value={data.observations}
                                        onChange={(e) =>
                                            setData(
                                                "observations",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full"
                                        placeholder="Comentarios adicionales..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <PrimaryButton
                                disabled={
                                    processing ||
                                    (!data.shipment_order_id && !data.vessel_id)
                                }
                                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 shadow-xl transform transition hover:scale-[1.01] flex justify-center items-center"
                            >
                                <Save className="w-6 h-6 mr-2" />
                                GUARDAR ENTRADA
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
