import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import {
    Save,
    ArrowLeft,
    Check,
    ChevronsUpDown,
    Ship,
    Calendar,
    Hash,
    FileText,
    User,
    Truck,
    MapPin,
    Box,
    ShoppingCart,
    Search,
    Scan,
} from "lucide-react";
import { FormEventHandler, useState, Fragment, useEffect } from "react";
import { Combobox, Transition } from "@headlessui/react";
import axios from "axios";
import QrScannerModal from "@/Components/QrScannerModal";

interface Client {
    id: number;
    business_name: string;
    rfc: string;
    address: string;
}
interface Product {
    id: number;
    name: string;
    code: string;
}

interface Operator {
    id: number;
    operator_name: string;
    transporter_line: string; // Empresa Transportista
    unit_type: string;
    tractor_plate: string;
    trailer_plate: string;
    economic_number: string;
    license: string;
    brand_model: string;
}

export default function Create({
    auth,
    clients,
    products,
    sales_orders,
    default_folio,
}: {
    auth: any;
    clients: Client[];
    products: Product[];
    sales_orders: any[];
    default_folio: string;
}) {
    const { data, setData, post, processing, errors } = useForm({
        folio: default_folio || "",
        sales_order_id: "", // Reference to OV
        date: new Date().toISOString().split("T")[0],

        client_id: "",
        client_name: "",
        // RFC and Address removed from UI but kept in state if needed or null
        rfc: "",
        address: "",
        consigned_to: "", // New required field

        // Transporter Data
        operator_id: "", // For search
        transport_company: "",
        operator_name: "",
        unit_number: "", // Now "Economic Number" or similar? User said "Cambiar Unidad a Tipo de Unidad" but also "Unidad" (economic number?) stays?
        // Let's map: 
        // "Unidad" input -> displays unit_type
        // "Num Economico" -> economic_number
        unit_type: "",
        tractor_plate: "",
        trailer_plate: "",
        carta_porte: "", // Manual

        // Product Data
        product: "",
        presentation: "GRANEL", // Default
        sack_type: "", // 25, 50, 200, 500
        programmed_tons: "", // Manual now
        balance: "", // Auto-filled from OV
        destination: "",

        observations: "",
        documenter_name: auth.user.name,

        // Unused/Hidden
        sacks_count: "",
        shortage_balance: "",
        origin: "PLANTA",
        qr_code: "",
        license_number: "",
        status: "created",
        scale_name: "",
        economic_number: "",
        state: "", // New Field
    });

    const [queryClient, setQueryClient] = useState("");
    const [qrInput, setQrInput] = useState(""); // Replaces queryOperator
    // const [foundOperators, setFoundOperators] = useState<Operator[]>([]); // Removed as we don't list search results anymore
    const [showQrScanner, setShowQrScanner] = useState(false);
    const [isProcessingQr, setIsProcessingQr] = useState(false);
    const [cartaPorteWarning, setCartaPorteWarning] = useState<string | null>(null);

    // QR Scan Handler (Used by both Camera and Physical Scanner)
    const handleQrScan = async (text: string | null) => {
        if (!text || isProcessingQr) return;
        setIsProcessingQr(true);

        // Parse: support both "OP_EXIT 3" and "OP_EXIT 3|JUAN|..."
        // Also support "OP?EXIT" which can happen with bad keyboard layouts on scanners (US vs ES)
        let cleanText = text.trim();

        // Remove "OP_EXIT" prefix (or "OP?EXIT" / "OP'EXIT") and handle pipes
        if (cleanText.toUpperCase().startsWith("OP")) {
            // Replace "OP_EXIT", "OP?EXIT", "OP'EXIT", etc. with empty string
            cleanText = cleanText.replace(/^OP[_\?'\-]EXIT\s*/i, "");
        }

        // 2. If it contains pipes, take the first part
        if (cleanText.includes("|")) {
            cleanText = cleanText.split("|")[0].trim();
        }

        // Now cleanText should be just the ID (e.g., "3")

        try {
            // Search by ID first (assuming text is ID)
            const response = await axios.get(route("documentation.operators.search"), {
                params: { q: cleanText },
            });

            const operators = response.data;
            // Try to find exact match by ID
            const exactMatch = operators.find((op: Operator) =>
                op.id.toString() === cleanText
            );

            if (exactMatch) {
                handleOperatorSelect(exactMatch);
                setShowQrScanner(false);
                setQrInput(""); // Clear input after successful scan
                // Optional: Show success toast
            } else if (operators.length > 0) {
                // If multiple found but not exact, fill first
                handleOperatorSelect(operators[0]);
                setShowQrScanner(false);
                setQrInput("");
            } else {
                alert("Operador no encontrado con el código: " + text + " (ID extraído: " + cleanText + ")");
                // Keep modal open or input focused to retry
            }
        } catch (error) {
            console.error(error);
            alert("Error al buscar operador via QR");
        } finally {
            setIsProcessingQr(false);
        }
    };

    // Handle physical scanner input (Enter key)
    const handleQrInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleQrScan(qrInput);
        }
    };

    // Filter Clients
    const filteredClients =
        queryClient === ""
            ? clients
            : clients.filter((client) =>
                client.business_name
                    .toLowerCase()
                    .replace(/\s+/g, "")
                    .includes(queryClient.toLowerCase().replace(/\s+/g, "")),
            );



    // Removed specific Search Operators Effect as we scan on Enter now

    useEffect(() => {
        if (errors.carta_porte) {
            alert(errors.carta_porte);
        }
    }, [errors.carta_porte]);

    // Validate Carta Porte Uniqueness
    useEffect(() => {
        const checkCartaPorte = async () => {
            if (!data.carta_porte || !data.transport_company) {
                setCartaPorteWarning(null);
                return;
            }

            try {
                const response = await axios.get(route('documentation.check-carta-porte'), {
                    params: {
                        carta_porte: data.carta_porte,
                        transport_company: data.transport_company
                    }
                });

                if (response.data.exists) {
                    setCartaPorteWarning(`⚠️ La Carta Porte "${data.carta_porte}" ya está en uso por ${data.transport_company}.`);
                } else {
                    setCartaPorteWarning(null);
                }
            } catch (error) {
                console.error("Error checking Carta Porte:", error);
            }
        };

        const timeoutId = setTimeout(() => {
            checkCartaPorte();
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [data.carta_porte, data.transport_company]);

    const handleClientSelect = (client: Client | null) => {
        if (!client) return;
        setData((data) => ({
            ...data,
            client_id: client.id.toString(),
            client_name: client.business_name,
            rfc: client.rfc || "",
            address: client.address || "",
        }));
    };

    const handleOperatorSelect = (operator: Operator | null) => {
        if (!operator) return;
        setData((data) => ({
            ...data,
            operator_id: operator.id.toString(),
            operator_name: operator.operator_name,
            transport_company: operator.transporter_line,
            unit_type: operator.unit_type,
            tractor_plate: operator.tractor_plate,
            trailer_plate: operator.trailer_plate,
            economic_number: operator.economic_number,
            unit_number: operator.brand_model, // Map Brand/Model to Unit Number
            license_number: operator.license, // Map License
        }));
    };

    const handleSalesOrderSelect = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const soId = e.target.value;
        const so = sales_orders.find((s) => s.id.toString() === soId);

        if (so) {
            setData((data) => ({
                ...data,
                sales_order_id: soId,
                client_id: so.client_id.toString(),
                client_name: so.client?.business_name || "",
                rfc: so.client?.rfc || "",
                address: so.client?.address || "",
                product: so.product?.name || "",
                balance: so.balance ? so.balance.toString() : "0",
                programmed_tons: "", // Manual as requested
            }));
        } else {
            setData((data) => ({
                ...data,
                sales_order_id: "",
                client_id: "",
                client_name: "",
                rfc: "",
                address: "",
                product: "",
                balance: "",
                programmed_tons: "",
            }));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("documentation.store"));
    };

    return (
        <DashboardLayout user={auth.user} header="Nueva Orden de Embarque">
            <Head title="Crear Orden de Embarque" />

            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href={route("documentation.orders.index")}
                        className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al historial
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-indigo-800 to-indigo-900 px-8 py-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="p-2 bg-indigo-700 rounded-lg mr-3 shadow-inner">
                                <Ship className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-xl">
                                    Nueva Orden de Embarque
                                </h3>
                                <p className="text-indigo-200 text-sm">
                                    Documentación y salida de mercancía
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* SECTION: Información General */}
                            <div className="md:col-span-2">
                                <h4 className="text-gray-900 font-bold mb-4 flex items-center text-lg border-b pb-2">
                                    <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                                    Información General
                                </h4>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Folio O.E.
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.folio}
                                        readOnly
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10 bg-gray-50 font-bold text-gray-600"
                                    />
                                    <Hash className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Fecha
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData("date", e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10"
                                    />
                                    <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Vincular a Orden de Venta (OV) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={data.sales_order_id}
                                        onChange={handleSalesOrderSelect}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10 bg-white font-bold"
                                    >
                                        <option value="">-- Seleccionar OV Obligatorio --</option>
                                        {sales_orders.map((so) => (
                                            <option key={so.id} value={so.id}>
                                                {so.folio}
                                            </option>
                                        ))}
                                    </select>
                                    <ShoppingCart className="w-5 h-5 text-indigo-400 absolute left-3 top-2.5" />
                                </div>
                                {errors.sales_order_id && <span className="text-xs text-red-500 mt-1 block">{errors.sales_order_id}</span>}
                            </div>

                            {/* SECTION: Datos del Cliente */}
                            <div className="md:col-span-2 mt-4">
                                <h4 className="text-gray-900 font-bold text-lg border-b pb-2 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-indigo-600" />
                                    Datos del Cliente
                                </h4>
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Cliente
                                </label>
                                {data.sales_order_id ? (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.client_name}
                                            readOnly
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10 bg-gray-50 font-medium text-gray-700"
                                        />
                                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                ) : (
                                    <Combobox onChange={handleClientSelect}>
                                        <div className="relative">
                                            <div className="relative w-full cursor-default overflow-hidden rounded-lg border border-gray-300 bg-white text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                                                <Combobox.Input
                                                    className="w-full border-none py-2.5 pl-10 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                                    onChange={(event) => setQueryClient(event.target.value)}
                                                    displayValue={() => data.client_name}
                                                    placeholder="Buscar Cliente..."
                                                />
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <User className="w-5 h-5 text-gray-400" />
                                                </div>
                                                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                </Combobox.Button>
                                            </div>
                                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" afterLeave={() => setQueryClient("")}>
                                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                    {filteredClients.map((client) => (
                                                        <Combobox.Option key={client.id} value={client} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-indigo-600 text-white" : "text-gray-900"}`}>
                                                            {({ selected, active }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{client.business_name}</span>
                                                                    {selected ? <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-white" : "text-indigo-600"}`}><Check className="h-5 w-5" aria-hidden="true" /></span> : null}
                                                                </>
                                                            )}
                                                        </Combobox.Option>
                                                    ))}
                                                </Combobox.Options>
                                            </Transition>
                                        </div>
                                    </Combobox>
                                )}
                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Consignar a <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.consigned_to}
                                    onChange={(e) => setData("consigned_to", e.target.value)}
                                    placeholder="Nombre del consignatario"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 uppercase"
                                />
                            </div>

                            {/* REMOVED FROM VIEW: RFC and ADDRESS */}

                            {/* SECTION: Datos del Transportista */}
                            <div className="md:col-span-2 mt-4">
                                <h4 className="text-gray-800 font-bold text-lg border-b pb-2 mb-4 flex items-center">
                                    <Truck className="w-5 h-5 mr-2 text-indigo-600" />
                                    Datos del Transportista
                                </h4>
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-bold text-gray-700">
                                        Escanear Operador (QR)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowQrScanner(true)}
                                        className="text-xs flex items-center text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-2 py-1 rounded transition-colors"
                                    >
                                        <Scan className="w-3 h-3 mr-1" />
                                        Usar Cámara
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.operator_name ? data.operator_name : qrInput}
                                            onKeyDown={handleQrInputKeyDown}
                                            onChange={(e) => {
                                                // If operator is NOT selected, allow typing
                                                if (!data.operator_id) {
                                                    setQrInput(e.target.value);
                                                } else {
                                                    // If operator IS selected, clearing it resets the selection
                                                    if (e.target.value === "") {
                                                        setData(d => ({
                                                            ...d,
                                                            operator_id: "",
                                                            operator_name: "",
                                                            transport_company: "",
                                                            unit_type: "",
                                                            tractor_plate: "",
                                                            trailer_plate: "",
                                                            economic_number: "",
                                                            unit_number: "",
                                                            license_number: "",
                                                        }));
                                                        setQrInput("");
                                                    }
                                                }
                                            }}
                                            className={`w-full rounded-lg border-2 shadow-sm py-2.5 pl-10 pr-10 outline-none transition-all ${data.operator_id
                                                ? "border-green-500 bg-green-50 text-green-800 font-bold focus:border-green-500 focus:ring-green-200"
                                                : "border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200"
                                                }`}
                                            placeholder={data.operator_id ? "Operador Seleccionado" : "Escanee código QR aquí..."}
                                            autoComplete="off"
                                            autoFocus={!data.operator_id}
                                        />
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                            {data.operator_id ? (
                                                <Check className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Scan className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        {/* Clear Button if operator is selected */}
                                        {data.operator_id && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData(d => ({
                                                        ...d,
                                                        operator_id: "",
                                                        operator_name: "",
                                                        transport_company: "",
                                                        unit_type: "",
                                                        tractor_plate: "",
                                                        trailer_plate: "",
                                                        economic_number: "",
                                                        unit_number: "",
                                                        license_number: "",
                                                    }));
                                                    setQrInput("");
                                                    setTimeout(() => document.querySelector<HTMLInputElement>('input[placeholder="Escanee código QR aquí..."]')?.focus(), 100);
                                                }}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-red-500"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    {!data.operator_id && (
                                        <p className="text-xs text-indigo-500 mt-1 font-medium animate-pulse">
                                            Escanee con lector físico o presione Enter tras escribir.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Empresa Transportista
                                </label>
                                <input
                                    type="text"
                                    value={data.transport_company}
                                    readOnly
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Carta Porte <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.carta_porte}
                                    onChange={(e) => setData("carta_porte", e.target.value)}
                                    className={`w-full rounded-lg shadow-sm py-2.5 px-3 ${cartaPorteWarning
                                        ? 'border-yellow-400 focus:border-yellow-500 bg-yellow-50'
                                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                                        }`}
                                />
                                {cartaPorteWarning && (
                                    <p className="text-yellow-700 text-xs mt-1 font-bold animate-pulse">
                                        {cartaPorteWarning}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Tipo de Unidad
                                </label>
                                <input
                                    type="text"
                                    value={data.unit_type}
                                    readOnly
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Placas Tractor
                                </label>
                                <input
                                    type="text"
                                    value={data.tractor_plate}
                                    readOnly
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 bg-gray-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Placas Remolque
                                </label>
                                <input
                                    type="text"
                                    value={data.trailer_plate}
                                    readOnly
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 bg-gray-50"
                                />
                            </div>

                            {/* SECTION: Detalle del Embarque */}
                            <div className="md:col-span-2 mt-4">
                                <h4 className="text-gray-800 font-bold text-lg border-b pb-2 mb-4 flex items-center">
                                    <Box className="w-5 h-5 mr-2 text-indigo-600" />
                                    Detalle del Embarque
                                </h4>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Producto
                                </label>
                                <select
                                    value={data.product}
                                    onChange={(e) => setData("product", e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                >
                                    <option value="">Seleccione...</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.name}>
                                            {p.code} - {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Saldo OV (TM)
                                </label>
                                <input
                                    type="text"
                                    value={data.balance}
                                    readOnly
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 bg-indigo-50 font-black text-indigo-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Presentación
                                </label>
                                <select
                                    value={data.presentation}
                                    onChange={(e) => setData("presentation", e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 uppercase"
                                >
                                    <option value="GRANEL">GRANEL</option>
                                    <option value="ENVASADO">ENVASADO</option>
                                </select>
                            </div>

                            {data.presentation === "ENVASADO" ? (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Tamaño de Saco
                                    </label>
                                    <select
                                        value={data.sack_type}
                                        onChange={(e) => setData("sack_type", e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 font-bold text-blue-800"
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="25">25 KG</option>
                                        <option value="50">50 KG</option>
                                        <option value="200">200 KG</option>
                                        <option value="500">500 KG</option>
                                        <option value="1000">1000 KG</option>
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    {/* Empty placeholder to keep grid alignment if needed, or just nothing */}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Ton. Programadas
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.programmed_tons}
                                    onChange={(e) => setData("programmed_tons", e.target.value)}
                                    className={`w-full rounded-lg shadow-sm focus:ring-indigo-500 py-2.5 px-3 font-bold ${Number(data.programmed_tons) > Number(data.balance)
                                        ? 'border-red-500 focus:border-red-500 bg-red-50'
                                        : 'border-gray-300 focus:border-indigo-500'
                                        }`}
                                    placeholder="0.00"
                                />
                                {Number(data.programmed_tons) > Number(data.balance) && (
                                    <p className="text-red-600 text-[10px] mt-1 font-bold animate-pulse">
                                        ❌ Excede el saldo de la OV ({data.balance} TM)
                                    </p>
                                )}
                                {errors.programmed_tons && (
                                    <p className="text-red-500 text-xs mt-1">{errors.programmed_tons}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Destino
                                </label>
                                <input
                                    type="text"
                                    value={data.destination}
                                    onChange={(e) => setData("destination", e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Estado
                                </label>
                                <select
                                    value={data.state}
                                    onChange={(e) => setData("state", e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 uppercase"
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="AGUASCALIENTES">AGUASCALIENTES</option>
                                    <option value="BAJA CALIFORNIA">BAJA CALIFORNIA</option>
                                    <option value="BAJA CALIFORNIA SUR">BAJA CALIFORNIA SUR</option>
                                    <option value="CAMPECHE">CAMPECHE</option>
                                    <option value="CHIAPAS">CHIAPAS</option>
                                    <option value="CHIHUAHUA">CHIHUAHUA</option>
                                    <option value="CIUDAD DE MEXICO">CIUDAD DE MÉXICO</option>
                                    <option value="COAHUILA">COAHUILA</option>
                                    <option value="COLIMA">COLIMA</option>
                                    <option value="DURANGO">DURANGO</option>
                                    <option value="ESTADO DE MEXICO">ESTADO DE MÉXICO</option>
                                    <option value="GUANAJUATO">GUANAJUATO</option>
                                    <option value="GUERRERO">GUERRERO</option>
                                    <option value="HIDALGO">HIDALGO</option>
                                    <option value="JALISCO">JALISCO</option>
                                    <option value="MICHOACAN">MICHOACÁN</option>
                                    <option value="MORELOS">MORELOS</option>
                                    <option value="NAYARIT">NAYARIT</option>
                                    <option value="NUEVO LEON">NUEVO LEÓN</option>
                                    <option value="OAXACA">OAXACA</option>
                                    <option value="PUEBLA">PUEBLA</option>
                                    <option value="QUERETARO">QUERÉTARO</option>
                                    <option value="QUINTANA ROO">QUINTANA ROO</option>
                                    <option value="SAN LUIS POTOSI">SAN LUIS POTOSÍ</option>
                                    <option value="SINALOA">SINALOA</option>
                                    <option value="SONORA">SONORA</option>
                                    <option value="TABASCO">TABASCO</option>
                                    <option value="TAMAULIPAS">TAMAULIPAS</option>
                                    <option value="TLAXCALA">TLAXCALA</option>
                                    <option value="VERACRUZ">VERACRUZ</option>
                                    <option value="YUCATAN">YUCATÁN</option>
                                    <option value="ZACATECAS">ZACATECAS</option>
                                </select>
                            </div>

                            {/* SECTION: Observaciones */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Observaciones
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.observations}
                                    onChange={(e) => setData("observations", e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                                    placeholder="Comentarios adicionales..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
                            <div className="text-gray-500 text-sm italic">
                                Documentador: <span className="font-bold text-indigo-600">{data.documenter_name}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-8 py-3.5 border border-transparent text-sm font-bold rounded-md shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all transform hover:-translate-y-0.5"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {processing ? "Guardando..." : "GUARDAR ORDEN DE EMBARQUE"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <QrScannerModal
                isOpen={showQrScanner}
                onClose={() => setShowQrScanner(false)}
                onScan={handleQrScan}
                title="Escanear Operador"
            />
        </DashboardLayout>
    );
}
