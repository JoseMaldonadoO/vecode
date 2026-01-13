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

    const handleClientSelect = (client: Client) => {
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

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex justify-between items-center">
                    <Link href={route('documentation.index')} className="text-gray-500 hover:text-gray-700 flex items-center text-sm font-medium">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al menú
                    </Link>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center">
                        <Search className="w-4 h-4 mr-2" />
                        Buscar Orden Existente
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
                    <form onSubmit={submit} className="space-y-8">

                        {/* HEADER SECTION: Orden de Embarque */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h3 className="text-green-800 font-bold mb-3 text-sm uppercase border-b border-green-200 pb-2">Orden de Embarque</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600">Folio O.E.:</label>
                                        <input type="text" value={data.folio} onChange={e => setData('folio', e.target.value)} className="w-full mt-1 p-1 border rounded text-sm font-bold text-gray-800 bg-white" readOnly />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600">Fecha:</label>
                                        <input type="date" value={data.date} onChange={e => setData('date', e.target.value)} className="w-full mt-1 p-1 border rounded text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600">Orden de venta:</label>
                                        <input type="text" value={data.sale_order} onChange={e => setData('sale_order', e.target.value)} className="w-full mt-1 p-1 border rounded text-sm" placeholder="Selecciona..." />
                                        {errors.sale_order && <span className="text-xs text-red-500">{errors.sale_order}</span>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600">Pedido:</label>
                                        <input type="text" value={data.request_id} onChange={e => setData('request_id', e.target.value)} className="w-full mt-1 p-1 border rounded text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION: Datos del Cliente */}
                            <div className="md:col-span-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-green-800 font-bold mb-3 text-sm uppercase border-b border-gray-200 pb-2 bg-green-200 px-2 -mx-4 -mt-4 rounded-t-lg py-2">Datos del Cliente</h3>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-12 gap-2 items-center">
                                        <label className="col-span-2 text-xs font-bold text-gray-600">Nombre:</label>
                                        <div className="col-span-10">
                                            <Combobox onChange={handleClientSelect}>
                                                <div className="relative">
                                                    <Combobox.Input
                                                        className="w-full rounded-md border border-gray-300 bg-white py-1 pl-3 pr-10 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                                        onChange={(event) => setQuery(event.target.value)}
                                                        displayValue={() => data.client_name}
                                                        placeholder="Buscar Cliente..."
                                                    />
                                                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                        {filteredClients.map((client) => (
                                                            <Combobox.Option
                                                                key={client.id}
                                                                className={({ active }) =>
                                                                    `relative cursor-default select-none py-2 pl-4 pr-4 ${active ? 'bg-green-600 text-white' : 'text-gray-900'}`
                                                                }
                                                                value={client}
                                                            >
                                                                <span className="block truncate font-medium">{client.business_name}</span>
                                                            </Combobox.Option>
                                                        ))}
                                                    </Combobox.Options>
                                                </div>
                                            </Combobox>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-12 gap-2 items-center">
                                        <label className="col-span-2 text-xs font-bold text-gray-600">RFC:</label>
                                        <input type="text" value={data.rfc} onChange={e => setData('rfc', e.target.value)} className="col-span-10 p-1 border rounded text-sm" />
                                    </div>
                                    <div className="grid grid-cols-12 gap-2 items-center">
                                        <label className="col-span-2 text-xs font-bold text-gray-600">Dirección:</label>
                                        <input type="text" value={data.address} onChange={e => setData('address', e.target.value)} className="col-span-10 p-1 border rounded text-sm" />
                                    </div>
                                    <div className="grid grid-cols-12 gap-2 items-center">
                                        <label className="col-span-2 text-xs font-bold text-gray-600">Consignado:</label>
                                        <input type="text" value={data.consigned_to} onChange={e => setData('consigned_to', e.target.value)} className="col-span-4 p-1 border rounded text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION: Datos del Transportista */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="text-green-800 font-bold mb-3 text-sm uppercase bg-green-200 px-4 py-2 -mx-4 -mt-4 rounded-t-lg border-b border-green-300">Datos del Transportista</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <label className="col-span-3 text-xs font-bold text-gray-600">Transporte:</label>
                                    <input type="text" value={data.transport_company} onChange={e => setData('transport_company', e.target.value)} className="col-span-9 p-1 border rounded text-sm" />
                                </div>
                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <label className="col-span-3 text-xs font-bold text-gray-600">Carta porte:</label>
                                    <input type="text" value={data.carta_porte} onChange={e => setData('carta_porte', e.target.value)} className="col-span-9 p-1 border rounded text-sm" />
                                </div>

                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <label className="col-span-3 text-xs font-bold text-gray-600">Operador:</label>
                                    <input type="text" value={data.operator_name} onChange={e => setData('operator_name', e.target.value)} className="col-span-9 p-1 border rounded text-sm" />
                                </div>
                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <label className="col-span-3 text-xs font-bold text-gray-600">Licencia:</label>
                                    <input type="text" value={data.license_number} onChange={e => setData('license_number', e.target.value)} className="col-span-9 p-1 border rounded text-sm" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 col-span-2 gap-8">
                                    <div className="grid grid-cols-12 gap-2 items-center">
                                        <label className="col-span-4 text-xs font-bold text-gray-600">Unidad:</label>
                                        <input type="text" value={data.unit_number} onChange={e => setData('unit_number', e.target.value)} className="col-span-8 p-1 border rounded text-sm" />
                                    </div>
                                    <div className="grid grid-cols-12 gap-2 items-center">
                                        <label className="col-span-4 text-xs font-bold text-gray-600">Tipo de unidad:</label>
                                        <input type="text" value={data.unit_type} onChange={e => setData('unit_type', e.target.value)} className="col-span-8 p-1 border rounded text-sm" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 col-span-2 gap-8">
                                    <div className="grid grid-cols-12 gap-2 items-center">
                                        <label className="col-span-4 text-xs font-bold text-gray-600">Tractor:</label>
                                        <input type="text" value={data.tractor_plate} onChange={e => setData('tractor_plate', e.target.value)} className="col-span-8 p-1 border rounded text-sm" />
                                    </div>
                                    <div className="grid grid-cols-12 gap-2 items-center">
                                        <label className="col-span-4 text-xs font-bold text-gray-600">Remolque:</label>
                                        <input type="text" value={data.trailer_plate} onChange={e => setData('trailer_plate', e.target.value)} className="col-span-8 p-1 border rounded text-sm" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 col-span-2 gap-8">
                                    <div className="col-span-1"></div>
                                    <div className="grid grid-cols-12 gap-2 items-center">
                                        <label className="col-span-4 text-xs font-bold text-gray-600">Economico:</label>
                                        <input type="text" value={data.economic_number} onChange={e => setData('economic_number', e.target.value)} className="col-span-8 p-1 border rounded text-sm" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 col-span-2 gap-8">
                                    <div className="col-span-1"></div>
                                    <div className="grid grid-cols-12 gap-2 items-center">
                                        <label className="col-span-4 text-xs font-bold text-gray-600">Qr Operador:</label>
                                        <input type="text" value={data.qr_code} onChange={e => setData('qr_code', e.target.value)} className="col-span-8 p-1 border rounded text-sm" placeholder="Escanear..." />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION: Del Embarque */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h3 className="text-green-800 font-bold mb-3 text-sm uppercase bg-green-200 px-4 py-2 -mx-4 -mt-4 rounded-t-lg border-b border-green-300">Del Embarque</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">

                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <label className="col-span-3 text-xs font-bold text-gray-600">Origen:</label>
                                    <input type="text" value={data.origin} onChange={e => setData('origin', e.target.value)} className="col-span-5 p-1 border rounded text-sm" />

                                    <label className="col-span-1 text-xs font-bold text-gray-600 text-right">Saco:</label>
                                    <input type="text" value={data.sacks_count} onChange={e => setData('sacks_count', e.target.value)} className="col-span-3 p-1 border rounded text-sm" />
                                </div>

                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <label className="col-span-3 text-xs font-bold text-gray-600">Destino:</label>
                                    <input type="text" value={data.destination} onChange={e => setData('destination', e.target.value)} className="col-span-9 p-1 border rounded text-sm" />
                                </div>

                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <label className="col-span-3 text-xs font-bold text-gray-600">Insumo:</label>
                                    <input type="text" className="col-span-9 p-1 border rounded text-sm bg-gray-100" disabled placeholder="N/A" />
                                </div>

                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <label className="col-span-3 text-xs font-bold text-gray-600">Producto:</label>
                                    <select value={data.product} onChange={e => setData('product', e.target.value)} className="col-span-9 p-1 border rounded text-sm">
                                        <option value="">Seleccione...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.name}>{p.code} - {p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <label className="col-span-3 text-xs font-bold text-gray-600">Saldo:</label>
                                    <input type="text" value={data.shortage_balance} onChange={e => setData('shortage_balance', e.target.value)} className="col-span-4 p-1 border rounded text-sm" />

                                    <div className="col-span-5 pl-2 relative -top-8">
                                        <label className="text-xs font-bold text-gray-600 mr-2">Presentación:</label>
                                        <input type="text" value={data.presentation} onChange={e => setData('presentation', e.target.value)} className="w-24 p-1 border rounded text-sm" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-12 gap-2 items-center -mt-4">
                                    <label className="col-span-3 text-xs font-bold text-gray-600">Estado:</label>
                                    <input type="text" value="Creado" disabled className="col-span-4 p-1 border rounded text-sm bg-gray-100" />

                                    <label className="col-span-3 text-xs font-bold text-gray-600 text-right text-[10px] leading-tight">Ton. programadas:</label>
                                    <input type="text" value={data.programmed_tons} onChange={e => setData('programmed_tons', e.target.value)} className="col-span-2 p-1 border rounded text-sm" />
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600">Documentador:</label>
                                    <input type="text" value={data.documenter_name} readOnly className="w-full mt-1 p-1 border rounded text-sm bg-gray-100" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600">Bascula:</label>
                                    <select value={data.scale_name} onChange={e => setData('scale_name', e.target.value)} className="w-full mt-1 p-1 border rounded text-sm">
                                        <option value="">Seleccione...</option>
                                        <option value="Bascula 1">Bascula 1</option>
                                        <option value="Bascula 2">Bascula 2</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-xs font-bold text-gray-600">Observaciones:</label>
                                <textarea rows={2} value={data.observations} onChange={e => setData('observations', e.target.value)} className="w-full mt-1 p-2 border rounded text-sm"></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded shadow-lg flex items-center transition-all text-sm uppercase"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
