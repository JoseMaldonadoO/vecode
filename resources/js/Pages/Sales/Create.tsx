import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Check, ChevronsUpDown, FileText, User, Box, Calendar, Hash, Truck, ShoppingCart } from 'lucide-react';
import { FormEventHandler, useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { formatter } from '@/Utils/formatters'; // Assuming or creating a formatter utility later, or using inline for now

interface Client {
    id: number;
    business_name: string;
    rfc?: string;
    address?: string;
    contact_info?: string;
}
interface Product { id: number; name: string; code: string; default_packaging: string; }

export default function Create({ auth, clients, products, suggested_folios, default_folio }: { auth: any, clients: Client[], products: Product[], suggested_folios: string[], default_folio: string }) {
    const numberFormatter = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 3,
        minimumFractionDigits: 0,
    });

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

    const handleClientChange = (idOrClient: any) => {
        const id = typeof idOrClient === 'object' ? idOrClient?.id.toString() : idOrClient;
        setData('client_id', id || '');
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('sales.store'));
    };

    return (
        <DashboardLayout user={auth.user} header="Nueva Orden de Venta">
            <Head title="Crear Orden" />

            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex justify-between items-center print:hidden">
                    <Link href={route('sales.index')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al listado
                    </Link>
                </div>

                <div className="bg-white shadow-2xl rounded-sm border border-gray-300 overflow-hidden max-w-[21.5cm] mx-auto mb-10">
                    <form onSubmit={submit} className="p-8 md:p-10 text-black font-sans min-w-[19cm]">
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
                                            <td className="border border-black px-2 py-1 bg-gray-100 font-medium w-1/3 text-gray-700">Folio:</td>
                                            <td className="border border-black px-0 py-0 font-bold text-[13px]">
                                                <input
                                                    type="text"
                                                    value={data.folio}
                                                    onChange={e => setData('folio', e.target.value)}
                                                    className="w-full border-none px-2 py-1 focus:ring-0 text-[13px] font-bold"
                                                    placeholder="OV-2025-..."
                                                    required
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 bg-gray-100 font-medium text-gray-700">Fecha:</td>
                                            <td className="border border-black px-2 py-1 text-gray-700">
                                                {new Date().toLocaleDateString('es-MX')}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 bg-gray-100 font-medium text-gray-700">No. Cliente:</td>
                                            <td className="border border-black px-0 py-0 font-bold text-[13px]">
                                                <input
                                                    type="text"
                                                    value={data.client_id}
                                                    onChange={e => handleClientChange(e.target.value)}
                                                    className="w-full border-none px-2 py-1 focus:ring-0 text-[13px] font-bold"
                                                    placeholder="ID"
                                                    required
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black px-2 py-1 bg-gray-100 font-medium text-gray-700">Orden de compra:</td>
                                            <td className="border border-black px-0 py-0 font-bold text-[13px]">
                                                <input
                                                    type="text"
                                                    value={data.sale_order}
                                                    onChange={e => setData('sale_order', e.target.value)}
                                                    className="w-full border-none px-2 py-1 focus:ring-0 text-[13px] font-bold uppercase"
                                                    placeholder="O.C."
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
                                    <div className="w-1/4 bg-gray-100 px-3 py-2 border-r border-black font-medium text-xs flex items-center text-gray-700">Nombre:</div>
                                    <div className="w-3/4 px-3 py-2 text-sm font-bold uppercase min-h-[2.5rem] flex items-center">
                                        {selectedClient?.business_name || (
                                            <span className="text-gray-400 font-normal italic">Seleccione un cliente por ID arriba</span>
                                        )}
                                    </div>
                                </div>
                                {selectedClient && (
                                    <>
                                        <div className="flex border-b border-black">
                                            <div className="w-1/4 bg-gray-100 px-3 py-1 border-r border-black font-medium text-xs flex items-center text-gray-700">RFC:</div>
                                            <div className="w-3/4 px-3 py-1 text-xs font-bold uppercase">
                                                {selectedClient.rfc || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="flex border-b border-black">
                                            <div className="w-1/4 bg-gray-100 px-3 py-1 border-r border-black font-medium text-xs flex items-center text-gray-700">Dirección:</div>
                                            <div className="w-3/4 px-3 py-1 text-[11px] font-bold uppercase leading-tight">
                                                {selectedClient.address || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="flex border-b border-black">
                                            <div className="w-1/4 bg-gray-100 px-3 py-1 border-r border-black font-medium text-xs flex items-center text-gray-700">Contacto:</div>
                                            <div className="w-3/4 px-3 py-1 text-xs font-bold uppercase">
                                                {selectedClient.contact_info || 'N/A'}
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="flex border-b border-black">
                                    <div className="w-[45%] bg-gray-100 px-3 py-1 border-r border-black font-medium text-xs flex items-center text-gray-700">Condiciones de venta:</div>
                                    <td className="w-[55%] font-bold text-sm uppercase">
                                        <input
                                            type="text"
                                            value={data.sale_conditions}
                                            onChange={e => setData('sale_conditions', e.target.value)}
                                            className="w-full border-none px-3 py-1 focus:ring-0 text-sm font-bold uppercase"
                                            placeholder="CONTADO / CRÉDITO..."
                                        />
                                    </td>
                                </div>
                                <div className="flex">
                                    <div className="w-[45%] bg-gray-100 px-3 py-1 border-r border-black font-medium text-xs flex items-center text-gray-700">Condiciones de entrega:</div>
                                    <td className="w-[55%] font-bold text-sm uppercase">
                                        <input
                                            type="text"
                                            value={data.delivery_conditions}
                                            onChange={e => setData('delivery_conditions', e.target.value)}
                                            className="w-full border-none px-3 py-1 focus:ring-0 text-sm font-bold uppercase"
                                            placeholder="LAB PLANTA / ENTRregado..."
                                        />
                                    </td>
                                </div>
                            </div>
                        </div>

                        {/* Product Table */}
                        <div className="mb-6">
                            <table className="w-full border-collapse border border-black text-xs uppercase font-bold">
                                <thead className="bg-gray-500 text-white text-center font-bold">
                                    <tr>
                                        <th className="border border-black py-1 w-[60%]">Descripción</th>
                                        <th className="border border-black py-1 w-[20%]">Unidad</th>
                                        <th className="border border-black py-1 w-[20%]">Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="h-10 text-center">
                                        <td className="border border-black px-0 py-0">
                                            <select
                                                value={data.product_id}
                                                onChange={e => setData('product_id', e.target.value)}
                                                className="w-full border-none px-2 py-2 focus:ring-0 text-[13px] font-bold text-center appearance-none bg-transparent"
                                                required
                                            >
                                                <option value="">-- Seleccione producto --</option>
                                                {products.map(product => (
                                                    <option key={product.id} value={product.id}>{product.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="border border-black py-1 h-10 bg-gray-50">
                                            TONELADAS
                                        </td>
                                        <td className="border border-black px-0 py-0">
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={data.quantity}
                                                onChange={e => setData('quantity', e.target.value)}
                                                className="w-full border-none px-2 py-2 focus:ring-0 font-black text-[15px] text-center"
                                                placeholder="0.00"
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
                            <textarea
                                value={data.destination}
                                onChange={e => setData('destination', e.target.value)}
                                rows={3}
                                className="w-full border border-black p-3 text-[13px] font-bold focus:ring-0 transition-all font-sans"
                                placeholder="Escriba aquí observaciones o instrucciones adicionales..."
                            />
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

                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end print:hidden">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-10 py-3 border border-transparent text-lg font-bold rounded-lg shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all transform hover:-translate-y-0.5"
                            >
                                <Save className="w-6 h-6 mr-2" />
                                {processing ? 'GUARDANDO...' : 'GUARDAR ORDEN DE VENTA'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
