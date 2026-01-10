import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';

interface Order {
    id: string;
    folio: string;
    sale_order: string;
    sale_conditions: string;
    delivery_conditions: string;
    created_at: string;
    client: {
        id: number;
        business_name: string;
        rfc: string;
        address: string;
    };
    items: Array<{
        product: {
            name: string;
            code: string;
        };
        requested_quantity: number;
    }>;
    destination: string; // Observaciones
}

export default function Print({ order }: { order: Order }) {

    useEffect(() => {
        // Auto print on load if desired, but maybe user wants to see it first.
        // window.print();
    }, []);

    const item = order.items && order.items.length > 0 ? order.items[0] : null;

    return (
        <div className="bg-white min-h-screen p-8 text-black font-sans">
            <Head title={`Orden de Venta - ${order.folio}`} />

            <div className="max-w-[21cm] mx-auto bg-white p-4"> {/* A4 width approx */}

                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div className="w-1/2">
                        <div className="mb-4">
                            <img src="/images/Proagro2.png" alt="Logo Proagroindustria" className="h-16 object-contain" />
                        </div>
                        <div className="text-sm text-gray-800">
                            <p className="font-bold">Proagroindustria S.A. de C.V.</p>
                            <p>Carretera Coatzacoalcos-villahermosa Km 5</p>
                            <p>interior complejo petroquimico pajaritos</p>
                            <p>Coatzacoalcos, Veracruz</p>
                        </div>
                    </div>

                    <div className="w-1/2 flex flex-col items-end">
                        <div className="w-64 border border-black">
                            <div className="bg-gray-500 text-white text-center font-bold py-1">
                                Orden de venta
                            </div>
                            <table className="w-full text-sm border-collapse">
                                <tbody>
                                    <tr>
                                        <td className="border-r border-b border-black p-1 bg-gray-100 w-1/3">Folio:</td>
                                        <td className="border-b border-black p-1 text-center font-medium">{order.folio}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-r border-b border-black p-1 bg-gray-100">Fecha:</td>
                                        <td className="border-b border-black p-1 text-center">
                                            {new Date(order.created_at).toLocaleDateString("es-ES")}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border-r border-b border-black p-1 bg-gray-100">No. Cliente</td>
                                        <td className="border-b border-black p-1 text-center">{order.client?.id}</td>
                                    </tr>
                                    <tr>
                                        <td className="border-r border-black p-1 bg-gray-100">Orden de compra:</td>
                                        <td className="p-1 text-center">{order.sale_order}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Client Data */}
                <div className="mb-4">
                    <div className="bg-gray-600 text-white font-bold px-2 py-1 text-center mb-1">
                        Datos del cliente
                    </div>
                    <div className="border border-black">
                        <div className="flex border-b border-gray-300">
                            <div className="w-1/3 p-1 bg-gray-50 border-r border-gray-300 text-right pr-4 text-sm font-medium">Condiciones de venta:</div>
                            <div className="p-1 flex-1 text-sm uppercase pl-2">{order.sale_conditions}</div>
                        </div>
                        <div className="flex">
                            <div className="w-1/3 p-1 bg-gray-50 border-r border-gray-300 text-right pr-4 text-sm font-medium">Condiciones de entrega:</div>
                            <div className="p-1 flex-1 text-sm uppercase pl-2">{order.delivery_conditions}</div>
                        </div>
                    </div>
                </div>

                {/* Product Table */}
                <div className="mb-4">
                    <table className="w-full border border-black text-sm">
                        <thead>
                            <tr className="bg-gray-500 text-white">
                                <th className="p-1 text-left w-3/5">Descripción</th>
                                <th className="p-1 text-center w-1/5 border-l border-gray-400">Unidad</th>
                                <th className="p-1 text-center w-1/5 border-l border-gray-400">Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border-r border-black p-1 h-8">
                                    {item ? `${item.product.code} - ${item.product.name}` : 'N/A'}
                                </td>
                                <td className="border-r border-black p-1 text-center">TONELADAS</td>
                                <td className="p-1 text-center font-mono">
                                    {item ? Number(item.requested_quantity).toLocaleString() : '0'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Observations */}
                <div className="mb-12">
                    <div className="bg-gray-600 text-white font-bold px-2 py-1 text-center mb-1">
                        Observaciones
                    </div>
                    <div className="border border-black min-h-[4rem] p-2 text-sm whitespace-pre-wrap">
                        {order.destination}
                    </div>
                </div>

                {/* Footer / Signatures */}
                <div className="mt-12 text-center text-sm">
                    <div className="mb-8">
                        <div className="inline-block border-t border-black px-12 pt-1 font-medium">
                            Oscar Méndez Torres
                            <div className="text-gray-600 font-normal">Comercialización</div>
                        </div>
                    </div>

                    <div className="mb-4 font-bold">
                        www.proagroindustria.com
                    </div>

                    <div className="text-xs text-gray-700 flex justify-between items-end">
                        <div className="text-left space-y-1">
                            <div>Venta y cobranza: <span className="ml-2">oscar.mendez@proagroindustria.com</span></div>
                            <div>Asst. Adtvo.: <span className="ml-2">jorge.robles@proagroindustria.com</span></div>
                            <div>Comercialización: <span className="ml-2">ventas.comercializacion@proagroindustria.com</span></div>
                        </div>

                        <div className="flex flex-col items-end">
                            {/* Small Logo Repeat */}
                            <div className="mb-2">
                                <img src="/images/Proagro2.png" alt="Logo Proagroindustria" className="h-8 object-contain" />
                            </div>
                            <div className="mt-2 text-right">DCM-FO-001</div>
                        </div>
                    </div>
                </div>

                {/* Actions (Hidden on Print) */}
                <div className="mt-8 flex justify-center gap-4 print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 font-medium"
                    >
                        Imprimir
                    </button>

                    <Link
                        href="/sales"
                        className="bg-gray-500 text-white px-6 py-2 rounded shadow hover:bg-gray-600 font-medium"
                    >
                        Volver
                    </Link>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 0.5cm; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
