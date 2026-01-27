import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Printer, FileText, ChevronRight } from 'lucide-react';

export default function Show({ auth, order, context_module }: { auth: any, order: any, context_module?: string }) {
    const isDocumentation = context_module === 'documentation';
    const isSalesReport = context_module === 'sales_report';

    const backLink = isDocumentation
        ? route('documentation.orders.index')
        : (isSalesReport ? route('sales.index', { view: 'report' }) : route('sales.index'));

    const backLabel = isDocumentation
        ? 'Volver al reporte de embarque'
        : (isSalesReport ? 'Volver al reporte de ventas' : 'Volver al listado');

    return (
        <DashboardLayout user={auth.user} header={`Detalle de Orden: ${order.folio}`}>
            <Head title={`Orden ${order.folio}`} />

            <div className="max-w-7xl mx-auto pb-12">
                {/* Navigation Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <Link href={backLink} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        {backLabel}
                    </Link>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Reimprimir OV
                        </button>
                    </div>
                </div>

                {/* Print Preview Container */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8 max-w-[21.5cm] mx-auto overflow-x-auto">
                    <div className="p-8 md:p-12 text-black font-sans min-w-[19cm]">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-gray-100">
                            <div className="w-1/2">
                                <div className="mb-4">
                                    <img src="/img/Proagro2.png" alt="Logo Proagroindustria" className="h-16 object-contain" />
                                </div>
                                <div className="text-sm text-gray-800 space-y-0.5">
                                    <p className="font-extrabold text-blue-900 text-base">Proagroindustria S.A. de C.V.</p>
                                    <p>Carretera Coatzacoalcos-villahermosa Km 5</p>
                                    <p>Interior complejo petroquimico pajaritos</p>
                                    <p>Coatzacoalcos, Veracruz</p>
                                </div>
                            </div>

                            <div className="w-1/2 flex flex-col items-end">
                                <div className="w-64 border-2 border-indigo-900 rounded-lg overflow-hidden shadow-sm">
                                    <div className="bg-indigo-900 text-white text-center font-bold py-2 text-sm uppercase tracking-wider">
                                        Orden de Venta
                                    </div>
                                    <table className="w-full text-xs md:text-sm border-collapse">
                                        <tbody>
                                            <tr className="border-b border-indigo-100">
                                                <td className="p-2 bg-indigo-50 font-bold text-indigo-900 w-1/3">Folio:</td>
                                                <td className="p-2 text-center font-black text-indigo-700">{order.folio}</td>
                                            </tr>
                                            <tr className="border-b border-indigo-100">
                                                <td className="p-2 bg-indigo-50 font-bold text-indigo-900">Fecha:</td>
                                                <td className="p-2 text-center">
                                                    {new Date(order.created_at).toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </td>
                                            </tr>
                                            <tr className="border-b border-indigo-100">
                                                <td className="p-2 bg-indigo-50 font-bold text-indigo-900">No. Cliente</td>
                                                <td className="p-2 text-center font-medium">{order.client?.id}</td>
                                            </tr>
                                            <tr>
                                                <td className="p-2 bg-indigo-50 font-bold text-indigo-900">O. Compra:</td>
                                                <td className="p-2 text-center font-bold">{order.sale_order}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2
                                        ${order.status === 'created' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                        ${order.status === 'closed' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                        ${order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                    `}>
                                        {order.status === 'created' ? 'ABIERTA' : order.status === 'closed' ? 'CERRADA' : order.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Client Sector */}
                        <div className="mb-8">
                            <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold px-4 py-1.5 text-xs uppercase tracking-widest rounded-t-lg">
                                Datos del Cliente
                            </div>
                            <div className="border-2 border-t-0 border-gray-100 rounded-b-lg text-xs md:text-sm overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    <div className="flex border-b border-gray-100">
                                        <div className="w-28 bg-gray-50 p-2 border-r border-gray-100 font-bold text-gray-600">Nombre:</div>
                                        <div className="flex-1 p-2 font-medium uppercase">{order.client?.business_name}</div>
                                    </div>
                                    <div className="flex border-b border-gray-100">
                                        <div className="w-28 bg-gray-50 p-2 border-r border-gray-100 font-bold text-gray-600">RFC:</div>
                                        <div className="flex-1 p-2 uppercase">{order.client?.rfc}</div>
                                    </div>
                                    <div className="flex border-b border-gray-100 md:col-span-2">
                                        <div className="w-28 bg-gray-50 p-2 border-r border-gray-100 font-bold text-gray-600">Dirección:</div>
                                        <div className="flex-1 p-2 uppercase">{order.client?.address || 'SIN DIRECCIÓN REGISTRADA'}</div>
                                    </div>
                                    <div className="flex border-b border-gray-100">
                                        <div className="w-28 bg-gray-50 p-2 border-r border-gray-100 font-bold text-gray-600">Condiciones Venta:</div>
                                        <div className="flex-1 p-2 uppercase">{order.sale_conditions || 'CONTADO'}</div>
                                    </div>
                                    <div className="flex border-b border-gray-100">
                                        <div className="w-28 bg-gray-50 p-2 border-r border-gray-100 font-bold text-gray-600">Condiciones Entrega:</div>
                                        <div className="flex-1 p-2 uppercase">{order.delivery_conditions || 'LAB PLANTA'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Table */}
                        <div className="mb-8 overflow-hidden rounded-lg border-2 border-gray-100">
                            <table className="w-full text-xs md:text-sm text-left">
                                <thead className="bg-indigo-900 text-white uppercase tracking-wider font-bold">
                                    <tr>
                                        <th className="p-3 w-3/5">Descripción del producto</th>
                                        <th className="p-3 text-center w-1/5 border-l border-indigo-800">Unidad</th>
                                        <th className="p-3 text-center w-1/5 border-l border-indigo-800">Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr className="bg-white">
                                        <td className="p-4 font-bold text-gray-900">
                                            {order.product ? `${order.product.code} - ${order.product.name}` : 'N/A'}
                                        </td>
                                        <td className="p-4 text-center text-gray-600 font-medium">TONELADAS</td>
                                        <td className="p-4 text-center font-black text-indigo-700 text-base">
                                            {Number(order.total_quantity).toLocaleString(undefined, { minimumFractionDigits: 3 })}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Loaded Totals (Cargado / Saldo) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="border-2 border-emerald-100 bg-emerald-50 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Cargado</p>
                                    <p className="text-2xl font-black text-emerald-800">{Number(order.loaded_quantity || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} <span className="text-sm font-bold">TM</span></p>
                                </div>
                                <div className="h-12 w-12 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700">
                                    <Printer className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="border-2 border-amber-100 bg-amber-50 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Saldo Pendiente</p>
                                    <p className="text-2xl font-black text-amber-800">{Number(order.balance || order.total_quantity).toLocaleString(undefined, { minimumFractionDigits: 3 })} <span className="text-sm font-bold">TM</span></p>
                                </div>
                                <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center text-amber-700">
                                    <FileText className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Observations */}
                        <div className="mb-12">
                            <div className="bg-gray-100 text-gray-700 font-bold px-4 py-1.5 text-xs uppercase tracking-widest rounded-t-lg">
                                Observaciones / Destino
                            </div>
                            <div className="border-2 border-t-0 border-gray-100 rounded-b-lg p-4 text-sm text-gray-700 min-h-[4rem] bg-gray-50/50">
                                {order.destination || 'SIN OBSERVACIONES REGISTRADAS'}
                            </div>
                        </div>

                        {/* Footer Signatures */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center pt-8 border-t border-gray-100">
                            <div className="space-y-2">
                                <div className="h-20 flex items-end justify-center">
                                    <div className="w-48 border-b-2 border-gray-300 pb-1"></div>
                                </div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Elaboró</p>
                                <p className="text-xs font-medium text-gray-400">Comercialización</p>
                            </div>
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <img src="/img/Proagro2.png" alt="Logo Footer" className="h-10 opacity-30 object-contain grayscale" />
                                <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">www.proagroindustria.com</p>
                            </div>
                            <div className="space-y-2">
                                <div className="h-20 flex items-end justify-center">
                                    <div className="w-48 border-b-2 border-gray-300 pb-1"></div>
                                </div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Autorizó Cliente</p>
                                <p className="text-xs font-medium text-gray-400">Recibo de Conformidad</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Shipments Tab (Summary only) */}
                <div className="bg-zinc-900 rounded-2xl shadow-xl overflow-hidden text-white border border-zinc-800">
                    <div className="p-6 border-b border-zinc-800 flex items-center">
                        <Printer className="w-6 h-6 mr-3 text-indigo-400" />
                        <h3 className="font-bold text-xl uppercase tracking-wider">Historial de Embarques Vinculados</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-800/50 text-zinc-400 text-xs font-bold uppercase">
                                <tr>
                                    <th className="px-6 py-4">Folio Shipment</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Transporte</th>
                                    <th className="px-6 py-4 text-right">Peso Neto (TM)</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {order.shipments?.map((shipment: any) => (
                                    <tr key={shipment.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4 font-black text-indigo-400">{shipment.folio}</td>
                                        <td className="px-6 py-4 text-sm text-zinc-300">{new Date(shipment.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-xs text-zinc-400">
                                            {shipment.transporter?.name} <br />
                                            <span className="text-[10px] font-mono">{shipment.vehicle?.plate_number}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-400">
                                            {shipment.weight_ticket?.net_weight ? (Number(shipment.weight_ticket.net_weight) / 1000).toFixed(3) : '0.000'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={route('sales.show', { sale: shipment.id, module: 'documentation' })} className="text-zinc-500 hover:text-white">
                                                <ChevronRight className="w-5 h-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {(!order.shipments || order.shipments.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic font-medium">No se han registrado embarques para esta orden de venta.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 1cm; size: letter; }
                    body * { visibility: hidden; }
                    .max-w-[21.5cm], .max-w-[21.5cm] * { visibility: visible; }
                    .max-w-[21.5cm] {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .print\\:hidden { display: none !important; }
                    .bg-indigo-900 { background-color: #312e81 !important; color: white !important; -webkit-print-color-adjust: exact; }
                    .bg-indigo-50 { background-color: #eef2ff !important; -webkit-print-color-adjust: exact; }
                    .bg-gray-700 { background-color: #374151 !important; color: white !important; -webkit-print-color-adjust: exact; }
                    .bg-emerald-50 { background-color: #ecfdf5 !important; -webkit-print-color-adjust: exact; }
                    .bg-amber-50 { background-color: #fffbeb !important; -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </DashboardLayout>
    );
}
