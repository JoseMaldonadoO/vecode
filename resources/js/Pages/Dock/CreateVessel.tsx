import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Anchor, Save, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function CreateVessel({ auth, products, clients }: { auth: any, products: any[], clients: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        vessel_type: 'M/V',
        name: '',
        nationality: '',
        imo_number: '',
        registration_number: '',
        client_id: '',

        eta: '',
        docking_date: '',
        docking_time: '',

        length: '',
        beam: '',
        draft: '',

        operation_type: 'Resguardo',
        destination_port: '', // For Carga
        origin_port: '',      // For Descarga
        loading_port: '',     // For Descarga

        product_id: '',
        programmed_tonnage: '',

        importer: '',
        consignee_agency: '',
        customs_agency: '',

        stay_days: '',
        etc: '',
        departure_date: '',
        observations: ''
    });

    // Reset fields if operation type changes
    useEffect(() => {
        if (data.operation_type !== 'Descarga') {
            setData(data => ({ ...data, product_id: '', programmed_tonnage: '', origin_port: '', loading_port: '' }));
        }
        if (data.operation_type !== 'Carga') {
            setData(data => ({ ...data, destination_port: '' }));
        }
    }, [data.operation_type]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dock.vessel.store'));
    };

    return (
        <DashboardLayout user={auth.user} header="Registro de Barco">
            <Head title="Nuevo Barco" />

            <div className="max-w-7xl mx-auto pb-12">
                <div className="mb-6">
                    <Link href={route('dock.index')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al menú
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-indigo-900 px-6 py-4 border-b flex items-center justify-between">
                        <div className="flex items-center">
                            <Anchor className="w-5 h-5 text-white mr-2" />
                            <h3 className="text-white font-bold">Registro de Barco</h3>
                        </div>
                    </div>

                    {/* Global Error Banner */}
                    {(errors as any).error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 mx-6 mt-6">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{(errors as any).error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="p-8 space-y-8">

                        {/* Section 1: Vessel Identification */}
                        <div className="border-b pb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">1</span>
                                Identificación del Buque
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Buque</label>
                                    <select
                                        value={data.vessel_type}
                                        onChange={e => setData('vessel_type', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    >
                                        <option value="M/V">M/V</option>
                                        <option value="B/T">B/T</option>
                                    </select>
                                    {errors.vessel_type && <p className="text-red-500 text-xs mt-1">{errors.vessel_type}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Buque</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                        placeholder="Ej. MSC ALEXANDRA"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nacionalidad</label>
                                    <input
                                        type="text"
                                        value={data.nationality}
                                        onChange={e => setData('nationality', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    />
                                    {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">N# IMO</label>
                                    <input
                                        type="text"
                                        value={data.imo_number}
                                        onChange={e => setData('imo_number', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    />
                                    {errors.imo_number && <p className="text-red-500 text-xs mt-1">{errors.imo_number}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Matrícula</label>
                                    <input
                                        type="text"
                                        value={data.registration_number}
                                        onChange={e => setData('registration_number', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    />
                                    {errors.registration_number && <p className="text-red-500 text-xs mt-1">{errors.registration_number}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Technical Specs */}
                        <div className="border-b pb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">2</span>
                                Especificaciones Técnicas
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Eslora (m)</label>
                                    <input
                                        type="number" step="0.01"
                                        value={data.length}
                                        onChange={e => setData('length', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                        placeholder="0.00"
                                    />
                                    {errors.length && <p className="text-red-500 text-xs mt-1">{errors.length}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Manga (m)</label>
                                    <input
                                        type="number" step="0.01"
                                        value={data.beam}
                                        onChange={e => setData('beam', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                        placeholder="0.00"
                                    />
                                    {errors.beam && <p className="text-red-500 text-xs mt-1">{errors.beam}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Calado (m)</label>
                                    <input
                                        type="number" step="0.01"
                                        value={data.draft}
                                        onChange={e => setData('draft', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                        placeholder="0.00"
                                    />
                                    {errors.draft && <p className="text-red-500 text-xs mt-1">{errors.draft}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Arrival Info */}
                        <div className="border-b pb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">3</span>
                                Datos de Arribo
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">ETA (Estimado Arribo)</label>
                                    <input
                                        type="date"
                                        value={data.eta}
                                        onChange={e => setData('eta', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    />
                                    {errors.eta && <p className="text-red-500 text-xs mt-1">{errors.eta}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Atraco (ETB)</label>
                                    <input
                                        type="date"
                                        value={data.docking_date}
                                        onChange={e => setData('docking_date', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    />
                                    {errors.docking_date && <p className="text-red-500 text-xs mt-1">{errors.docking_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Hora Atraco</label>
                                    <input
                                        type="time"
                                        value={data.docking_time}
                                        onChange={e => setData('docking_time', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    />
                                    {errors.docking_time && <p className="text-red-500 text-xs mt-1">{errors.docking_time}</p>}
                                </div>
                            </div>
                        </div>


                        {/* Section 4: Operation & Clients */}
                        <div className="border-b pb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">4</span>
                                Detalles de la Operación
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Cliente</label>
                                    <select
                                        value={data.client_id}
                                        onChange={e => setData('client_id', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    >
                                        <option value="">Seleccione Cliente...</option>
                                        {(clients || []).map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.business_name}</option>
                                        ))}
                                        {/* Use local variable 'clients' if auth doesn't have it, but controller passed 'clients'. Need to check props type */}
                                    </select>
                                    {/* Actually props are {auth, products, clients} based on controller. I need to update TS definition */}
                                    {errors.client_id && <p className="text-red-500 text-xs mt-1">{errors.client_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Operación</label>
                                    <select
                                        value={data.operation_type}
                                        onChange={e => setData('operation_type', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    >
                                        <option value="Resguardo">Resguardo</option>
                                        <option value="Descarga">Descarga</option>
                                        <option value="Carga">Carga</option>
                                    </select>
                                    {errors.operation_type && <p className="text-red-500 text-xs mt-1">{errors.operation_type}</p>}
                                </div>
                            </div>

                            {/* Conditional Fields based on Operation Type */}
                            {data.operation_type === 'Descarga' && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Puerto de Origen</label>
                                        <input type="text" value={data.origin_port} onChange={e => setData('origin_port', e.target.value)} className="w-full rounded-md border-gray-300 py-2" />
                                        {errors.origin_port && <p className="text-red-500 text-xs mt-1">{errors.origin_port}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Puerto de Carga</label>
                                        <input type="text" value={data.loading_port} onChange={e => setData('loading_port', e.target.value)} className="w-full rounded-md border-gray-300 py-2" />
                                        {errors.loading_port && <p className="text-red-500 text-xs mt-1">{errors.loading_port}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Producto</label>
                                        <select value={data.product_id} onChange={e => setData('product_id', e.target.value)} className="w-full rounded-md border-gray-300 py-2">
                                            <option value="">Seleccione...</option>
                                            {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Toneladas Programadas</label>
                                        <input type="number" step="0.01" value={data.programmed_tonnage} onChange={e => setData('programmed_tonnage', e.target.value)} className="w-full rounded-md border-gray-300 py-2" />
                                        {errors.programmed_tonnage && <p className="text-red-500 text-xs mt-1">{errors.programmed_tonnage}</p>}
                                    </div>
                                </div>
                            )}

                            {data.operation_type === 'Carga' && (
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Puerto de Destino</label>
                                    <input type="text" value={data.destination_port} onChange={e => setData('destination_port', e.target.value)} className="w-full rounded-md border-gray-300 py-2" />
                                    {errors.destination_port && <p className="text-red-500 text-xs mt-1">{errors.destination_port}</p>}
                                </div>
                            )}
                        </div>

                        {/* Section 5: Agencies & Logistics */}
                        <div className="border-b pb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">5</span>
                                Agencias y Logística
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Importador</label>
                                    <input type="text" value={data.importer} onChange={e => setData('importer', e.target.value)} className="w-full rounded-md border-gray-300 py-2.5" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Agencia Consignataria</label>
                                    <input type="text" value={data.consignee_agency} onChange={e => setData('consignee_agency', e.target.value)} className="w-full rounded-md border-gray-300 py-2.5" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Agencia Aduanal</label>
                                    <input type="text" value={data.customs_agency} onChange={e => setData('customs_agency', e.target.value)} className="w-full rounded-md border-gray-300 py-2.5" />
                                </div>
                            </div>
                        </div>


                        {/* Section 6: Planning & Departure */}
                        <div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">6</span>
                                Planificación y Salida
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Días de Estadía</label>
                                    <input
                                        type="number"
                                        value={data.stay_days}
                                        onChange={e => setData('stay_days', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    />
                                    {errors.stay_days && <p className="text-red-500 text-xs mt-1">{errors.stay_days}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">ETC (Estimado Final)</label>
                                    <input
                                        type="date"
                                        value={data.etc}
                                        onChange={e => setData('etc', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Opcional</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Salida</label>
                                    <input
                                        type="date"
                                        value={data.departure_date}
                                        onChange={e => setData('departure_date', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 bg-gray-50"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Llenar al zarpe</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Observaciones</label>
                                <textarea
                                    value={data.observations}
                                    onChange={e => setData('observations', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    rows={3}
                                ></textarea>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                style={{ backgroundColor: '#4ade80', color: '#166534' }}
                                className="w-full md:w-auto px-10 py-3 border border-transparent rounded-md shadow-sm text-base font-bold uppercase tracking-wider hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
                            >
                                {processing ? 'Guardando Registro...' : 'Guardar Barco'}
                            </button>
                        </div>
                    </form>

                    {/* Footer Legend */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-xs text-gray-500 flex justify-center space-x-6">
                        <span><strong>ETA:</strong> TIEMPO ESTIMADO DE ARRIBO</span>
                        <span><strong>ETB:</strong> TIEMPO ESTIMADO DE ATRAQUE</span>
                        <span><strong>ETC:</strong> TIEMPO ESTIMADO DE FINALIZACION</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
