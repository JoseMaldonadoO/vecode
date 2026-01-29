import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Anchor, Save, ArrowLeft, Ruler, Calendar, Ship, FileText, Briefcase, Navigation } from 'lucide-react';
import { useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2';

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
        dock: '',

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
        observations: '',
        apt_operation_type: 'scale' // Default
    });

    // Reset fields if operation type changes
    useEffect(() => {
        if (data.operation_type !== 'Descarga' && data.operation_type !== 'Carga') {
            setData(data => ({ ...data, product_id: '', programmed_tonnage: '', origin_port: '', loading_port: '' }));
        }
        if (data.operation_type !== 'Carga') {
            setData(data => ({ ...data, destination_port: '' }));
        }
    }, [data.operation_type]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dock.vessel.store'), {
            onSuccess: () => {
                Swal.fire({
                    title: '<span style="color: #4f46e5; font-weight: 700;">¡Registro Exitoso!</span>',
                    html: `<p style="color: #4b5563;">El buque <b>${data.name}</b> ha sido registrado correctamente.</p>`,
                    icon: 'success',
                    iconColor: '#10b981',
                    confirmButtonColor: '#4f46e5',
                    confirmButtonText: 'Entendido',
                    background: '#ffffff',
                    customClass: {
                        popup: 'rounded-2xl border border-gray-100 shadow-2xl',
                        confirmButton: 'rounded-xl px-8 py-3 font-bold transition-all hover:scale-105 active:scale-95'
                    },
                    showClass: {
                        popup: 'animate__animated animate__fadeInUp animate__faster'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutDown animate__faster'
                    }
                });
            }
        });
    };

    return (
        <DashboardLayout user={auth.user} header="Registro de Barco">
            <Head title="Nuevo Barco" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href={route('dock.index')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al menú
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-indigo-800 to-indigo-900 px-8 py-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="p-3 bg-indigo-700 rounded-xl mr-4 shadow-inner">
                                <Anchor className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-2xl">Registro de Barco</h3>
                                <p className="text-indigo-200 text-sm">Ingrese los datos del buque y la operación</p>
                            </div>
                        </div>
                    </div>

                    {/* Global Error Banner */}
                    {(errors as any).error && (
                        <div className="mx-8 mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 font-medium">{(errors as any).error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="p-8 space-y-8">

                        {/* Section 1: Vessel Identification */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="text-indigo-800 font-bold mb-6 flex items-center text-lg bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <Ship className="w-5 h-5 mr-3" />
                                1. Identificación del Buque
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <InputLabel value="Tipo de Buque" />
                                    <select
                                        value={data.vessel_type}
                                        onChange={e => setData('vessel_type', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 mt-1"
                                    >
                                        <option value="M/V">M/V</option>
                                        <option value="B/T">B/T</option>
                                    </select>
                                    {errors.vessel_type && <p className="text-red-500 text-xs mt-1">{errors.vessel_type}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <InputLabel value="Nombre del Buque" />
                                    <TextInput
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full mt-1"
                                        placeholder="Ej. MSC ALEXANDRA"
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <InputLabel value="Nacionalidad" />
                                    <TextInput
                                        value={data.nationality}
                                        onChange={e => setData('nationality', e.target.value)}
                                        className="w-full mt-1"
                                    />
                                    {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
                                </div>
                                <div>
                                    <InputLabel value="N# IMO" />
                                    <TextInput
                                        value={data.imo_number}
                                        onChange={e => setData('imo_number', e.target.value)}
                                        className="w-full mt-1"
                                    />
                                    {errors.imo_number && <p className="text-red-500 text-xs mt-1">{errors.imo_number}</p>}
                                </div>
                                <div>
                                    <InputLabel value="Matrícula" />
                                    <TextInput
                                        value={data.registration_number}
                                        onChange={e => setData('registration_number', e.target.value)}
                                        className="w-full mt-1"
                                    />
                                    {errors.registration_number && <p className="text-red-500 text-xs mt-1">{errors.registration_number}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Technical Specs */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="text-indigo-800 font-bold mb-6 flex items-center text-lg bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <Ruler className="w-5 h-5 mr-3" />
                                2. Especificaciones Técnicas
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <InputLabel value="Eslora (m)" />
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
                                    <InputLabel value="Manga (m)" />
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
                                    <InputLabel value="Calado (m)" />
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
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="text-indigo-800 font-bold mb-6 flex items-center text-lg bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <Calendar className="w-5 h-5 mr-3" />
                                3. Datos de Arribo
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <InputLabel value="ETA (Estimado Arribo)" />
                                    <TextInput
                                        type="date"
                                        value={data.eta}
                                        onChange={e => setData('eta', e.target.value)}
                                        className="w-full mt-1"
                                    />
                                    {errors.eta && <p className="text-red-500 text-xs mt-1">{errors.eta}</p>}
                                </div>
                                <div>
                                    <InputLabel value="Fecha Atraco (ETB)" />
                                    <TextInput
                                        type="date"
                                        value={data.docking_date}
                                        onChange={e => setData('docking_date', e.target.value)}
                                        className="w-full mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Opcional (Llenar al atracar)</p>
                                    {errors.docking_date && <p className="text-red-500 text-xs mt-1">{errors.docking_date}</p>}
                                </div>
                                <div>
                                    <InputLabel value="Hora Atraco" />
                                    <TextInput
                                        type="time"
                                        value={data.docking_time}
                                        onChange={e => setData('docking_time', e.target.value)}
                                        className="w-full mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Opcional</p>
                                    {errors.docking_time && <p className="text-red-500 text-xs mt-1">{errors.docking_time}</p>}
                                </div>
                                <div>
                                    <InputLabel value="Muelle Asignado" />
                                    <select
                                        value={data.dock}
                                        onChange={e => setData('dock', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 mt-1"
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
                                <InputLabel value="Operación en APT" className="text-center mb-3 text-indigo-800 font-bold" />
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
                                            <Ship className="w-5 h-5" />
                                        </div>
                                        <span className="font-bold text-sm">BURREO</span>
                                    </button>
                                </div>
                                {errors.apt_operation_type && <p className="text-red-500 text-xs mt-2 text-center font-bold">{errors.apt_operation_type}</p>}
                            </div>
                        </div>


                        {/* Section 4: Operation & Clients */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="text-indigo-800 font-bold mb-6 flex items-center text-lg bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <Briefcase className="w-5 h-5 mr-3" />
                                4. Detalles de la Operación
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <InputLabel value="Cliente" />
                                    <select
                                        value={data.client_id}
                                        onChange={e => setData('client_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 mt-1"
                                    >
                                        <option value="">Seleccione Cliente...</option>
                                        {(clients || []).map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.business_name}</option>
                                        ))}
                                    </select>
                                    {errors.client_id && <p className="text-red-500 text-xs mt-1">{errors.client_id}</p>}
                                </div>
                                <div>
                                    <InputLabel value="Tipo de Operación" />
                                    <select
                                        value={data.operation_type}
                                        onChange={e => setData('operation_type', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 mt-1"
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
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel value="Puerto de Origen" />
                                        <TextInput value={data.origin_port} onChange={e => setData('origin_port', e.target.value)} className="w-full mt-1" />
                                        {errors.origin_port && <p className="text-red-500 text-xs mt-1">{errors.origin_port}</p>}
                                    </div>
                                    <div>
                                        <InputLabel value="Puerto de Carga" />
                                        <TextInput value={data.loading_port} onChange={e => setData('loading_port', e.target.value)} className="w-full mt-1" />
                                        {errors.loading_port && <p className="text-red-500 text-xs mt-1">{errors.loading_port}</p>}
                                    </div>
                                    <div>
                                        <InputLabel value="Producto" />
                                        <select value={data.product_id} onChange={e => setData('product_id', e.target.value)} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 mt-1 bg-white">
                                            <option value="">Seleccione...</option>
                                            {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                                    </div>
                                    <div>
                                        <InputLabel value="Toneladas Programadas" />
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
                                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 mb-6 space-y-6">
                                    <div>
                                        <InputLabel value="Puerto de Destino" />
                                        <TextInput value={data.destination_port} onChange={e => setData('destination_port', e.target.value)} className="w-full mt-1" />
                                        {errors.destination_port && <p className="text-red-500 text-xs mt-1">{errors.destination_port}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Producto" />
                                            <select value={data.product_id} onChange={e => setData('product_id', e.target.value)} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 mt-1 bg-white">
                                                <option value="">Seleccione...</option>
                                                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                                        </div>
                                        <div>
                                            <InputLabel value="Toneladas Programadas" />
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
                                </div>
                            )}
                        </div>

                        {/* Section 5: Agencies & Logistics */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="text-indigo-800 font-bold mb-6 flex items-center text-lg bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <FileText className="w-5 h-5 mr-3" />
                                5. Agencias y Logística
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <InputLabel value="Importador" />
                                    <TextInput value={data.importer} onChange={e => setData('importer', e.target.value)} className="w-full mt-1" />
                                </div>
                                <div>
                                    <InputLabel value="Agencia Consignataria" />
                                    <TextInput value={data.consignee_agency} onChange={e => setData('consignee_agency', e.target.value)} className="w-full mt-1" />
                                </div>
                                <div>
                                    <InputLabel value="Agencia Aduanal" />
                                    <TextInput value={data.customs_agency} onChange={e => setData('customs_agency', e.target.value)} className="w-full mt-1" />
                                </div>
                            </div>
                        </div>


                        {/* Section 6: Planning & Departure */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h4 className="text-indigo-800 font-bold mb-6 flex items-center text-lg bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <Navigation className="w-5 h-5 mr-3" />
                                6. Planificación y Salida
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <InputLabel value="Días de Estadía" />
                                    <TextInput
                                        type="number"
                                        value={data.stay_days}
                                        onChange={e => setData('stay_days', e.target.value)}
                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                        className="w-full mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Días de estadía programados</p>
                                    {errors.stay_days && <p className="text-red-500 text-xs mt-1">{errors.stay_days}</p>}
                                </div>
                                <div>
                                    <InputLabel value="ETC (Estimado Final)" />
                                    <TextInput
                                        type="date"
                                        value={data.etc}
                                        onChange={e => setData('etc', e.target.value)}
                                        className="w-full mt-1"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Opcional</p>
                                </div>
                                <div>
                                    <InputLabel value="Fecha de Salida" />
                                    <TextInput
                                        type="date"
                                        value={data.departure_date}
                                        onChange={e => setData('departure_date', e.target.value)}
                                        className="w-full mt-1 bg-gray-50"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Llenar al zarpe</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <InputLabel value="Observaciones" />
                                <textarea
                                    value={data.observations}
                                    onChange={e => setData('observations', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 mt-1"
                                    rows={3}
                                ></textarea>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <PrimaryButton disabled={processing} className="w-full md:w-auto h-12 px-8 text-base bg-green-600 hover:bg-green-700 shadow-lg transform transition hover:scale-[1.02]">
                                <Save className="w-5 h-5 mr-2" />
                                {processing ? 'Guardando Registro...' : 'Guardar Barco'}
                            </PrimaryButton>
                        </div>
                    </form>

                    {/* Footer Legend */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-xs text-gray-500 flex justify-center space-x-8 font-medium">
                        <span><strong className="text-indigo-700">ETA:</strong> TIEMPO ESTIMADO DE ARRIBO</span>
                        <span><strong className="text-indigo-700">ETB:</strong> TIEMPO ESTIMADO DE ATRAQUE</span>
                        <span><strong className="text-indigo-700">ETC:</strong> TIEMPO ESTIMADO DE FINALIZACION</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
