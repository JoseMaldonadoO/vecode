import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Check, ChevronsUpDown, FileText, User, Box, Calendar, Hash, Truck, ShoppingCart } from 'lucide-react';
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

            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link href={route('sales.index')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al listado
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-indigo-800 to-indigo-900 px-8 py-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="p-2 bg-indigo-700 rounded-lg mr-3 shadow-inner">
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-xl">Nueva Orden de Venta</h3>
                                <p className="text-indigo-200 text-sm">Registre los detalles de la venta y cliente</p>
                            </div>
                        </div>
                    </div>

                    {(errors as any).error && (
                        <div className="mx-8 mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 font-medium">
                                        {(errors as any).error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="p-8">

                        {/* Section: Orden de Venta */}
                        <div className="mb-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100">
                            <h4 className="text-indigo-800 font-bold mb-4 flex items-center text-lg">
                                <FileText className="w-5 h-5 mr-2" />
                                Datos Generales
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Folio <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.folio}
                                            onChange={e => setData('folio', e.target.value)}
                                            onFocus={() => setIsFolioFocused(true)}
                                            onBlur={() => setTimeout(() => setIsFolioFocused(false), 200)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10"
                                            placeholder="Ej. OV-2025-01"
                                            required
                                            autoComplete="off"
                                        />
                                        <Hash className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                    {/* Suggestions Dropdown */}
                                    {isFolioFocused && suggested_folios.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
                                                        {suggestion} <span className="text-xs text-indigo-500 ml-2 font-medium">(Sugerido)</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
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

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Orden de Compra / Referencia</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.sale_order}
                                            onChange={e => setData('sale_order', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10"
                                            placeholder="Referencia del cliente"
                                            required
                                        />
                                        <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                    {errors.sale_order && <div className="text-red-500 text-xs mt-1">{errors.sale_order}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Section: Datos del Cliente */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-6">
                                <h4 className="text-gray-800 font-bold text-lg border-b pb-2 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-indigo-600" />
                                    Información del Cliente
                                </h4>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente <span className="text-red-500">*</span></label>
                                    <Combobox value={selectedClient} onChange={(client: Client | null) => setData('client_id', client?.id.toString() || '')}>
                                        <div className="relative mt-1">
                                            <div className="relative w-full cursor-default overflow-hidden rounded-lg border border-gray-300 bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm">
                                                <Combobox.Input
                                                    className="w-full border-none py-2.5 pl-10 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                                                    displayValue={(client: Client | null) => client ? `${client.id} - ${client.business_name}` : ''}
                                                    onChange={(event) => setQuery(event.target.value)}
                                                    placeholder="Buscar por ID o Nombre..."
                                                />
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <User className="w-5 h-5 text-gray-400" />
                                                </div>
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
                                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Condiciones de Venta</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.sale_conditions}
                                            onChange={e => setData('sale_conditions', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10"
                                            placeholder="Contado, Crédito 30 días..."
                                        />
                                        <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Condiciones de Entrega</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.delivery_conditions}
                                            onChange={e => setData('delivery_conditions', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10"
                                            placeholder="LAB, FOB..."
                                        />
                                        <Truck className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Detalle */}
                            <div className="space-y-6">
                                <h4 className="text-gray-800 font-bold text-lg border-b pb-2 mb-4 flex items-center">
                                    <Box className="w-5 h-5 mr-2 text-indigo-600" />
                                    Detalle del Producto
                                </h4>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Producto <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            value={data.product_id}
                                            onChange={e => setData('product_id', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-10 appearance-none bg-white"
                                            required
                                        >
                                            <option value="">Seleccione producto...</option>
                                            {products.map(product => (
                                                <option key={product.id} value={product.id}>{product.code} - {product.name}</option>
                                            ))}
                                        </select>
                                        <Box className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad (Toneladas) <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={data.quantity}
                                            onChange={e => setData('quantity', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 pl-14"
                                            placeholder="0.00"
                                            required
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded text-xs">TON</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                                    <textarea
                                        value={data.destination}
                                        onChange={e => setData('destination', e.target.value)}
                                        rows={4}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                                        placeholder="Destino, instrucciones especiales, etc."
                                    />
                                </div>
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
