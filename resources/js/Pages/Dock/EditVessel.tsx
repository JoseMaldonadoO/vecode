import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Anchor, Save, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import TextInput from '@/Components/TextInput';
import Swal from 'sweetalert2';

export default function EditVessel({ auth, products, vessel, clients }: { auth: any, products: any[], vessel: any, clients: any[] }) {
    const { data, setData, put, processing, errors } = useForm({
        vessel_type: vessel.vessel_type || 'M/V',
        name: vessel.name || '',
        nationality: vessel.nationality || '',
        imo_number: vessel.imo_number || '',
        registration_number: vessel.registration_number || '',
        client_id: vessel.client_id || '',

        eta: vessel.eta ? String(vessel.eta).substring(0, 10) : '',
        docking_date: vessel.docking_date ? String(vessel.docking_date).substring(0, 10) : '',
        docking_time: vessel.docking_time || '',
        dock: vessel.dock || '',

        length: vessel.length || '',
        beam: vessel.beam || '',
        draft: vessel.draft || '',

        operation_type: vessel.operation_type || 'Resguardo',
        destination_port: vessel.destination_port || '',
        origin_port: vessel.origin_port || '',
        loading_port: vessel.loading_port || '',

        product_id: vessel.product_id || '',
        programmed_tonnage: vessel.programmed_tonnage || '',

        importer: vessel.importer || '',
        consignee_agency: vessel.consignee_agency || '',
        customs_agency: vessel.customs_agency || '',

        stay_days: vessel.stay_days !== null ? vessel.stay_days : '',
        etc: vessel.etc ? String(vessel.etc).substring(0, 10) : '',
        departure_date: vessel.departure_date ? String(vessel.departure_date).substring(0, 10) : '',
        observations: vessel.observations || '',
        apt_operation_type: vessel.apt_operation_type || 'scale'
    });

    // Reset product/tons if opertion type changes from Descarga or Carga
    useEffect(() => {
        if (data.operation_type !== 'Descarga' && data.operation_type !== 'Carga') {
            setData(data => ({ ...data, product_id: '', programmed_tonnage: '' }));
        }
    }, [data.operation_type]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('dock.vessel.update', vessel.id), {
            onSuccess: () => {
                Swal.fire({
                    title: '<span style="color: #4f46e5; font-weight: 700;">¡Actualización Exitosa!</span>',
                    html: `<p style="color: #4b5563;">Los datos del buque <b>${data.name}</b> han sido actualizados.</p>`,
                    icon: 'success',
                    iconColor: '#10b981',
                    confirmButtonColor: '#4f46e5',
                    confirmButtonText: 'Entendido',
                    background: '#ffffff',
                    customClass: {
                        popup: 'rounded-2xl border border-gray-100 shadow-2xl',
                        confirmButton: 'rounded-xl px-8 py-3 font-bold transition-all hover:scale-105 active:scale-95'
                    }
                });
            },
            onError: (errors: any) => {
                let errorMsg = 'Por favor, revisa los campos marcados en rojo.';

                if (errors.dock) {
                    errorMsg = errors.dock;
                } else if (errors.error) {
                    errorMsg = errors.error;
                }

                Swal.fire({
                    title: '<span style="color: #ef4444; font-weight: 700;">Error al Actualizar</span>',
                    html: `<p style="color: #4b5563;">${errorMsg}</p>`,
                    icon: 'error',
                    iconColor: '#ef4444',
                    confirmButtonColor: '#4f46e5',
                    confirmButtonText: 'Corregir',
                    background: '#ffffff',
                    customClass: {
                        popup: 'rounded-2xl border border-gray-100 shadow-2xl',
                        confirmButton: 'rounded-xl px-8 py-3 font-bold transition-all hover:scale-105 active:scale-95'
                    }
                });
            }
        });
    };

    return (
        <DashboardLayout user={auth.user} header="Editar Barco">
            <Head title="Editar Barco" />

            <div className="max-w-4xl mx-auto pb-12">
                <div className="mb-6">
                    <Link href={route('dock.index')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al menú
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-indigo-900 px-6 py-4 border-b flex items-center">
                        <Anchor className="w-5 h-5 text-white mr-2" />
                        <h3 className="text-white font-bold">Editar datos del barco</h3>
                    </div>

                    {/* Global Error Banner */}
                    {(errors as any).error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 mx-6 mt-6">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">
                                        {(errors as any).error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="p-8 space-y-6">

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
                                    <TextInput
                                        type="number" step="0.01"
                                        value={data.length}
                                        onChange={e => setData('length', e.target.value)}
                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                        className="w-full mt-1"
                                        placeholder="0.00"
                                    />
                                    {errors.length && <p className="text-red-500 text-xs mt-1">{errors.length}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Manga (m)</label>
                                    <TextInput
                                        type="number" step="0.01"
                                        value={data.beam}
                                        onChange={e => setData('beam', e.target.value)}
                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                        className="w-full mt-1"
                                        placeholder="0.00"
                                    />
                                    {errors.beam && <p className="text-red-500 text-xs mt-1">{errors.beam}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Calado (m)</label>
                                    <TextInput
                                        type="number" step="0.01"
                                        value={data.draft}
                                        onChange={e => setData('draft', e.target.value)}
                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                        className="w-full mt-1"
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                                    <p className="text-xs text-gray-500 mt-1">Opcional</p>
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
                                    <p className="text-xs text-gray-500 mt-1">Opcional</p>
                                    {errors.docking_time && <p className="text-red-500 text-xs mt-1">{errors.docking_time}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Muelle Asignado</label>
                                    <select
                                        value={data.dock}
                                        onChange={e => setData('dock', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="ECO">ECO</option>
                                        <option value="WHISKY">WHISKY</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Requerido para Status</p>
                                </div>
                            </div>

                            {/* New Operation Type Buttons (Scale vs Burreo) */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-3 text-center uppercase tracking-wider text-indigo-900">Operación en APT</label>
                                <div className="flex justify-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setData('apt_operation_type', 'scale')}
                                        className={`flex-1 max-w-[200px] py-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2
                                            ${data.apt_operation_type === 'scale'
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-md ring-2 ring-indigo-500/20'
                                                : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}
                                        `}
                                    >
                                        <div className={`p-2 rounded-lg ${data.apt_operation_type === 'scale' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>
                                            <Save className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-sm">DESCARGA BASCULA</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setData('apt_operation_type', 'burreo')}
                                        className={`flex-1 max-w-[200px] py-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2
                                            ${data.apt_operation_type === 'burreo'
                                                ? 'border-orange-500 bg-orange-50 text-orange-800 shadow-md ring-2 ring-orange-500/20'
                                                : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}
                                        `}
                                    >
                                        <div className={`p-2 rounded-lg ${data.apt_operation_type === 'burreo' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>
                                            <Save className="w-5 h-5 rotate-90" />
                                        </div>
                                        <span className="font-bold text-sm">BURREO</span>
                                    </button>
                                </div>
                                {errors.apt_operation_type && <p className="text-red-500 text-xs mt-2 text-center font-bold">{errors.apt_operation_type}</p>}
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
                                    </select>
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
                                        <TextInput
                                            type="number"
                                            step="0.01"
                                            value={data.programmed_tonnage}
                                            onChange={e => setData('programmed_tonnage', e.target.value)}
                                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                            className="w-full mt-1"
                                        />
                                        {errors.programmed_tonnage && <p className="text-red-500 text-xs mt-1">{errors.programmed_tonnage}</p>}
                                    </div>
                                </div>
                            )}

                            {data.operation_type === 'Carga' && (
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Puerto de Destino</label>
                                        <input type="text" value={data.destination_port} onChange={e => setData('destination_port', e.target.value)} className="w-full rounded-md border-gray-300 py-2" />
                                        {errors.destination_port && <p className="text-red-500 text-xs mt-1">{errors.destination_port}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <TextInput
                                                type="number"
                                                step="0.01"
                                                value={data.programmed_tonnage}
                                                onChange={(e: any) => setData('programmed_tonnage', e.target.value)}
                                                onWheel={(e: any) => e.target.blur()}
                                                className="w-full mt-1"
                                            />
                                            {errors.programmed_tonnage && <p className="text-red-500 text-xs mt-1">{errors.programmed_tonnage}</p>}
                                        </div>
                                    </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Días de Estadía</label>
                                <TextInput
                                    type="number"
                                    value={data.stay_days}
                                    onChange={e => setData('stay_days', e.target.value)}
                                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                    className="w-full mt-1"
                                />
                                {errors.stay_days && <p className="text-red-500 text-xs mt-1">{errors.stay_days}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">ETC (Estimado Finalización)</label>
                                <input
                                    type="date"
                                    value={data.etc}
                                    onChange={e => setData('etc', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                />
                                <p className="text-xs text-gray-500 mt-1">Opcional</p>
                                {errors.etc && <p className="text-red-500 text-xs mt-1">{errors.etc}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Salida</label>
                                <input
                                    type="date"
                                    value={data.departure_date}
                                    onChange={e => setData('departure_date', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 bg-gray-50"
                                />
                                <p className="text-xs text-gray-500 mt-1">Opcional. Llenar al zarpe.</p>
                                {errors.departure_date && <p className="text-red-500 text-xs mt-1">{errors.departure_date}</p>}
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Observaciones</label>
                            <textarea
                                value={data.observations}
                                onChange={e => setData('observations', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                rows={3}
                            ></textarea>
                            {errors.observations && <p className="text-red-500 text-xs mt-1">{errors.observations}</p>}
                        </div>

                        {/* Footer Buttons */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                style={{ backgroundColor: '#2563EB', color: '#ffffff' }}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors uppercase"
                            >
                                {processing ? 'Guardando cambios...' : 'Actualizar Barco'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
