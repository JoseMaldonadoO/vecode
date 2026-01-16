import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { UserPlus, ArrowLeft, Save, Truck, FileText, Shield, Calendar } from 'lucide-react';
import { useEffect } from 'react';

export default function RegisterOperator({ auth, vessels }: { auth: any, vessels: any[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        vessel_id: '',
        operator_name: '',
        transporter_line: '',
        unit_type: 'Volteo',
        brand_model: '',
        trailer_plate: '',
        economic_number: '',
        tractor_plate: ''
    });

    useEffect(() => {
        if (data.unit_type === 'Volteo') {
            setData('trailer_plate', '');
        }
    }, [data.unit_type]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('documentation.operators.store'), {
            onSuccess: () => reset()
        });
    };

    return (
        <DashboardLayout user={auth.user} header="Registro de Operadores">
            <Head title="Alta Operador" />

            <div className="max-w-4xl mx-auto py-8">
                <div className="mb-6">
                    <Link href={route('traffic.index')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al menú
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-8 py-5 flex items-center justify-between">
                        <div className="flex items-center">
                            <UserPlus className="w-6 h-6 text-white mr-3" />
                            <h3 className="text-white font-bold text-lg">Ingresa los datos del Operador</h3>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-8">
                        {/* Barco Selection (Required by Backend) */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Seleccionar Barco Activo <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    value={data.vessel_id}
                                    onChange={e => setData('vessel_id', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 pl-4 pr-10 appearance-none bg-gray-50 text-gray-700"
                                    required
                                >
                                    <option value="">-- Seleccione un barco --</option>
                                    {vessels.map((v: any) => (
                                        <option key={v.id} value={v.id}>{v.name} ({v.origin})</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <Truck className="h-5 w-5 mr-2" />
                                </div>
                            </div>
                            {errors.vessel_id && <p className="text-red-500 text-sm mt-1">{errors.vessel_id}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre:</label>
                                    <input
                                        type="text"
                                        value={data.operator_name}
                                        onChange={e => setData('operator_name', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                        required
                                    />
                                    {errors.operator_name && <p className="text-red-500 text-xs mt-1">{errors.operator_name}</p>}
                                </div>

                                {/* Linea Transportista */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Línea transportista:</label>
                                    <input
                                        type="text"
                                        value={data.transporter_line}
                                        onChange={e => setData('transporter_line', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                        required
                                    />
                                    {errors.transporter_line && <p className="text-red-500 text-xs mt-1">{errors.transporter_line}</p>}
                                </div>

                                {/* Tipo de Unidad */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de unidad:</label>
                                    <select
                                        value={data.unit_type}
                                        onChange={e => setData('unit_type', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    >
                                        <option value="Volteo">Volteo</option>
                                        <option value="Tolva">Tolva</option>
                                        <option value="Caja Seca">Caja Seca</option>
                                        <option value="Plataforma">Plataforma</option>
                                        <option value="Contenedor">Contenedor</option>
                                    </select>
                                    {errors.unit_type && <p className="text-red-500 text-xs mt-1">{errors.unit_type}</p>}
                                </div>

                                {/* Marca / Modelo (New) */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Marca / Modelo:</label>
                                    <input
                                        type="text"
                                        value={data.brand_model}
                                        onChange={e => setData('brand_model', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    />
                                </div>

                                {/* Remolque */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Remolque:</label>
                                    <input
                                        type="text"
                                        value={data.trailer_plate}
                                        onChange={e => setData('trailer_plate', e.target.value)}
                                        disabled={data.unit_type === 'Volteo'}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 disabled:bg-gray-100 disabled:text-gray-400"
                                        placeholder={data.unit_type === 'Volteo' ? 'No aplica' : ''}
                                    />
                                    {errors.trailer_plate && <p className="text-red-500 text-xs mt-1">{errors.trailer_plate}</p>}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Placa Tracto */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Placa Tracto:</label>
                                    <input
                                        type="text"
                                        value={data.tractor_plate}
                                        onChange={e => setData('tractor_plate', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                        required
                                    />
                                    {errors.tractor_plate && <p className="text-red-500 text-xs mt-1">{errors.tractor_plate}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-bold rounded-lg shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors uppercase tracking-wide transform hover:scale-105 duration-200"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {processing ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
