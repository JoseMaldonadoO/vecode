import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import {
    Edit as EditIcon,
    ArrowLeft,
    Save,
    Truck,
    FileText,
    Calendar,
    User,
    Hash,
    CreditCard,
    Box,
    CheckCircle,
} from "lucide-react";

interface Operator {
    id: number;
    name: string;
    license: string;
    transport_line: string;
    economic_number: string;
    real_transport_line: string;
    policy: string;
    unit_type: string;
    validity: string;
    brand_model: string;
    tractor_plate: string;
    trailer_plate: string;
}

export default function Edit({ auth, operator }: { auth: any; operator: Operator }) {
    const { flash } = usePage<any>().props;
    const { data, setData, put, processing, errors } = useForm({
        name: operator.name || "",
        license: operator.license || "",
        transport_line: operator.transport_line || "",
        economic_number: operator.economic_number || "",
        real_transport_line: operator.real_transport_line || "",
        policy: operator.policy || "",
        unit_type: operator.unit_type || "Volteo",
        validity: operator.validity ? new Date(operator.validity).toISOString().split('T')[0] : "",
        brand_model: operator.brand_model || "",
        tractor_plate: operator.tractor_plate || "",
        trailer_plate: operator.trailer_plate || "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("documentation.exit-operators.update", operator.id));
    };

    return (
        <DashboardLayout user={auth.user} header="Editar Operador Salida">
            <Head title="Editar Operador Salida" />

            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href={route("documentation.exit-operators.index")}
                        className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a Lista
                    </Link>
                </div>

                {flash?.success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-md flex items-center transition-all duration-300 animate-fade-in-down">
                        <div className="bg-green-100 p-2 rounded-full mr-4">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <span className="block font-bold text-lg">¡Guardado Exitoso!</span>
                            <span className="block text-sm font-medium text-green-700">{flash.success}</span>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-indigo-800 to-indigo-900 px-8 py-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="p-2 bg-indigo-700 rounded-lg mr-3 shadow-inner">
                                <EditIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-xl uppercase">Editar Operador de Salida</h3>
                                <p className="text-indigo-200 text-sm">Modifique los campos necesarios</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                            {/* Column 1 */}
                            <div className="space-y-6">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre:</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData("name", e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-10 uppercase"
                                            required
                                        />
                                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
                                    </div>
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                {/* Linea transportista */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Linea transportista:</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.transport_line}
                                            onChange={(e) => setData("transport_line", e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-10 uppercase"
                                            required
                                        />
                                        <Truck className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
                                    </div>
                                    {errors.transport_line && <p className="text-red-500 text-xs mt-1">{errors.transport_line}</p>}
                                </div>

                                {/* Linea real */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Linea real:</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.real_transport_line}
                                            onChange={(e) => setData("real_transport_line", e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-10 uppercase"
                                            required
                                        />
                                        <Truck className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
                                    </div>
                                    {errors.real_transport_line && <p className="text-red-500 text-xs mt-1">{errors.real_transport_line}</p>}
                                </div>

                                {/* Tipo de unidad */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de unidad:</label>
                                    <div className="relative">
                                        <select
                                            value={data.unit_type}
                                            onChange={(e) => setData("unit_type", e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-10"
                                            required
                                        >
                                            <option value="Volteo">Volteo</option>
                                            <option value="Tolva">Tolva</option>
                                            <option value="Caja Seca">Caja Seca</option>
                                            <option value="Plataforma">Plataforma</option>
                                            <option value="Contenedor">Contenedor</option>
                                        </select>
                                        <Box className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
                                    </div>
                                    {errors.unit_type && <p className="text-red-500 text-xs mt-1">{errors.unit_type}</p>}
                                </div>

                                {/* Marca / Modelo */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Marca / Modelo:</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.brand_model}
                                            onChange={(e) => setData("brand_model", e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-10 uppercase"
                                            required
                                        />
                                        <Truck className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
                                    </div>
                                    {errors.brand_model && <p className="text-red-500 text-xs mt-1">{errors.brand_model}</p>}
                                </div>

                                {/* Remolque */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Remolque:</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.trailer_plate}
                                            onChange={(e) => setData("trailer_plate", e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-10 uppercase font-mono"
                                            placeholder="Placa Remolque"
                                            disabled={data.unit_type === "Volteo"}
                                        />
                                        <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
                                    </div>
                                    {errors.trailer_plate && <p className="text-red-500 text-xs mt-1">{errors.trailer_plate}</p>}
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-6">
                                {/* Licencia */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Licencia:</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.license}
                                            onChange={(e) => setData("license", e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-10 uppercase font-mono"
                                            required
                                        />
                                        <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
                                    </div>
                                    {errors.license && <p className="text-red-500 text-xs mt-1">{errors.license}</p>}
                                </div>

                                {/* Economico */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Economico:</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.economic_number}
                                            onChange={(e) => setData("economic_number", e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-10 uppercase"
                                            required
                                        />
                                        <Hash className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
                                    </div>
                                    {errors.economic_number && <p className="text-red-500 text-xs mt-1">{errors.economic_number}</p>}
                                </div>

                                {/* Poliza */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Poliza:</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.policy}
                                            onChange={(e) => setData("policy", e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-10 uppercase"
                                            required
                                        />
                                        <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
                                    </div>
                                    {errors.policy && <p className="text-red-500 text-xs mt-1">{errors.policy}</p>}
                                </div>

                                {/* Vigencia */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Vigencia:</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={data.validity}
                                            onChange={(e) => setData("validity", e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-10"
                                            required
                                        />
                                        <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
                                    </div>
                                    {errors.validity && <p className="text-red-500 text-xs mt-1">{errors.validity}</p>}
                                </div>

                                {/* Placa Tracto */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Placa Tracto:</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.tractor_plate}
                                            onChange={(e) => setData("tractor_plate", e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-10 uppercase font-mono"
                                            required
                                            placeholder="ABC-123"
                                        />
                                        <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-2" />
                                    </div>
                                    {errors.tractor_plate && <p className="text-red-500 text-xs mt-1">{errors.tractor_plate}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-8 py-3.5 border border-transparent text-lg font-bold rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all transform hover:-translate-y-0.5"
                            >
                                <Save className="w-6 h-6 mr-2" />
                                {processing ? "Guardando..." : "ACTUALIZAR DATOS"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
