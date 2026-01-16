import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Check, ChevronsUpDown, Search, Ship, Calendar, Hash, FileText, User, Truck, MapPin, Box, Scale } from 'lucide-react';
import { FormEventHandler, useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';

interface Client { id: number; business_name: string; rfc: string; address: string; }
interface Product { id: number; name: string; code: string; }

export default function Create({ auth, clients, products, default_folio }: { auth: any, clients: Client[], products: Product[], default_folio: string }) {
    const { data, setData, post, processing, errors } = useForm({
        folio: default_folio || '',
        sale_order: '', // Orden de Venta
        request_id: '', // Pedido
        date: new Date().toISOString().split('T')[0],

        client_id: '',
        client_name: '',
        rfc: '',
        address: '',
        consigned_to: '',

        transport_company: '',
        operator_name: '',
        unit_number: '',
        tractor_plate: '',
        trailer_plate: '',
        carta_porte: '',
        license_number: '',
        unit_type: '',
        economic_number: '',
        qr_code: '', // Qr Operador input

        origin: 'PLANTA', // Default origin?
        destination: '',
        product: '',
        presentation: '',
        sacks_count: '',
        programmed_tons: '',
        shortage_balance: '',
        status: 'created', // For display?

        documenter_name: auth.user.name,
        scale_name: '',
        observations: ''
    });

    const [query, setQuery] = useState('');

    const filteredClients =
        query === ''
            ? clients
            : clients.filter((client) =>
                client.business_name
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            );

    const handleClientSelect = (client: Client | null) => {
        if (!client) return;
        setData(data => ({
            ...data,
            client_id: client.id.toString(),
            client_name: client.business_name,
            rfc: client.rfc || '',
            address: client.address || ''
        }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('documentation.store'));
    };

    return (
        <DashboardLayout user={auth.user} header="Nueva Orden de Embarque">
            <Head title="Crear Orden de Embarque" />

            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href={route('documentation.index')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al menú
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Dark Blue Header */}
                    <div className="bg-gradient-to-r from-indigo-800 to-indigo-900 px-8 py-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="p-2 bg-indigo-700 rounded-lg mr-3 shadow-inner">
                                <Ship className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-xl">Nueva Orden de Embarque</h3>
                                <p className="text-indigo-200 text-sm">Documentación y salida de mercancía</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-8">

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* SECTION: Información General */}
                            <div className="lg:col-span-2 p-6 bg-indigo-50 rounded-xl border border-indigo-100 mb-2">
                                <h4 className="text-indigo-800 font-bold mb-4 flex items-center text-lg">
                                    <FileText className="w-5 h-5 mr-2" />
                                    Información General
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Folio O.E.</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={data.folio}
                                                onChange={e => setData('folio', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10 bg-white"
                                                readOnly
                                            />
                                            <Hash className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={data.date}
                                                onChange={e => setData('date', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10"
                                            />
                                            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Orden de Venta</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={data.sale_order}
                                                onChange={e => setData('sale_order', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10"
                                                placeholder="Ej. OV-12345"
                                            />
                                            <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                        </div>
                                        {errors.sale_order && <span className="text-xs text-red-500 mt-1 block">{errors.sale_order}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pedido</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={data.request_id}
                                                onChange={e => setData('request_id', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10"
                                            />
                                            <Hash className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: Datos del Cliente */}
                            <div className="lg:col-span-1 space-y-6">
                                <h4 className="text-gray-800 font-bold text-lg border-b pb-2 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-indigo-600" />
                                    Datos del Cliente
                                </h4>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                    <Combobox onChange={handleClientSelect}>
                                        <div className="relative mt-1">
                                            <div className="relative w-full cursor-default overflow-hidden rounded-lg border border-gray-300 bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm">
                                                <Combobox.Input
                                                    className="w-full border-none py-2.5 pl-10 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                                    onChange={(event) => setQuery(event.target.value)}
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
                                            <Transition
                                                as={Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                                afterLeave={() => setQuery('')}
                                            >
                                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                    {filteredClients.map((client) => (
                                                        <Combobox.Option
                                                            key={client.id}
                                                            className={({ active }) =>
                                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900'}`
                                                            }
                                                            value={client}
                                                        >
                                                            {({ selected, active }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                        {client.business_name}
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-indigo-600'}`}>
                                                                            <Check className="h-5 w-5" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
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
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
                                        <input
                                            type="text"
                                            value={data.rfc}
                                            onChange={e => setData('rfc', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Consignado a</label>
                                        <input
                                            type="text"
                                            value={data.consigned_to}
                                            onChange={e => setData('consigned_to', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10"
                                        />
                                        <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: Datos del Transportista */}
                            <div className="lg:col-span-1 space-y-6">
                                <h4 className="text-gray-800 font-bold text-lg border-b pb-2 mb-4 flex items-center">
                                    <Truck className="w-5 h-5 mr-2 text-indigo-600" />
                                    Datos del Transportista
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Empresa Transportista</label>
                                        <input
                                            type="text"
                                            value={data.transport_company}
                                            onChange={e => setData('transport_company', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Carta Porte</label>
                                        <input
                                            type="text"
                                            value={data.carta_porte}
                                            onChange={e => setData('carta_porte', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Operador</label>
                                        <input
                                            type="text"
                                            value={data.operator_name}
                                            onChange={e => setData('operator_name', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                                        <input
                                            type="text"
                                            value={data.unit_number}
                                            onChange={e => setData('unit_number', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Placas Tractor</label>
                                        <input
                                            type="text"
                                            value={data.tractor_plate}
                                            onChange={e => setData('tractor_plate', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Escaneo QR Operador</label>
                                        <div className="flex rounded-md shadow-sm">
                                            <div className="relative flex flex-grow items-stretch focus-within:z-10">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.qr_code}
                                                    onChange={e => setData('qr_code', e.target.value)}
                                                    className="w-full rounded-none rounded-l-lg border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 py-2.5"
                                                    placeholder="Escanear..."
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="relative -ml-px inline-flex items-center space-x-2 rounded-r-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            >
                                                <span>Validar</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* SECTION: Detalle del Embarque */}
                        <div className="mt-8 space-y-6">
                            <h4 className="text-gray-800 font-bold text-lg border-b pb-2 mb-4 flex items-center">
                                <Box className="w-5 h-5 mr-2 text-indigo-600" />
                                Detalle del Embarque
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                                    <input
                                        type="text"
                                        value={data.origin}
                                        onChange={e => setData('origin', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                                    <select
                                        value={data.product}
                                        onChange={e => setData('product', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                    >
                                        <option value="">Seleccione...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.name}>{p.code} - {p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sacos</label>
                                    <input
                                        type="text"
                                        value={data.sacks_count}
                                        onChange={e => setData('sacks_count', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Presentación</label>
                                    <input
                                        type="text"
                                        value={data.presentation}
                                        onChange={e => setData('presentation', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ton. Programadas</label>
                                    <input
                                        type="text"
                                        value={data.programmed_tons}
                                        onChange={e => setData('programmed_tons', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Saldo</label>
                                    <input
                                        type="text"
                                        value={data.shortage_balance}
                                        onChange={e => setData('shortage_balance', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                                    <input
                                        type="text"
                                        value={data.destination}
                                        onChange={e => setData('destination', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION: Pie de página */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Documentador</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.documenter_name}
                                        readOnly
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10 bg-white"
                                    />
                                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Báscula</label>
                                <div className="relative">
                                    <select
                                        value={data.scale_name}
                                        onChange={e => setData('scale_name', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10"
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="Bascula 1">Báscula 1</option>
                                        <option value="Bascula 2">Báscula 2</option>
                                    </select>
                                    <Scale className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                                <textarea
                                    rows={3}
                                    value={data.observations}
                                    onChange={e => setData('observations', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                                    placeholder="Comentarios adicionales..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-8 py-3.5 border border-transparent text-lg font-bold rounded-xl shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all transform hover:-translate-y-0.5"
                            >
                                <Save className="w-6 h-6 mr-2" />
                                {processing ? 'Guardando...' : 'GUARDAR ORDEN'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
