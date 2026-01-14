import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Check, ChevronsUpDown, Search } from 'lucide-react';
import { FormEventHandler, useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';

interface Client { id: number; business_name: string; rfc: string; address: string; }
interface Product { id: number; name: string; code: string; }
interface Vessel { id: number; name: string; }

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

            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex justify-between items-center">
                    <Link href={route('documentation.index')} className="text-gray-500 hover:text-gray-700 flex items-center text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al menú
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <form onSubmit={submit} className="space-y-6">

                        {/* HEADER SECTION: Orden de Embarque */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-gray-900 font-medium mb-4 text-sm uppercase tracking-wide">Información General</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Folio O.E.</label>
                                    <input
                                        type="text"
                                        value={data.folio}
                                        onChange={e => setData('folio', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={e => setData('date', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Orden de Venta</label>
                                    <input
                                        type="text"
                                        value={data.sale_order}
                                        onChange={e => setData('sale_order', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Ej. OV-12345"
                                    />
                                    {errors.sale_order && <span className="text-xs text-red-500">{errors.sale_order}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pedido</label>
                                    <input
                                        type="text"
                                        value={data.request_id}
                                        onChange={e => setData('request_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION: Datos del Cliente */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-gray-900 font-medium mb-4 text-sm uppercase tracking-wide">Datos del Cliente</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Cliente</label>
                                    <Combobox onChange={handleClientSelect}>
                                        <div className="relative mt-1">
                                            <div className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                                                <Combobox.Input
                                                    className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                                    onChange={(event) => setQuery(event.target.value)}
                                                    displayValue={() => data.client_name}
                                                    placeholder="Buscar Cliente..."
                                                />
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
                                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">RFC</label>
                                    <input
                                        type="text"
                                        value={data.rfc}
                                        onChange={e => setData('rfc', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Consignado a</label>
                                    <input
                                        type="text"
                                        value={data.consigned_to}
                                        onChange={e => setData('consigned_to', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION: Datos del Transportista */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-gray-900 font-medium mb-4 text-sm uppercase tracking-wide">Datos del Transportista</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Empresa Transportista</label>
                                    <input
                                        type="text"
                                        value={data.transport_company}
                                        onChange={e => setData('transport_company', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Carta Porte</label>
                                    <input
                                        type="text"
                                        value={data.carta_porte}
                                        onChange={e => setData('carta_porte', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Nombre del Operador</label>
                                    <input
                                        type="text"
                                        value={data.operator_name}
                                        onChange={e => setData('operator_name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Licencia</label>
                                    <input
                                        type="text"
                                        value={data.license_number}
                                        onChange={e => setData('license_number', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Unidad (Número)</label>
                                    <input
                                        type="text"
                                        value={data.unit_number}
                                        onChange={e => setData('unit_number', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tipo de Unidad</label>
                                    <input
                                        type="text"
                                        value={data.unit_type}
                                        onChange={e => setData('unit_type', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Económico</label>
                                    <input
                                        type="text"
                                        value={data.economic_number}
                                        onChange={e => setData('economic_number', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Placas Tractor</label>
                                    <input
                                        type="text"
                                        value={data.tractor_plate}
                                        onChange={e => setData('tractor_plate', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Placas Remolque</label>
                                    <input
                                        type="text"
                                        value={data.trailer_plate}
                                        onChange={e => setData('trailer_plate', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Escaneo QR Operador</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <div className="relative flex flex-grow items-stretch focus-within:z-10">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <input
                                                type="text"
                                                value={data.qr_code}
                                                onChange={e => setData('qr_code', e.target.value)}
                                                className="block w-full rounded-none rounded-l-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                placeholder="Escanear código QR..."
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <span>Validar</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION: Detalle del Embarque */}
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-gray-900 font-medium mb-4 text-sm uppercase tracking-wide">Detalle del Embarque</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Origen</label>
                                    <input
                                        type="text"
                                        value={data.origin}
                                        onChange={e => setData('origin', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Destino</label>
                                    <input
                                        type="text"
                                        value={data.destination}
                                        onChange={e => setData('destination', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Producto</label>
                                    <select
                                        value={data.product}
                                        onChange={e => setData('product', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    >
                                        <option value="">Seleccione...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.name}>{p.code} - {p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sacos</label>
                                    <input
                                        type="text"
                                        value={data.sacks_count}
                                        onChange={e => setData('sacks_count', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Presentación</label>
                                    <input
                                        type="text"
                                        value={data.presentation}
                                        onChange={e => setData('presentation', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ton. Programadas</label>
                                    <input
                                        type="text"
                                        value={data.programmed_tons}
                                        onChange={e => setData('programmed_tons', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Saldo (Shortage)</label>
                                    <input
                                        type="text"
                                        value={data.shortage_balance}
                                        onChange={e => setData('shortage_balance', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION: Pie de página */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Documentador</label>
                                <input
                                    type="text"
                                    value={data.documenter_name}
                                    readOnly
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Báscula</label>
                                <select
                                    value={data.scale_name}
                                    onChange={e => setData('scale_name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="Bascula 1">Báscula 1</option>
                                    <option value="Bascula 2">Báscula 2</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                            <textarea
                                rows={3}
                                value={data.observations}
                                onChange={e => setData('observations', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            ></textarea>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                style={{ backgroundColor: '#5CB85C', color: '#ffffff' }}
                                className="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Guardar Orden
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
