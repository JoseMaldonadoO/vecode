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
    Box,
    ShoppingCart,
    Search,
    AlertTriangle,
} from "lucide-react";
import { FormEventHandler, useState, Fragment, useEffect } from "react";
import { Combobox, Transition } from "@headlessui/react";
import axios from "axios";

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
    transporter_line: string;
    unit_type: string;
    tractor_plate: string;
    trailer_plate: string;
    economic_number: string;
    license: string;
    brand_model: string;
}

export default function Edit({
    auth,
    order,
    clients,
    products,
    sales_orders,
}: {
    auth: any;
    order: any;
    clients: Client[];
    products: Product[];
    sales_orders: any[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        folio: order.folio,
        sales_order_id: order.sales_order_id?.toString() || "",
        date: order.date || order.created_at.split("T")[0],

        client_id: order.client_id?.toString() || "",
        client_name: order.client?.business_name || "",
        // Snapshot or fallback to relation
        consigned_to: order.consigned_to || order.client?.business_name || "",

        // Transporter Data
        operator_id: order.operator_id?.toString() || "",
        transport_company: order.transport_company || "",
        operator_name: order.operator_name || "",
        unit_number: order.unit_number || "",
        unit_type: order.unit_type || "",
        tractor_plate: order.tractor_plate || "",
        trailer_plate: order.trailer_plate || "",
        carta_porte: order.carta_porte || "",
        license_number: order.license_number || "",
        economic_number: order.economic_number || "",

        // Product Data
        product: order.product?.name || order.product || "",
        presentation: order.presentation || "GRANEL",
        sack_type: "", // Helper for editing sacks if needed
        sacks_count: order.sacks_count || "",
        programmed_tons: order.programmed_tons || "",
        balance: order.shortage_balance || "", // Using shortage_balance as 'snapshot balance' for display? OR fetch current? Review controller logic
        destination: order.destination || "",
        state: order.state || "",

        observations: order.observations || "",
        documenter_name: order.documenter_name || auth.user.name,
    });

    const [queryClient, setQueryClient] = useState("");
    const [queryOperator, setQueryOperator] = useState("");
    const [foundOperators, setFoundOperators] = useState<Operator[]>([]);

    // Determine current OV Balance for validation
    // If editing, we need to know the *current* available balance of the OV 
    // PLUS the amount previously allocated to *this* order (to allow keeping it same).
    const currentOV = sales_orders.find(so => so.id.toString() === data.sales_order_id);
    // If switching OV, use that OV's balance. If same OV, add back current order's tons.
    const availableBalance = currentOV
        ? (Number(currentOV.balance) + (order.sales_order_id == data.sales_order_id ? Number(order.programmed_tons || 0) : 0))
        : 0;

    // Initialize balance display
    useEffect(() => {
        if (currentOV && !data.balance) {
            setData('balance', availableBalance.toString());
        }
    }, [currentOV]);


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

    // Search Operators Effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (queryOperator.length > 1) {
                axios
                    .get(route("documentation.operators.search"), {
                        params: { q: queryOperator },
                    })
                    .then((response) => {
                        setFoundOperators(response.data);
                    })
                    .catch((error) => console.error(error));
            } else {
                setFoundOperators([]);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [queryOperator]);

    const handleClientSelect = (client: Client | null) => {
        if (!client) return;
        setData((data) => ({
            ...data,
            client_id: client.id.toString(),
            client_name: client.business_name,
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
            unit_number: operator.brand_model,
            license_number: operator.license,
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
                product: so.product?.name || "",
                balance: so.balance ? so.balance.toString() : "0",
                // programmed_tons: "", // Keep existing if editing? No, maybe reset if changing OV
            }));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route("documentation.orders.update", order.id));
    };

    return (
        <DashboardLayout user={auth.user} header={`Editar Orden: ${order.folio}`}>
            <Head title={`Editar OE - ${order.folio}`} />

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
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-xl">
                                    Editando Orden de Embarque
                                </h3>
                                <p className="text-indigo-200 text-sm">
                                    Modificando datos de folio: {order.folio}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded-full text-white text-xs font-bold uppercase backdrop-blur-sm">
                            Estatus: {order.status}
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
                                        disabled
                                        className="w-full rounded-lg border-gray-300 shadow-sm bg-gray-100 font-bold text-gray-500 py-2.5 pl-10 cursor-not-allowed"
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
                                                {so.folio} {order.sales_order_id === so.id ? '(Actual)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <ShoppingCart className="w-5 h-5 text-indigo-400 absolute left-3 top-2.5" />
                                </div>
                                {errors.sales_order_id && <span className="text-xs text-red-500 mt-1 block">{errors.sales_order_id}</span>}
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
                                ) : ( // Fallback Search
                                    <Combobox onChange={handleClientSelect}>
                                        <div className="relative">
                                            <Combobox.Input
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10"
                                                onChange={(event) => setQueryClient(event.target.value)}
                                                displayValue={() => data.client_name}
                                                placeholder="Buscar Cliente..."
                                            />
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" afterLeave={() => setQueryClient("")}>
                                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                    {filteredClients.map((client) => (
                                                        <Combobox.Option key={client.id} value={client} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-indigo-600 text-white" : "text-gray-900"}`}>
                                                            {client.business_name}
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
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 uppercase"
                                />
                            </div>

                            {/* SECTION: Datos del Transportista */}
                            <div className="md:col-span-2 mt-4">
                                <h4 className="text-gray-800 font-bold text-lg border-b pb-2 mb-4 flex items-center">
                                    <Truck className="w-5 h-5 mr-2 text-indigo-600" />
                                    Datos del Transportista
                                </h4>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Buscar Operador (Nombre o ID)
                                </label>
                                <Combobox onChange={handleOperatorSelect}>
                                    <div className="relative">
                                        <Combobox.Input
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10"
                                            onChange={(event) => setQueryOperator(event.target.value)}
                                            displayValue={() => data.operator_name ? `${data.operator_name} (ID: ${data.operator_id})` : ''}
                                            placeholder="Escribe para buscar..."
                                            autoComplete="off"
                                        />
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Search className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {foundOperators.map((operator) => (
                                                    <Combobox.Option key={operator.id} value={operator} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-indigo-600 text-white" : "text-gray-900"}`}>
                                                        {operator.operator_name} - {operator.transporter_line}
                                                    </Combobox.Option>
                                                ))}
                                            </Combobox.Options>
                                        </Transition>
                                    </div>
                                </Combobox>
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
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                />
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

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Económico
                                </label>
                                <input
                                    type="text"
                                    value={data.economic_number}
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
                                    Saldo Disponible OV (TM)
                                </label>
                                <div className="text-xs text-gray-500 mb-1">Incluye tonelaje de esta orden ({order.programmed_tons} TM)</div>
                                <input
                                    type="text"
                                    value={Number(availableBalance).toFixed(3)}
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

                            {data.presentation === "ENVASADO" && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Tamaño de Saco
                                    </label>
                                    <select
                                        value={data.sack_type}
                                        onChange={(e) => setData("sack_type", e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 font-bold text-blue-800"
                                    >
                                        <option value="">Mantener actual ({data.sacks_count})</option>
                                        <option value="25">25 KG</option>
                                        <option value="50">50 KG</option>
                                        <option value="200">200 KG</option>
                                        <option value="500">500 KG</option>
                                    </select>
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
                                    className={`w-full rounded-lg shadow-sm focus:ring-indigo-500 py-2.5 px-3 font-bold ${Number(data.programmed_tons) > Number(availableBalance)
                                        ? 'border-red-500 focus:border-red-500 bg-red-50'
                                        : 'border-gray-300 focus:border-indigo-500'
                                        }`}
                                    placeholder="0.00"
                                />
                                {Number(data.programmed_tons) > Number(availableBalance) && (
                                    <p className="text-red-600 text-[10px] mt-1 font-bold animate-pulse">
                                        ❌ Excede el saldo disponible ({availableBalance.toFixed(2)} TM)
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
                                <input
                                    type="text"
                                    value={data.state}
                                    onChange={(e) => setData("state", e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 uppercase"
                                    placeholder="Ej. VERACRUZ"
                                />
                            </div>

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
                                Documentador Original: <span className="font-bold text-indigo-600">{data.documenter_name}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-8 py-3.5 border border-transparent text-sm font-bold rounded-md shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all transform hover:-translate-y-0.5"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {processing ? "Guardando..." : "GUARDAR CAMBIOS"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
