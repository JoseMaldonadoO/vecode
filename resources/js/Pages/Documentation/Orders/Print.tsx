import React, { useEffect } from "react";
import { Head } from "@inertiajs/react";

interface Order {
    id: string;
    folio: string;
    sales_order?: {
        folio: string;
        sale_order?: string; // Pedido
    };
    date?: string;
    created_at: string;
    client: {
        business_name: string;
        rfc?: string;
        address?: string;
    };
    consignee?: string;
    transport_company?: string; // Linea transportista
    carta_porte?: string;
    operator_name?: string;
    unit_number?: string;
    license_number?: string;
    tractor_plate?: string;
    economic_number?: string;
    unit_type?: string;
    trailer_plate?: string;
    destination?: string;
    product?: {
        code?: string;
        name: string;
    };
    presentation?: string;
    sacks_count?: string;
    programmed_tons?: string;
    origin?: string;
    documenter_name?: string;
    scale_name?: string;
    observations?: string;
}

interface Props {
    order: Order;
    qrCode?: string; // Base64 string if generated backend, or we generate frontend
}

export default function Print({ order }: Props) {
    useEffect(() => {
        // Auto-print when component mounts
        setTimeout(() => {
            window.print();
        }, 1000);
    }, []);

    // Helper calculate sacks if missing (Legacy Logic)
    const calculateSacks = () => {
        if (order.sacks_count) return order.sacks_count;
        if (!order.programmed_tons || !order.presentation) return "N/A";

        const tons = parseFloat(order.programmed_tons);
        if (isNaN(tons)) return "N/A";

        if (order.presentation.includes("25")) return (tons * 40).toFixed(0);
        if (order.presentation.includes("50")) return (tons * 20).toFixed(0);
        if (order.presentation.includes("200")) return (tons * 5).toFixed(0); // Assuming 200kg sacks?

        return "N/A";
    };

    return (
        <div className="bg-white p-4 min-h-screen">
            <Head title={`Imprimir OE - ${order.folio}`} />

            <style>{`
                @media print {
                    @page { size: A4; margin: 0.5cm; }
                    body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
                    .no-print { display: none; }
                }
                table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; }
                th, td { border: 1px solid black; padding: 4px; }
                .bg-gray { background-color: #d1d5db !important; color: black !important; font-weight: bold; text-align: center; }
                .bg-light { background-color: #f3f4f6 !important; font-weight: bold; } // whitesmoke equivalent
                .no-border { border: none !important; }
                .text-center { text-align: center; }
                .input-mock { border: none; width: 100%; text-align: center; background: transparent; }
                .signature-line { border-top: 1px solid black; width: 80%; margin: 20px auto 0; }
            `}</style>

            <div className="max-w-[210mm] mx-auto bg-white border border-gray-200 shadow-md print:border-none print:shadow-none p-8 print:p-0">

                <div className="text-center mb-4 flex items-center justify-center relative">
                    {/* Header Table Structure */}
                    <table className="no-border">
                        <tr className="no-border">
                            <td className="no-border text-center">
                                <div className="border border-black p-1 font-bold">PROAGROINDUSTRIA S.A. DE C.V.</div>
                                <div className="text-xs mt-1">Carretera Coatzacoalcos-villahermosa Km 5 centro, Coatzacoalcos, Ver. CP. 96400 RFC: PRO140101</div>
                                <div className="text-xs">Tel. 921 21 90 191/ 921 21 80 181</div>
                                <div className="font-bold mt-1">GLS-DD-FO-001</div>
                            </td>
                        </tr>
                    </table>
                </div>

                {/* TITLE */}
                <table className="mb-4">
                    <tr>
                        <th className="bg-gray text-lg">ORDEN DE EMBARQUE</th>
                    </tr>
                </table>

                {/* FOLIO TABLE */}
                <table className="mb-4">
                    <tr>
                        <td className="bg-light w-32">FOLIO O.E.:</td>
                        <td className="text-center text-lg font-bold">{order.folio}</td>
                        <td className="no-border w-4"></td>
                        <td className="bg-light w-32">ORDEN DE VENTA</td>
                        <td className="text-center">{order.sales_order?.folio || "N/A"}</td>
                        <td className="no-border w-4"></td>
                        <td className="bg-light w-32">FECHA</td>
                        <td className="text-center">{order.date || order.created_at.split('T')[0]}</td>
                    </tr>
                </table>

                {/* CLIENT DATA */}
                <table className="mb-4">
                    <tr>
                        <th colSpan={4} className="bg-gray">DATOS DEL CLIENTE</th>
                        <td rowSpan={4} className="w-48 text-center no-border border-l-0!">
                            {/* Logo Placeholder */}
                            <img src="/images/logo_proagro.png" alt="PROAGRO" className="h-16 mx-auto object-contain" />
                        </td>
                    </tr>
                    <tr>
                        <td className="bg-light w-32">NOMBRE:</td>
                        <td colSpan={3} className="text-center">{order.client.business_name}</td>
                    </tr>
                    <tr>
                        <td className="bg-light">RFC:</td>
                        <td colSpan={3} className="text-center">{order.client.rfc || "N/A"}</td>
                    </tr>
                    <tr>
                        <td className="bg-light">DIRECCION:</td>
                        <td colSpan={3} className="text-center uppercase text-[10px]">{order.client.address || "N/A"}</td>
                    </tr>
                    <tr>
                        <td className="bg-light">CONSIGNADO:</td>
                        <td className="text-center uppercase text-[10px]">{order.consignee || order.client.business_name}</td>
                        <td className="bg-light w-24">PEDIDO:</td>
                        <td className="text-center">{order.sales_order?.sale_order || "N/A"}</td>
                        <td className="no-border"></td>
                    </tr>
                </table>

                {/* TRANSPORTER DATA */}
                <table className="mb-4">
                    <tr>
                        <th colSpan={6} className="bg-gray">DATOS DEL TRANSPORTISTA</th>
                    </tr>
                    <tr>
                        <td className="bg-light w-32">TRANSPORTE:</td>
                        <td colSpan={3} className="text-center uppercase">{order.transport_company || "N/A"}</td>
                        <td className="bg-light w-32">CARTA PORTE:</td>
                        <td className="text-center">{order.carta_porte || "N/A"}</td>
                    </tr>
                    <tr>
                        <td className="bg-light">OPERADOR:</td>
                        <td colSpan={5} className="text-center uppercase">{order.operator_name || "N/A"}</td>
                    </tr>
                    <tr>
                        <td className="bg-light">UNIDAD:</td>
                        <td colSpan={3} className="text-center">{order.unit_number || "N/A"}</td>
                        <td className="bg-light">LICENCIA:</td>
                        <td className="text-center">{order.license_number || "N/A"}</td>
                    </tr>
                    <tr>
                        <td className="bg-light">TRACTOR:</td>
                        <td className="text-center">{order.tractor_plate || "N/A"}</td>
                        <td className="bg-light">ECONOMICO:</td>
                        <td className="text-center">{order.economic_number || "N/A"}</td>
                        <td className="bg-light">TIPO UNIDAD:</td>
                        <td className="text-center">{order.unit_type || "N/A"}</td>
                    </tr>
                    <tr>
                        <td className="bg-light">REMOLQUE:</td>
                        <td className="text-center">{order.trailer_plate || "N/A"}</td>
                        <td className="bg-light">DESTINO:</td>
                        <td className="text-center uppercase text-[10px]">{order.destination || "N/A"}</td>
                        <td className="bg-light">ESTADO:</td>
                        <td className="text-center">MX</td>
                    </tr>
                </table>

                {/* SHIPMENT DATA */}
                <table className="mb-4">
                    <tr>
                        <th colSpan={6} className="bg-gray">DATOS DEL EMBARQUE</th>
                    </tr>
                    <tr>
                        <td className="bg-light text-center w-24">CODIGO</td>
                        <td className="no-border w-4"></td>
                        <td className="bg-light text-center">DESCRIPCION DEL PRODUCTO</td>
                        <td className="no-border w-4"></td>
                        <td className="bg-light text-center w-32">TONS. PROG.</td>
                    </tr>
                    <tr>
                        <td className="text-center">{order.product?.code || "S/C"}</td>
                        <td className="no-border"></td>
                        <td className="text-center">{order.product?.name || "N/A"}</td>
                        <td className="no-border"></td>
                        <td className="text-center">{order.programmed_tons || "0.00"}</td>
                    </tr>
                </table>

                <table className="mb-4">
                    <tr>
                        <td className="bg-light text-center">PRESENTACION</td>
                        <td className="no-border w-4"></td>
                        <td className="bg-light text-center w-32">NUMERO DE SACOS</td>
                        <td className="no-border w-4"></td>
                        <td className="bg-light text-center w-48">ORIGEN</td>
                        <td className="no-border w-4"></td>
                        <td className="bg-light text-center w-32">TONS. CARGADAS</td>
                    </tr>
                    <tr>
                        <td className="text-center">{order.presentation || "N/A"}</td>
                        <td className="no-border"></td>
                        <td className="text-center">{calculateSacks()}</td>
                        <td className="no-border"></td>
                        <td className="text-center">{order.origin || "PROAGRO"}</td>
                        <td className="no-border"></td>
                        <td className="text-center"></td>
                    </tr>
                </table>

                {/* CHECKBOXES & OPTIONS */}
                <table className="mb-4">
                    <tr className="no-border">
                        <td className="no-border w-4"></td>
                        <td className="text-center font-bold">ALMACEN</td>
                        <td className="no-border w-8"></td>
                        <td className="text-center font-bold">ORIGEN DE PRODUCTO</td>
                        <td className="no-border w-8"></td>
                        <td className="text-center font-bold">TIPO DE SACOS</td>
                    </tr>
                    <tr className="no-border">
                        <td className="no-border"></td>
                        <td className="text-center align-middle">
                            <span className="inline-block border border-black w-4 h-4 mr-1"></span> 1
                            <span className="inline-block border border-black w-4 h-4 mx-1"></span> 2
                            <span className="inline-block border border-black w-4 h-4 mx-1"></span> 3
                            <span className="inline-block border border-black w-4 h-4 mx-1"></span> 4
                            <span className="inline-block border border-black w-4 h-4 mx-1"></span> 5
                        </td>
                        <td className="no-border"></td>
                        <td className="text-center align-middle">
                            UREA I <span className="inline-block border border-black w-4 h-4 mx-1"></span>
                            UREA II <span className="inline-block border border-black w-4 h-4 mx-1"></span>
                        </td>
                        <td className="no-border"></td>
                        <td className="text-center align-middle">
                            <span className="inline-block border border-black w-4 h-4 mr-1"></span> PROPIO
                            <span className="inline-block border border-black w-4 h-4 mx-1"></span> CLIENTE
                        </td>
                    </tr>
                </table>

                {/* SIGNATURES 1 */}
                <table className="mb-4">
                    <tr>
                        <td className="bg-light text-center w-1/2">DOCUMENTADOR</td>
                        <td className="no-border w-8"></td>
                        <td className="bg-light text-center w-1/2">SUPERVISOR</td>
                    </tr>
                    <tr className="h-16">
                        <td className="align-bottom text-center">
                            <div className="uppercase">{order.documenter_name}</div>
                            <div className="border-t border-black w-3/4 mx-auto mt-1">FIRMA</div>
                        </td>
                        <td className="no-border"></td>
                        <td className="align-bottom text-center">
                            <div className="border-t border-black w-3/4 mx-auto mt-1">FIRMA</div>
                        </td>
                    </tr>
                </table>

                {/* SIGNATURES 2 */}
                <table className="mb-4">
                    <tr>
                        <td className="bg-light text-center w-1/2">OPERADOR DE BASCULA</td>
                        <td className="no-border w-8"></td>
                        <td className="bg-light text-center w-1/2">OPERADOR DE UNIDAD</td>
                    </tr>
                    <tr className="h-16">
                        <td className="align-bottom text-center">
                            <div className="uppercase">{order.scale_name}</div>
                            <div className="border-t border-black w-3/4 mx-auto mt-1">FIRMA</div>
                        </td>
                        <td className="no-border"></td>
                        <td className="align-bottom text-center">
                            <div className="uppercase text-xs">{order.operator_name}</div>
                            <div className="border-t border-black w-3/4 mx-auto mt-1">FIRMA</div>
                        </td>
                    </tr>
                </table>

                {/* SECURITY */}
                <table className="mb-4 w-1/2">
                    <tr>
                        <td className="bg-light text-center">SEGURIDAD FISICA</td>
                    </tr>
                    <tr className="h-16">
                        <td className="align-bottom text-center">
                            <div className="border-t border-black w-3/4 mx-auto mt-1">Firma</div>
                        </td>
                    </tr>
                </table>

                {/* TIMES */}
                <table className="mb-4 no-border font-bold">
                    <tr className="no-border">
                        <td className="no-border text-right w-1/3">HORA INICIAL DE CARGA:</td>
                        <td className="no-border text-left pl-2">_______________</td>
                        <td className="no-border w-10"></td>
                        <td className="no-border text-right w-1/3">HORA FINAL DE CARGA:</td>
                        <td className="no-border text-left pl-2">_______________</td>
                    </tr>
                </table>

                {/* OBSERVATIONS */}
                <table className="mb-4">
                    <tr>
                        <th className="bg-gray">OBSERVACIONES:</th>
                    </tr>
                    <tr className="h-12">
                        <td className="align-top text-xs uppercase">{order.observations}</td>
                    </tr>
                </table>

                {/* QR Placeholder */}
                <div className="text-right">
                    {order.folio ? (
                        <div className="inline-block border p-1">
                            {/* In real implementaiton, inject QR image here */}
                            <div className="w-24 h-24 flex items-center justify-center bg-gray-100 text-[10px] text-center">
                                [QR: {order.folio}]
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* PAGE BREAK / SECOND PAGE FOR POLICIES */}
                <div style={{ pageBreakBefore: 'always' }}></div>

                {/* POLICIES HEADER */}
                <table className="mb-4">
                    <tr>
                        <th className="text-center text-lg no-border">POLÍTICA PARA EL PROCESO DE EMBARQUES</th>
                    </tr>
                    <tr>
                        <td className="no-border p-0">
                            <table className="w-full">
                                <tr>
                                    <td className="w-3/4 border-0 border-b border-r">PROAGROINDUSTRIA, S.A. DE C.V.</td>
                                    <td className="w-1/4 border-0 border-b text-center align-middle" rowSpan={4}>
                                        <img src="/images/logo_proagro.png" alt="PROAGRO" className="h-12 mx-auto object-contain" />
                                    </td>
                                </tr>
                                <tr><td className="border-0 border-b border-r">Carretera Coatzacoalcos-Villahermosa km 5, Centro.</td></tr>
                                <tr><td className="border-0 border-b border-r">Coatzacoalcos, Ver., CP 96400</td></tr>
                                <tr><td className="border-0 border-r">RFC: PRO140101QY9</td></tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <th className="text-center font-bold border bg-gray-100">GLS-TR-FO-013</th>
                    </tr>
                </table>

                {/* POLICY DETAILS */}
                <table className="mb-4 text-[10px]">
                    <tr>
                        <td className="bg-light w-1/4">NOMBRE DEL DEPARTAMENTO</td>
                        <td className="w-1/4">LOGÍSTICA Y SUMINISTRO</td>
                        <td className="bg-light w-1/4">POLÍTICA N°</td>
                        <td className="w-1/4">1</td>
                    </tr>
                    <tr>
                        <td className="bg-light">FECHA DE ENTRADA EN VIGOR:</td>
                        <td>13 DE JUNIO DEL 2023</td>
                        <td className="bg-light">VERSIÓN N°</td>
                        <td>1</td>
                    </tr>
                    <tr><td colSpan={4} className="bg-light text-center font-bold">ALCANCE</td></tr>
                    <tr><td colSpan={4}>La Presente política es aplicable a los diferentes grupos de interés que forman parte del proceso de los embarques de producto terminado dentro de las instalaciones del Proagroindustria, S.A. de C.V., con especial énfasis en el operador de las líneas transportistas que ingresan a las instalaciones.</td></tr>
                    <tr><td colSpan={4} className="bg-light text-center font-bold">DECLARACIÓN DE LA POLÍTICA</td></tr>
                    <tr><td colSpan={4}>La presente política se realiza como medida para salvaguardar y cumplir con las buenas prácticas de comportamiento, seguridad del personal, protección a instalaciones e infraestructura.</td></tr>
                </table>

                {/* POLICY LIST */}
                <div className="text-center font-bold border border-black p-1 mb-2">SECCIÓN DE LAS POLÍTICAS</div>
                <table className="mb-4 text-[9px]">
                    <tr>
                        <th className="w-1/2 text-center bg-gray-100">ASPECTOS GENERALES</th>
                        <th className="w-1/2 text-center bg-gray-100">POLÍTICA DEL ÁREA DE ALMACENES DE PRODUCTO TERMINADO</th>
                    </tr>
                    <tr>
                        <td className="align-top">1. Portar correctamente el equipo de protección personal.</td>
                        <td className="align-top" rowSpan={2}>10. Para el caso de las unidades tipo plataforma es requisito indispensable salir del almacén con <b>por lo menos el 50% de las estibas amarradas</b>, y con la carga tapada.</td>
                    </tr>
                    <tr>
                        <td className="align-top">2. No ingresar bebidas alcohólicas o bajo la influencia de estas mismas.</td>
                    </tr>
                    <tr>
                        <td className="align-top">3. La velocidad permitida en las instalaciones es de <b>20km/h.</b></td>
                        <td className="align-top">11. Las unidades deberán estar en condiciones adecuadas para la carga.</td>
                    </tr>
                    <tr>
                        <td className="align-top">4. La velocidad máxima permitida en los patios de maniobras, y dentro de los almacenes de es <b>10 km/h.</b></td>
                        <td className="align-top">12. Los supervisores de carga no son responsables por la pérdida del turno de carga.</td>
                    </tr>
                    <tr>
                        <td className="align-top">5. Para el caso de las unidades tipo “caja seca” el operador deberá corroborar cuando finalice su carga que este correctamente cerrada, para que el operador de bascula proceda a colocar el o los sellos correspondientes.</td>
                        <td className="align-top">13. Por razones de preservación del producto, queda estrictamente prohibido mantener funcionando el aire acondicionado de la unidad durante su estancia en los almacenes.</td>
                    </tr>
                    <tr>
                        <td className="align-top">6. Para el caso de las unidades tipo “Jaula” el operador deberá corroborar que todas las escotillas se encuentren correctamente cerradas, y las lonas se encuentren en optimas condiciones para su uso.</td>
                        <td className="align-top">14. Es responsabilidad del operador estar pendiente durante el proceso de carga. El operador debe comunicar al supervisor en turno cualquier observación referente a su carga, cualquier observación de inconformidad con la carga que se manifieste.</td>
                    </tr>
                    <tr>
                        <td className="align-top">7. Finalizado el proceso de carga, es responsabilidad del operador el aseguramiento de la carga. (amarre, enlonada, etc.)</td>
                        <td className="align-top">15. Queda estrictamente prohibido que operadores graben videos o tomen fotografías de las instalaciones o del proceso de operación de carga.</td>
                    </tr>
                    <tr>
                        <td className="align-top">8. El retiro de lona de la unidad, o enlonada de las unidades son responsabilidad únicamente del operador de la unidad y/o línea transportista.</td>
                        <td className="align-top">16. Finalizado el proceso de carga la unidad deberá permanecer en el patio de maniobras debidamente estacionada hasta que le sea indicado su salida.</td>
                    </tr>
                    <tr>
                        <td className="align-top">9. Queda estrictamente prohibido el acceso a las instalaciones a cualquier persona (polizon) ajena a la carga, dentro de las unidades.</td>
                        <td className="text-center align-middle font-bold h-24">
                            OPERADOR DE UNIDAD<br /><br />
                            ____________________________<br />
                            {order.operator_name}<br />
                            FIRMA DE ENTERADO
                        </td>
                    </tr>
                </table>

            </div>
        </div>
    );
}
