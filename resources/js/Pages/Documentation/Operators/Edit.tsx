import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { UserPlus, ArrowLeft, Save, Truck, FileText, User, Hash, CreditCard, Box } from 'lucide-react';
import { useEffect } from 'react';

export default function Edit({ auth, operator, vessels }: { auth: any, operator: any, vessels: any[] }) {
    const { data, setData, put, processing, errors } = useForm({
        vessel_id: operator.vessel_id,
        operator_name: operator.operator_name,
        transporter_line: operator.transporter_line,
        unit_type: operator.unit_type,
        brand_model: operator.brand_model || '',
        trailer_plate: operator.trailer_plate || '',
        economic_number: operator.economic_number,
        tractor_plate: operator.tractor_plate
    });

    useEffect(() => {
        if (data.unit_type === 'Volteo') {
            setData('trailer_plate', '');
        }
    }, [data.unit_type]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('documentation.operators.update', operator.id));
    };

    return (
        <DashboardLayout user={auth.user} header="Edición de Operador">
            <Head title="Editar Operador" />

            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href={route('documentation.operators.index')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a la Lista
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-8 py-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-600 rounded-lg mr-3 shadow-inner">
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-xl">Editar Operador #{operator.id}</h3>
                                <p className="text-blue-200 text-sm">Actualice los datos del conductor y unidad</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-8">

                        {/* Section: Vinculación */}
                        <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                            <h4 className="text-blue-800 font-bold mb-4 flex items-center">
                                <Truck className="w-5 h-5 mr-2" />
                                Vinculación de Barco
                            </h4>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Seleccionar Barco Activo <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={data.vessel_id}
                                        onChange={e => setData('vessel_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 pl-4 pr-10 appearance-none bg-white text-gray-700 font-medium"
                                        required
                                    >
                                        <option value="">-- Seleccione un barco --</option>
                                        {vessels.map((v: any) => (
                                            <option key={v.id} value={v.id}>
                                                {v.name} {v.origin ? `(${v.origin})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                                {errors.vessel_id && <p className="text-red-500 text-sm mt-1">{errors.vessel_id}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Left Column: Personal Data */}
                            <div className="space-y-6">
                                <h4 className="text-gray-800 font-bold text-lg border-b pb-2 mb-4">Datos del Transportista</h4>

                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Operador <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.operator_name}
                                            onChange={e => setData('operator_name', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10"
                                            placeholder="Nombre Completo"
                                            required
                                        />
                                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                    {errors.operator_name && <p className="text-red-500 text-xs mt-1">{errors.operator_name}</p>}
                                </div>

                                {/* Linea Transportista */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Línea Transportista <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.transporter_line}
                                            onChange={e => setData('transporter_line', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10"
                                            placeholder="Empresa Transportista"
                                            required
                                        />
                                        <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                    {errors.transporter_line && <p className="text-red-500 text-xs mt-1">{errors.transporter_line}</p>}
                                </div>

                                {/* Economico */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Económico <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.economic_number}
                                            onChange={e => setData('economic_number', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10"
                                            placeholder="Ej. 05, ECO-2024"
                                            required
                                        />
                                        <Hash className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                    {errors.economic_number && <p className="text-red-500 text-xs mt-1">{errors.economic_number}</p>}
                                </div>
                            </div>

                            {/* Right Column: Vehicle Data */}
                            <div className="space-y-6">
                                <h4 className="text-gray-800 font-bold text-lg border-b pb-2 mb-4">Datos de la Unidad</h4>

                                {/* Tipo de Unidad */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Unidad</label>
                                    <div className="relative">
                                        <select
                                            value={data.unit_type}
                                            onChange={e => setData('unit_type', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 appearance-none bg-white"
                                        >
                                            <option value="Volteo">Volteo</option>
                                            <option value="Tolva">Tolva</option>
                                            <option value="Caja Seca">Caja Seca</option>
                                            <option value="Plataforma">Plataforma</option>
                                            <option value="Contenedor">Contenedor</option>
                                        </select>
                                        <Box className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                    {errors.unit_type && <p className="text-red-500 text-xs mt-1">{errors.unit_type}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Marca / Modelo */}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Marca / Modelo</label>
                                        <input
                                            type="text"
                                            value={data.brand_model}
                                            onChange={e => setData('brand_model', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5"
                                            placeholder="Ej. Kenworth 2020"
                                        />
                                    </div>

                                    {/* Placa Tracto */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Placa Tracto <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={data.tractor_plate}
                                                onChange={e => setData('tractor_plate', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 uppercase font-mono"
                                                placeholder="ABC-123"
                                                required
                                            />
                                            <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                        </div>
                                        {errors.tractor_plate && <p className="text-red-500 text-xs mt-1">{errors.tractor_plate}</p>}
                                    </div>

                                    {/* Remolque */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Placa Remolque</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={data.trailer_plate}
                                                onChange={e => setData('trailer_plate', e.target.value)}
                                                disabled={data.unit_type === 'Volteo'}
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 uppercase font-mono disabled:bg-gray-100 disabled:text-gray-400"
                                                placeholder={data.unit_type === 'Volteo' ? 'N/A' : 'XYZ-999'}
                                            />
                                            <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                        </div>
                                        {errors.trailer_plate && <p className="text-red-500 text-xs mt-1">{errors.trailer_plate}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-8 py-3.5 border border-transparent text-lg font-bold rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all transform hover:-translate-y-0.5"
                            >
                                <Save className="w-6 h-6 mr-2" />
                                {processing ? 'Guardando...' : 'GUARDAR CAMBIOS'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
