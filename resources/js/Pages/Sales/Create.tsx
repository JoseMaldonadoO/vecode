import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Check, ChevronsUpDown } from 'lucide-react';
import { FormEventHandler, useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';

interface Client { id: number; business_name: string; rfc?: string; }
interface Product { id: number; name: string; code: string; default_packaging: string; }

export default function Create({ auth, clients, products, suggested_folios, default_folio }: { auth: any, clients: Client[], products: Product[], suggested_folios: string[], default_folio: string }) {
    const { data, setData, post, processing, errors } = useForm({
        folio: default_folio || '',
        sale_order: '',
        sale_conditions: '',
        delivery_conditions: '',
        client_id: '',
        product_id: '',
        quantity: '',
        packaging: 'Granel',
        destination: ''
    });

    const [isFolioFocused, setIsFolioFocused] = useState(false);
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
                <div className="mb-6 flex justify-between items-center">
                    <Link href={route('sales.index')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al listado
                    </Link>
                </div>

                <form onSubmit={submit} className="bg-white shadow-2xl rounded-sm border border-gray-300 overflow-hidden max-w-[21.5cm] mx-auto overflow-x-auto">
                    <div className="p-8 md:p-10 text-black font-sans min-w-[19cm]">
                        {/* Header Section */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex flex-col">
                                <img src="/img/Proagro2.png" alt="Proagro" className="h-16 w-auto object-contain mb-2 self-start" />
                                <div className="text-[11px] leading-tight text-gray-700">
                                    <p className="font-bold text-black text-[13px]">Proagroindustria S.A. de C.V.</p>
                                    <p>Carretera Coatzacoalcos-villahermosa Km 5</p>
                                    <p>interior complejo petroquimico pajaritos</p>
                                    <p>Coatzacoalcos, Veracruz</p>
                                </div>
                            </div>

                            <div className="w-72">
                                <div className="bg-gray-500 text-white text-center py-1 font-bold text-sm uppercase tracking-wide">
                                    Orden de venta
                                </div>
                                <table className="w-full border-collapse border border-black text-xs">
                                    <tbody>
                                        <tr>
                                            <td className="border border-black px-2 py-1 bg-gray-100 font-medium w-1/3">Folio:</td>
                                            <td className="border border-black p-0 relative">
                                                <input
                                                    type="text"
                                                    value={data.folio}
                                                    onChange={e => setData('folio', e.target.value)}
                                                    onFocus={() => setIsFolioFocused(true)}
                                                    onBlur={() => setTimeout(() => setIsFolioFocused(false), 200)}
                                                    className="w-full border-0 focus:ring-0 p-1 text-[13px] font-bold"
                                                    required
                                                />
                                                {isFolioFocused && suggested_folios.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 shadow-lg text-[11px] font-normal">
                                                        {suggested_folios.map((f, i) => (
                                                            <div key={i} className="px-2 py-1 hover:bg-gray-100 cursor-pointer border-b last:border-0" onClick={() => setData('folio', f)}>
                                                                {f}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 bg-gray-100 font-medium">Fecha:</td>
                                            <td className="border border-black px-2 py-1 text-gray-500 italic">
                                                {new Date().toLocaleDateString('es-MX')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 bg-gray-100 font-medium">No. Cliente:</td>
                                            <td className="border border-black p-0 text-[13px] font-bold">
                                                <input
                                                    type="text"
                                                    value={selectedClient?.id || ''}
                                                    readOnly
                                                    className="w-full border-0 focus:ring-0 p-1 bg-gray-50 cursor-not-allowed"
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 bg-gray-100 font-medium">Orden de compra:</td>
                                            <td className="border border-black p-0">
                                                <input
                                                    type="text"
                                                    value={data.sale_order}
                                                    onChange={e => setData('sale_order', e.target.value)}
                                                    className="w-full border-0 focus:ring-0 p-1 text-[13px] font-bold"
                                                    required
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Datos del Cliente Section */}
                        <div className="mb-6">
                            <div className="bg-gray-500 text-white text-center py-1 font-bold text-sm uppercase mb-0.5">
                                Datos del cliente
                            </div>
                            <div className="border border-black">
                                <div className="flex border-b border-black">
                                    <div className="w-1/4 bg-gray-100 px-3 py-2 border-r border-black font-medium text-xs flex items-center">Cliente:</div>
                                    <div className="w-3/4 p-0">
                                        <Combobox value={selectedClient} onChange={(client: Client | null) => setData('client_id', client?.id.toString() || '')}>
                                            <div className="relative">
                                                <div className="relative w-full cursor-default overflow-hidden text-left sm:text-sm">
                                                    <Combobox.Input
                                                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 font-bold"
                                                        displayValue={(client: Client | null) => client ? client.business_name : ''}
                                                        onChange={(event) => setQuery(event.target.value)}
                                                        placeholder="Seleccione cliente..."
                                                    />
                                                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                        <ChevronsUpDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                                    </Combobox.Button>
                                                </div>
                                                <Transition
                                                    as={Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                    afterLeave={() => setQuery('')}
                                                >
                                                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-300">
                                                        {filteredClients.length === 0 && query !== '' ? (
                                                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700 italic">
                                                                No se encontraron resultados
                                                            </div>
                                                        ) : (
                                                            filteredClients.map((client) => (
                                                                <Combobox.Option
                                                                    key={client.id}
                                                                    className={({ active }) =>
                                                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100 text-black' : 'text-gray-900'}`
                                                                    }
                                                                    value={client}
                                                                >
                                                                    {({ selected, active }) => (
                                                                        <>
                                                                            <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>
                                                                                {client.business_name}
                                                                            </span>
                                                                            {selected ? (
                                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black">
                                                                                    <Check className="h-4 w-4" aria-hidden="true" />
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
                                </div>
                                <div className="flex border-b border-black">
                                    <div className="w-[45%] bg-gray-100 px-3 py-2 border-r border-black font-medium text-xs flex items-center">Condiciones de venta:</div>
                                    <div className="w-[55%] p-0">
                                        <input
                                            type="text"
                                            value={data.sale_conditions}
                                            onChange={e => setData('sale_conditions', e.target.value)}
                                            className="w-full border-0 focus:ring-0 p-2 text-sm font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="flex">
                                    <div className="w-[45%] bg-gray-100 px-3 py-2 border-r border-black font-medium text-xs flex items-center">Condiciones de entrega:</div>
                                    <div className="w-[55%] p-0">
                                        <input
                                            type="text"
                                            value={data.delivery_conditions}
                                            onChange={e => setData('delivery_conditions', e.target.value)}
                                            className="w-full border-0 focus:ring-0 p-2 text-sm font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Selection Section */}
                        <div className="mb-6">
                            <table className="w-full border-collapse border border-black text-xs uppercase font-bold">
                                <thead className="bg-gray-500 text-white text-center">
                                    <tr>
                                        <th className="border border-black py-1 w-[60%]">Descripción</th>
                                        <th className="border border-black py-1 w-[20%]">Unidad</th>
                                        <th className="border border-black py-1 w-[20%]">Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="h-10">
                                        <td className="border border-black p-0">
                                            <select
                                                value={data.product_id}
                                                onChange={e => setData('product_id', e.target.value)}
                                                className="w-full border-0 focus:ring-0 h-full px-2 text-[13px] bg-transparent font-bold appearance-none text-center"
                                                required
                                            >
                                                <option value="">Seleccione</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="border border-black text-center bg-gray-50 py-1 flex items-center justify-center h-10">
                                            TONELADAS
                                        </td>
                                        <td className="border border-black p-0">
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={data.quantity}
                                                onChange={e => setData('quantity', e.target.value)}
                                                className="w-full border-0 focus:ring-0 h-full p-1 text-center font-bold text-[13px]"
                                                required
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Observations Section */}
                        <div className="mb-10">
                            <div className="bg-gray-500 text-white text-center py-1 font-bold text-sm uppercase mb-0.5">
                                Observaciones
                            </div>
                            <div className="border border-black h-24">
                                <textarea
                                    value={data.destination}
                                    onChange={e => setData('destination', e.target.value)}
                                    className="w-full h-full border-0 focus:ring-0 p-2 text-[13px] resize-none font-bold"
                                    placeholder="..."
                                />
                            </div>
                        </div>

                        {/* Signatures & Footer Section */}
                        <div className="mt-20">
                            <div className="flex flex-col items-center mb-16">
                                <div className="w-64 border-b border-black mb-1"></div>
                                <p className="text-sm font-medium">Oscar Méndez Torres</p>
                                <p className="text-[12px] text-gray-500">Comercialización</p>
                            </div>

                            <div className="text-center mb-8">
                                <p className="text-indigo-900 font-bold text-[13px]">www.proagroindustria.com</p>
                            </div>

                            <div className="flex justify-between items-end border-t border-gray-100 pt-6">
                                <div className="text-[10px] text-gray-500 space-y-0.5">
                                    <p><span className="font-bold text-black">Venta y cobranza:</span> oscar.mendez@proagroindustria.com</p>
                                    <p><span className="font-bold text-black">Asst. Adtvo.:</span> jorge.robles@proagroindustria.com</p>
                                    <p><span className="font-bold text-black">Comercialización:</span> ventas.comercializacion@proagroindustria.com</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <img src="/img/Proagro2.png" alt="Logo" className="h-8 opacity-50 mb-1" />
                                    <p className="text-[10px] text-gray-400 font-mono italic">DCM-FO-001</p>
                                </div>
                            </div>
                        </div>

                        {/* Final Form Actions (Non-printable) */}
                        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end gap-3 print:hidden">
                            <Link
                                href={route('sales.index')}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-600 font-bold hover:bg-gray-50 transition-all uppercase text-xs tracking-wider"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-10 py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-black transition-all flex items-center uppercase text-xs tracking-widest shadow-lg disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Guardando...' : 'Generar Orden'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
