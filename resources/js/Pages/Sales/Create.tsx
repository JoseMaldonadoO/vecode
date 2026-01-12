import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Check, ChevronsUpDown } from 'lucide-react';
import { FormEventHandler, useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';

interface Client { id: number; business_name: string; }
interface Product { id: number; name: string; code: string; default_packaging: string; }

export default function Create({ auth, clients, products, suggested_folios, default_folio }: { auth: any, clients: Client[], products: Product[], suggested_folios: string[], default_folio: string }) {
    const { data, setData, post, processing, errors } = useForm({
        folio: default_folio || '',
        sale_order: '',
        sale_conditions: '',
        delivery_conditions: '',
        date: new Date().toISOString().split('T')[0],
        client_id: '',
        product_id: '',
        quantity: '',
        packaging: 'Granel',
        destination: ''
    });

    const [isFolioFocused, setIsFolioFocused] = useState(false);

    // Combobox logic
    const [query, setQuery] = useState('');

    const filteredClients =
        query === ''
            ? clients
            : clients.filter((client) =>
                client.business_name
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, '')) ||
                client.id.toString().includes(query)
            );

    const selectedClient = clients.find(c => c.id.toString() === data.client_id) || null;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('sales.store'));
    };

    return (
        <DashboardLayout user={auth.user} header="Nueva Orden de Venta">
            <Head title="Crear Orden" />

            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Link href={route('sales.index')} className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al listado
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <form onSubmit={submit} className="space-y-6">

                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-gray-900 font-medium mb-4 text-sm uppercase tracking-wide">Orden de Venta</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700">Folio <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={data.folio}
                                        onChange={e => setData('folio', e.target.value)}
                                        onFocus={() => setIsFolioFocused(true)}
                                        onBlur={() => setTimeout(() => setIsFolioFocused(false), 200)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Ej. OV-2025-01"
                                        required
                                        autoComplete="off"
                                    />
                                    {/* Suggestions Dropdown */}
                                    {isFolioFocused && suggested_folios.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            <ul>
                                                {suggested_folios.map((suggestion, index) => (
                                                    <li
                                                        key={index}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                                                        onClick={() => {
                                                            setData('folio', suggestion);
                                                            setIsFolioFocused(false);
                                                        }}
                                                    >
                                                        {suggestion} <span className="text-xs text-gray-400 ml-2">(Sugerido)</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
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
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Orden de compra</label>
                                    <input
                                        type="text"
                                        value={data.sale_order}
                                        onChange={e => setData('sale_order', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    />
                                    {errors.sale_order && <div className="text-red-500 text-xs mt-1">{errors.sale_order}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-gray-900 font-medium mb-4 text-sm uppercase tracking-wide">Datos del Cliente</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cliente <span className="text-red-500">*</span></label>
                                    <Combobox value={selectedClient} onChange={(client: Client | null) => setData('client_id', client?.id.toString() || '')}>
                                        <div className="relative mt-1">
                                            <div className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                                                <Combobox.Input
                                                    className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                                    displayValue={(client: Client | null) => client ? `${client.id} - ${client.business_name}` : ''}
                                                    onChange={(event) => setQuery(event.target.value)}
                                                    placeholder="Buscar por ID o Nombre..."
                                                />
                                                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <ChevronsUpDown
                                                        className="h-5 w-5 text-gray-400"
                                                        aria-hidden="true"
                                                    />
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
                                                    {filteredClients.length === 0 && query !== '' ? (
                                                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                                            No se encontraron resultados.
                                                        </div>
                                                    ) : (
                                                        filteredClients.map((client) => (
                                                            <Combobox.Option
                                                                key={client.id}
                                                                className={({ active }) =>
                                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                                                                    }`
                                                                }
                                                                value={client}
                                                            >
                                                                {({ selected, active }) => (
                                                                    <>
                                                                        <span
                                                                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                                                }`}
                                                                        >
                                                                            <span className="font-bold mr-2">{client.id}</span>
                                                                            - {client.business_name}
                                                                        </span>
                                                                        {selected ? (
                                                                            <span
                                                                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-indigo-600'
                                                                                    }`}
                                                                            >
                                                                                <Check className="h-5 w-5" aria-hidden="true" />
                                                                            </span>
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </Combobox.Option>
                                                        ))
                                                    )}
                                                </Combobox.Options>
                                            </Transition>
                                        </div>
                                    </Combobox>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Condiciones de venta</label>
                                        <input
                                            type="text"
                                            value={data.sale_conditions}
                                            onChange={e => setData('sale_conditions', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Condiciones de entrega</label>
                                        <input
                                            type="text"
                                            value={data.delivery_conditions}
                                            onChange={e => setData('delivery_conditions', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-gray-900 font-medium mb-4 text-sm uppercase tracking-wide">Detalle</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Descripción (Producto) <span className="text-red-500">*</span></label>
                                    <select
                                        value={data.product_id}
                                        onChange={e => setData('product_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Seleccione producto...</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>{product.code} - {product.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cantidad (Toneladas) <span className="text-red-500">*</span></label>
                                    <div className="flex rounded-md shadow-sm mt-1">
                                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                                            TON
                                        </span>
                                        <input
                                            type="number"
                                            value={data.quantity}
                                            onChange={e => setData('quantity', e.target.value)}
                                            className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                            <textarea
                                value={data.destination}
                                onChange={e => setData('destination', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                style={{ backgroundColor: '#5CB85C', color: '#ffffff' }}
                                className="inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
