import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import {
    FileText,
    Search,
    ArrowLeft,
    Filter,
    Plus,
    X,
    Save,
    Calendar,
    Hash,
    User,
    Truck,
    MapPin,
    Box,
    Scale,
    ShoppingCart,
    Ship,
    Check,
    ChevronsUpDown,
    CheckCircle,
} from "lucide-react";
import { useState, Fragment, FormEventHandler, useEffect } from "react";
// @ts-ignore
import { pickBy } from "lodash";
import { Combobox, Transition } from "@headlessui/react";

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

interface Order {
    id: string;
    folio: string;
    sale_order?: string;
    sales_order_id?: string;
    sales_order?: {
        folio: string;
    };
    operation_type: "scale" | "burreo";
    client: {
        business_name: string;
    };
    vessel?: {
        name: string;
    };
    status: string;
    created_at: string;
}

interface PageProps {
    orders: {
        data: Order[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    filters: {
        search?: string;
        type?: string;
    };
    clients: Client[];
    products: Product[];
    sales_orders: any[];
    default_folio: string;
    auth: any;
}

export default function Index({
    auth,
    orders,
    filters,
    clients,
    products,
    sales_orders,
    default_folio,
}: PageProps) {
    const { flash } = usePage<any>().props;
    const [search, setSearch] = useState(filters.search || "");
    const [type, setType] = useState(filters.type || "");
    const [showCreate, setShowCreate] = useState(false);
    const [showAlert, setShowAlert] = useState(!!flash?.success);

    useEffect(() => {
        if (flash?.success) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    // Form Logic
    const { data, setData, post, processing, errors, reset } = useForm({
        folio: default_folio || "",
        sales_order_id: "",
        date: new Date().toISOString().split("T")[0],
        client_id: "",
        client_name: "",
        rfc: "",
        address: "",
        consigned_to: "",
        transport_company: "",
        operator_name: "",
        unit_number: "",
        tractor_plate: "",
        trailer_plate: "",
        carta_porte: "",
        license_number: "",
        unit_type: "",
        economic_number: "",
        qr_code: "",
        origin: "PLANTA",
        destination: "",
        product: "",
        presentation: "",
        sacks_count: "",
        programmed_tons: "",
        shortage_balance: "",
        status: "created",
        documenter_name: auth.user.name,
        scale_name: "",
        observations: "",
    });

    const [clientQuery, setClientQuery] = useState("");

    const filteredClients =
        clientQuery === ""
            ? clients
            : clients.filter((client) =>
                client.business_name
                    .toLowerCase()
                    .replace(/\s+/g, "")
                    .includes(
                        clientQuery.toLowerCase().replace(/\s+/g, ""),
                    ),
            );

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

    const handleSalesOrderSelect = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const soId = e.target.value;
        const so = sales_orders.find((s) => s.id === soId);

        if (so) {
            setData((data) => ({
                ...data,
                sales_order_id: soId,
                client_id: so.client_id,
                client_name: so.client?.business_name,
                rfc: so.client?.rfc || "",
                address: so.client?.address || "",
                product: so.product?.name,
                programmed_tons: so.total_quantity.toString(),
            }));
        } else {
            setData("sales_order_id", "");
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("documentation.store"), {
            onSuccess: () => {
                setShowCreate(false);
                reset();
            },
        });
    };

    const handleSearch = (newSearch?: string, newType?: string) => {
        const s = newSearch !== undefined ? newSearch : search;
        const t = newType !== undefined ? newType : type;

        router.get(
            route("documentation.orders.index"),
            pickBy({ search: s, type: t }),
            { preserveState: true },
        );
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setType(value);
        handleSearch(search, value);
    };

    return (
        <DashboardLayout user={auth.user} header="Órdenes de Embarque">
            <Head title="Órdenes de Embarque" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Dynamic Alert */}
                {showAlert && flash?.success && (
                    <div className="fixed top-24 right-8 z-50 animate-fade-in-right">
                        <div className="bg-white border-l-4 border-green-500 rounded-lg shadow-2xl p-4 flex items-center max-w-md">
                            <div className="bg-green-100 p-2 rounded-full mr-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1 mr-4">
                                <h4 className="text-green-900 font-bold text-sm">Operación Exitosa</h4>
                                <p className="text-green-700 text-xs font-medium">{flash.success}</p>
                            </div>
                            <button
                                onClick={() => setShowAlert(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="md:flex md:items-center md:justify-between mb-6">
                    <div className="flex-1 min-w-0">
                        <div className="mb-4">
                            <Link
                                href={route("documentation.index")}
                                className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Volver a Documentación
                            </Link>
                        </div>
                        <h2 className="text-2xl font-bold leading-7 text-indigo-900 sm:text-3xl sm:truncate flex items-center">
                            <FileText className="mr-3 h-8 w-8 text-indigo-600" />
                            Órdenes de Embarque
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        <button
                            onClick={() => setShowCreate(!showCreate)}
                            className={`inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-base font-bold text-white transition-all transform hover:-translate-y-1 ${showCreate ? "bg-red-500 hover:bg-red-600" : "bg-indigo-600 hover:bg-indigo-700"}`}
                        >
                            {showCreate ? (
                                <>
                                    <X className="w-5 h-5 mr-2" />
                                    Cancelar Captura
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5 mr-2" />
                                    Nueva Orden de Embarque
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Create Form Section */}
                <Transition
                    show={showCreate}
                    enter="transition duration-500 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-300 ease-in"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                >
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 mb-10 ring-4 ring-indigo-50">
                        <div className="bg-gradient-to-r from-indigo-800 to-indigo-900 px-8 py-5 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="p-2 bg-indigo-700 rounded-lg mr-3 shadow-inner">
                                    <Ship className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">
                                        Captura de Nueva Orden
                                    </h3>
                                    <p className="text-indigo-200 text-xs">
                                        Complete los datos para generar el folio {data.folio}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="text-indigo-300 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={submit} className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* SECTION: Información General */}
                                <div className="lg:col-span-2 p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-2">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">
                                                Folio O.E.
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={data.folio}
                                                    readOnly
                                                    className="w-full rounded-lg border-gray-200 bg-gray-100 py-2 pl-9 font-bold text-gray-700"
                                                />
                                                <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">
                                                Fecha
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    value={data.date}
                                                    onChange={(e) => setData("date", e.target.value)}
                                                    className="w-full rounded-lg border-gray-200 py-2 pl-9"
                                                />
                                                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">
                                                Vincular a OV *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    value={data.sales_order_id}
                                                    onChange={handleSalesOrderSelect}
                                                    className="w-full rounded-lg border-indigo-200 py-2 pl-9 bg-white font-bold text-indigo-900"
                                                >
                                                    <option value="">-- Seleccionar OV --</option>
                                                    {sales_orders.map((so) => (
                                                        <option key={so.id} value={so.id}>
                                                            {so.folio} - {so.client?.business_name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ShoppingCart className="w-4 h-4 text-indigo-400 absolute left-3 top-2.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION: Cliente */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900 flex items-center border-b pb-2">
                                        <User className="w-4 h-4 mr-2 text-indigo-600" />
                                        Datos del Cliente
                                    </h4>
                                    <div>
                                        <Combobox onChange={handleClientSelect}>
                                            <div className="relative mt-1">
                                                <div className="relative w-full overflow-hidden rounded-lg border border-gray-200">
                                                    <Combobox.Input
                                                        className="w-full border-none py-2.5 pl-9 pr-10 text-sm focus:ring-0"
                                                        onChange={(event) => setClientQuery(event.target.value)}
                                                        displayValue={() => data.client_name}
                                                        placeholder="Buscar Cliente..."
                                                    />
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                                                    </Combobox.Button>
                                                </div>
                                                <Transition as={Fragment} leave="transition duration-100 ease-in" leaveFrom="opacity-100" leaveTo="opacity-0" afterLeave={() => setClientQuery("")}>
                                                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                                                        {filteredClients.map((client) => (
                                                            <Combobox.Option key={client.id} value={client} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-indigo-600 text-white" : "text-gray-900"}`}>
                                                                {({ selected, active }) => (
                                                                    <>
                                                                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{client.business_name}</span>
                                                                        {selected && <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-white" : "text-indigo-600"}`}><Check className="h-4 w-4" /></span>}
                                                                    </>
                                                                )}
                                                            </Combobox.Option>
                                                        ))}
                                                    </Combobox.Options>
                                                </Transition>
                                            </div>
                                        </Combobox>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" value={data.rfc} onChange={(e) => setData("rfc", e.target.value)} placeholder="RFC" className="rounded-lg border-gray-200 text-sm" />
                                        <input type="text" value={data.consigned_to} onChange={(e) => setData("consigned_to", e.target.value)} placeholder="Consignado a" className="rounded-lg border-gray-200 text-sm" />
                                    </div>
                                    <div className="relative">
                                        <input type="text" value={data.address} onChange={(e) => setData("address", e.target.value)} placeholder="Dirección" className="w-full rounded-lg border-gray-200 text-sm pl-9" />
                                        <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                </div>

                                {/* SECTION: Transportista */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900 flex items-center border-b pb-2">
                                        <Truck className="w-4 h-4 mr-2 text-indigo-600" />
                                        Datos del Transportista
                                    </h4>
                                    <input type="text" value={data.transport_company} onChange={(e) => setData("transport_company", e.target.value)} placeholder="Empresa Transportista" className="w-full rounded-lg border-gray-200 text-sm" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" value={data.operator_name} onChange={(e) => setData("operator_name", e.target.value)} placeholder="Operador" className="rounded-lg border-gray-200 text-sm" />
                                        <input type="text" value={data.tractor_plate} onChange={(e) => setData("tractor_plate", e.target.value)} placeholder="Placas" className="rounded-lg border-gray-200 text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" value={data.carta_porte} onChange={(e) => setData("carta_porte", e.target.value)} placeholder="Carta Porte" className="rounded-lg border-gray-200 text-sm" />
                                        <input type="text" value={data.unit_number} onChange={(e) => setData("unit_number", e.target.value)} placeholder="Unidad" className="rounded-lg border-gray-200 text-sm" />
                                    </div>
                                </div>

                                {/* SECTION: Embarque */}
                                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Producto</label>
                                        <select value={data.product} onChange={(e) => setData("product", e.target.value)} className="w-full rounded-lg border-gray-200 text-sm">
                                            <option value="">Seleccione...</option>
                                            {products.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ton. Progr.</label>
                                        <input type="text" value={data.programmed_tons} onChange={(e) => setData("programmed_tons", e.target.value)} className="w-full rounded-lg border-gray-200 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Destino</label>
                                        <input type="text" value={data.destination} onChange={(e) => setData("destination", e.target.value)} className="w-full rounded-lg border-gray-200 text-sm" />
                                    </div>
                                </div>

                                <div className="lg:col-span-2 flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-10 py-3.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl shadow-xl transition-all transform hover:scale-105 disabled:opacity-50"
                                    >
                                        <Save className="w-5 h-5 mr-2" />
                                        {processing ? "GUARDANDO..." : "GUARDAR ORDEN DE EMBARQUE"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </Transition>

                {/* Filters & Actions */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                            placeholder="Buscar por folio, cliente..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleSearch()
                            }
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={type}
                            onChange={handleTypeChange}
                            className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                        >
                            <option value="">Todos los tipos</option>
                            <option value="scale">Descarga Báscula</option>
                            <option value="burreo">Descarga Burreo</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-indigo-800 to-indigo-900">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Folio
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Orden
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Cliente / Barco
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Estatus
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.data.length > 0 ? (
                                    orders.data.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-indigo-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                        {order.folio.slice(-2)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-indigo-700 uppercase">
                                                            {order.folio}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 font-mono">
                                                            ID: {order.id.slice(0, 8)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium italic">
                                                {order.sales_order?.folio ||
                                                    order.sale_order ||
                                                    "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest ${order.operation_type ===
                                                        "burreo"
                                                        ? "bg-amber-100 text-amber-800"
                                                        : "bg-blue-100 text-blue-800"
                                                        }`}
                                                >
                                                    {order.operation_type ===
                                                        "burreo"
                                                        ? "BURREO"
                                                        : "BÁSCULA"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900 uppercase">
                                                    {
                                                        order.client
                                                            ?.business_name
                                                    }
                                                </div>
                                                <div className="text-xs text-indigo-500 font-bold mt-0.5 flex items-center">
                                                    <Ship className="w-3 h-3 mr-1" />
                                                    {order.vessel?.name || 'S/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-widest
                                                            ${order.status === "created" ? "bg-blue-100 text-blue-800 border border-blue-200" : ""}
                                                            ${order.status === "closed" ? "bg-red-100 text-red-800 border border-red-200" : ""}
                                                            ${order.status === "completed" ? "bg-green-100 text-green-800 border border-green-200" : ""}
                                                            ${order.status === "loading" ? "bg-amber-100 text-amber-800 border border-amber-200" : ""}
                                                        `}
                                                >
                                                    {order.status === "created"
                                                        ? "ABIERTA"
                                                        : order.status ===
                                                            "closed"
                                                            ? "CERRADA"
                                                            : order.status ===
                                                                "loading"
                                                                ? "CARGANDO"
                                                                : order.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                                {new Date(
                                                    order.created_at,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {order.sales_order_id ? (
                                                    <Link
                                                        href={route(
                                                            "sales.show",
                                                            {
                                                                sale: order.sales_order_id,
                                                                module: "documentation",
                                                            },
                                                        )}
                                                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:border-indigo-300 transition-all font-bold"
                                                    >
                                                        Ver Detalle
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-gray-100">
                                                        SIN OV
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">
                                                No se encontraron órdenes
                                            </p>
                                            <p className="text-sm">
                                                Intenta ajustar los filtros o
                                                verifica que existan descargas
                                                registradas.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {orders.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 md:flex md:items-center md:justify-between">
                            <div className="text-sm text-gray-500 mb-4 md:mb-0">
                                Mostrando{" "}
                                <span className="font-medium">
                                    {orders.from}
                                </span>{" "}
                                a{" "}
                                <span className="font-medium">{orders.to}</span>{" "}
                                de{" "}
                                <span className="font-medium">
                                    {orders.total}
                                </span>{" "}
                                resultados
                            </div>
                            <div className="flex justify-center space-x-1">
                                {orders.links.map((link, key) =>
                                    link.url ? (
                                        <Link
                                            key={key}
                                            href={link.url}
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${link.active
                                                ? "bg-indigo-600 text-white shadow-sm"
                                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                                }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            key={key}
                                            className="px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
