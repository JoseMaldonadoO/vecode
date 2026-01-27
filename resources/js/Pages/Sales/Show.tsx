import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Package, User, Truck, FileText, Calendar, MapPin, Scale } from 'lucide-react';

export default function Show({ auth, order, module, context_module }: { auth: any, order: any, module?: string, context_module?: string }) {
    const currentModule = context_module || module;
    const isDocumentation = currentModule === 'documentation';
    const isSalesReport = currentModule === 'sales_report';

    const backLink = isDocumentation
        ? route('documentation.orders.index')
        : (isSalesReport ? route('sales.index', { view: 'report' }) : route('sales.index'));

    const backLabel = isDocumentation
        ? 'Volver al reporte de embarque'
        : (isSalesReport ? 'Volver al reporte de ventas' : 'Volver al listado');

    return (
        <DashboardLayout user={auth.user} header={`Orden ${order.folio}`}>
            <Head title={`Orden ${order.folio}`} />

            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <Link href={backLink} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        {backLabel}
                    </Link>
                    <a
                        href={route('documents.cp', order.id)}
                        target="_blank"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Imprimir Orden
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Estado de la Orden</h2>
                                <p className="text-sm text-gray-500">Última actualización: {new Date(order.updated_at).toLocaleString()}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide
                                ${order.status === 'created' ? 'bg-blue-100 text-blue-800' : ''}
                                ${order.status === 'weighing_in' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${order.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                            `}>
                                {order.status}
                            </span>
                        </div>

                        {/* Order Details */}
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b">
                                <h3 className="font-bold text-gray-900 flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-gray-500" />
                                    Detalles del Pedido
                                </h3>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Folio Interno</p>
                                    <p className="font-mono font-bold text-lg">{order.folio}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Referencia OV</p>
                                    <p className="font-mono font-bold text-lg">{order.sale_order}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Cliente</p>
                                    <p className="font-bold text-lg text-indigo-600">{order.client?.business_name}</p>
                                    <p className="text-xs text-gray-400">{order.client?.rfc}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Fecha de Creación</p>
                                    <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                        {/* Product Details */}
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b">
                                <h3 className="font-bold text-gray-900 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-gray-500" />
                                    Información del Producto
                                </h3>
                            </div>
                            <div className="p-6 grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Producto</p>
                                    <p className="font-bold text-lg">{order.product?.name}</p>
                                    <p className="text-xs text-gray-400">Código: {order.product?.code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Cantidad Total Contratada</p>
                                    <p className="font-bold text-lg text-indigo-600">{order.total_quantity} TM</p>
                                </div>
                            </div>
                        </div>

                        {/* Shipment Orders (Trips) */}
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b">
                                <h3 className="font-bold text-gray-900 flex items-center">
                                    <Truck className="w-5 h-5 mr-2 text-gray-500" />
                                    Envíos Relacionados (Viajes OE/OB)
                                </h3>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Folio OE</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estatus</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Peso Neto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {order.shipments?.map((shipment: any) => (
                                        <tr key={shipment.id}>
                                            <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                                                <Link href={route('sales.show', { id: shipment.id, module: 'documentation' })}>{shipment.folio}</Link>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 uppercase">{shipment.operation_type}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{shipment.status}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                                {shipment.weight_ticket?.net_weight ? `${shipment.weight_ticket.net_weight} kg` : '---'}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!order.shipments || order.shipments.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">No hay envíos registrados para esta OV</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Sidebar: Logistics & Weights */}
                    <div className="space-y-6">
                        {/* Logistics Card */}
                        <div className="bg-zinc-900 text-white rounded-xl shadow-lg p-6">
                            <h3 className="font-bold mb-4 flex items-center text-zinc-300">
                                <Truck className="w-5 h-5 mr-2" />
                                Logística y Transporte
                            </h3>

                            {order.transporter ? (
                                <div className="space-y-4">
                                    <div className="pb-4 border-b border-zinc-700">
                                        <p className="text-xs text-zinc-500 uppercase mb-1">Transportista</p>
                                        <p className="font-bold text-lg">{order.transporter.name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase mb-1">Chofer</p>
                                            <p className="font-medium text-zinc-200">{order.driver?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase mb-1">Unidad</p>
                                            <p className="font-medium text-amber-500 font-mono">{order.vehicle?.plate_number}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-500">
                                    <p className="mb-2">Sin asignar</p>
                                    <Link href={route('traffic.index')} className="text-indigo-400 hover:text-indigo-300 text-sm underline">Ir a Tráfico</Link>
                                </div>
                            )}
                        </div>

                        {/* Weights Card */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h3 className="font-bold mb-4 flex items-center text-gray-900">
                                <Scale className="w-5 h-5 mr-2 text-gray-500" />
                                Pesajes (Báscula)
                            </h3>

                            {order.weight_ticket ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-2 border-b border-dashed">
                                        <span className="text-sm text-gray-500">Ticket #</span>
                                        <span className="font-mono font-bold">{order.weight_ticket.ticket_number}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Tara (Entrada)</span>
                                        <span className="font-mono font-medium">{order.weight_ticket.tare_weight || '---'} kg</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Bruto (Salida)</span>
                                        <span className="font-mono font-medium">{order.weight_ticket.gross_weight || '---'} kg</span>
                                    </div>
                                    <div className="pt-2 border-t mt-2 flex justify-between items-center">
                                        <span className="font-bold text-gray-900">Neto</span>
                                        <span className="font-mono font-bold text-lg text-indigo-600">
                                            {order.weight_ticket.net_weight ? `${order.weight_ticket.net_weight} kg` : '---'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-lg text-gray-400 text-sm">
                                    Sin ticket de báscula
                                </div>
                            )}
                        </div>
                    </div>
                </div >
            </div >
        </DashboardLayout >
    );
}
