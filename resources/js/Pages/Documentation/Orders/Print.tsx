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
    consigned_to?: string; // Corrected field name
    transport_company?: string; // Linea transportista
    carta_porte?: string;
    operator_name?: string;
    unit_number?: string; // Marca/Modelo
    license_number?: string;
    tractor_plate?: string;
    economic_number?: string;
    unit_type?: string;
    trailer_plate?: string;
    destination?: string;
    state?: string; // New State field
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
    qrCode?: string;
}

export default function Print({ order }: Props) {
    useEffect(() => {
        setTimeout(() => {
            window.print();
        }, 1000);
    }, []);

    const calculateSacks = () => {
        if (order.sacks_count) return order.sacks_count;
        if (!order.programmed_tons || !order.presentation) return "N/A";

        const tons = parseFloat(order.programmed_tons);
        if (isNaN(tons)) return "N/A";

        if (order.presentation.includes("25")) return (tons * 40).toFixed(0);
        if (order.presentation.includes("50")) return (tons * 20).toFixed(0);
        if (order.presentation.includes("200")) return (tons * 5).toFixed(0);
        if (order.presentation.includes("500")) return (tons * 2).toFixed(0);

        return "N/A";
    };

    return (
        <div className="bg-white min-h-screen">
            <Head title={`Imprimir OE - ${order.folio}`} />

            <style>{`
                @media print {
                    @page { size: Letter; margin: 4mm; }
                    body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
                table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 9px; }
                th, td { border: 1px solid black; padding: 2px 4px; }
                .bg-header { background-color: #a0ebac !important; color: black !important; font-weight: bold; text-align: center; }
                .bg-title { background-color: #a0ebac !important; color: black !important; font-weight: bold; text-align: center; font-size: 11px; letter-spacing: 1px; }
                .text-center { text-align: center; }
                .text-bold { font-weight: bold; }
                .no-border { border: none !important; }
                .uppercase { text-transform: uppercase; }
                .text-xs { font-size: 7px; }
                
                /* Policies Section Styles */
                .policies-section table { font-size: 11px; }
                .policies-section .policy-header { font-size: 14px; padding: 4px; }
                .policies-section .policy-title { font-size: 16px; padding: 8px; }
                .policies-section .policy-text { font-size: 11px; padding: 4px; line-height: 1.4; }
            `}</style>

            <div className="max-w-[215mm] mx-auto bg-white p-2">

                {/* --- PAGE 1: SHIPMENT ORDER --- */}
                <div className="page-1">

                    {/* Header Details */}
                    <div className="border border-black mb-1 p-1 text-center">
                        <div className="font-bold text-sm">PROAGROINDUSTRIA S.A. DE C.V.</div>
                        <div className="text-[10px] text-green-700 font-semibold">Carretera Coatzacoalcos-villahermosa Km 5 centro, Coatzacoalcos, Ver. CP. 96400 RFC: PRO140101</div>
                        <div className="text-[10px] text-green-700 font-semibold mb-1">Tel. (921) 689 0382</div>
                        <div className="text-[9px] font-bold italic">GLS-DD-FO-001</div>
                    </div>

                    {/* MAIN TITLE BAR */}
                    <div className="bg-title border border-black py-0.5 mb-1">
                        ORDEN DE EMBARQUE
                    </div>

                    {/* FOLIO ROW */}
                    <table className="mb-1">
                        <tr>
                            <td className="bg-header w-24">FOLIO O.E.</td>
                            <td className="text-center font-bold text-sm w-32">{order.folio}</td>
                            <td className="no-border w-2"></td>
                            <td className="bg-header w-32">ORDEN DE VENTA</td>
                            <td className="text-center font-bold w-32">{order.sales_order?.folio || "N/A"}</td>
                            <td className="no-border w-2"></td>
                            <td className="bg-header w-20">FECHA</td>
                            <td className="text-center font-bold">{order.date || order.created_at.split('T')[0]}</td>
                        </tr>
                    </table>

                    {/* CLIENT SECTION */}
                    <table className="mb-1">
                        <tr>
                            <td className="bg-header w-24 text-left pl-2">CLIENTE :</td>
                            <td className="font-bold pl-2 uppercase">{order.client.business_name}</td>
                            <td rowSpan={4} className="w-24 text-center no-border p-1">
                                <img src="/images/logo_proagro.png" alt="PROAGRO" className="h-10 mx-auto object-contain" />
                            </td>
                        </tr>
                        <tr>
                            <td className="bg-header text-left pl-2">R.F.C.:</td>
                            <td className="font-bold pl-2 uppercase">{order.client.rfc || "N/A"}</td>
                        </tr>
                        <tr>
                            <td className="bg-header text-left pl-2">DIRECCIÓN:</td>
                            <td className="font-bold pl-2 text-[8px] uppercase">{order.client.address || "N/A"}</td>
                        </tr>
                        <tr>
                            <td className="bg-header text-left pl-2">CONSIGNADO:</td>
                            <td className="font-bold pl-2 text-[8px] uppercase flex justify-between items-center border-none p-0">
                                <span>{order.consigned_to || "N/A"}</span>
                                <div className="flex items-center border-l border-black pl-2 h-full">
                                    <span className="bg-header px-1 border border-black mr-1 h-full flex items-center">PEDIDO:</span>
                                    <span className="px-1">{order.sales_order?.sale_order || "N/A"}</span>
                                </div>
                            </td>
                        </tr>
                    </table>

                    {/* TRANSPORTER SECTION */}
                    <div className="bg-header border border-black border-b-0 text-[10px] py-0.5">DEL TRANSPORTISTA</div>
                    <table className="mb-1">
                        <tr>
                            <td className="bg-header w-24 text-left pl-2">TRANSPORTE:</td>
                            <td className="font-bold uppercase text-[9px]">{order.transport_company || "N/A"}</td>
                            <td className="bg-header w-24 text-center">CARTA PORTE:</td>
                            <td className="text-center font-bold text-sm w-32">{order.carta_porte || "N/A"}</td>
                        </tr>
                        <tr>
                            <td className="bg-header text-left pl-2">OPERADOR:</td>
                            <td colSpan={3} className="font-bold uppercase">{order.operator_name || "N/A"}</td>
                        </tr>
                        <tr>
                            <td className="bg-header text-left pl-2">UNIDAD:</td>
                            <td className="font-bold uppercase">{order.unit_number || "N/A"}</td>
                            <td className="bg-header text-center">LICENCIA:</td>
                            <td className="text-center font-bold uppercase">{order.license_number || "N/A"}</td>
                        </tr>
                        <tr>
                            <td colSpan={4} className="p-0 border-0">
                                <table className="w-full border-none">
                                    <tr className="border-none">
                                        <td className="bg-header w-24 border-t-0 border-l-0 border-r text-left pl-2">TRACTOR:</td>
                                        <td className="text-center font-bold border-t-0">{order.tractor_plate || "N/A"}</td>

                                        <td className="bg-header w-24 border-t-0 text-center">ECONÓMICO:</td>
                                        <td className="text-center font-bold border-t-0">{order.economic_number || "N/A"}</td>

                                        <td className="bg-header w-24 border-t-0 text-center">TIPO DE UNIDAD:</td>
                                        <td className="text-center font-bold border-t-0 border-r-0">{order.unit_type || "VOLTEO"}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={4} className="p-0 border-0">
                                <table className="w-full border-none">
                                    <tr className="border-none">
                                        <td className="bg-header w-24 border-t-0 border-l-0 border-r text-left pl-2">REMOLQUE:</td>
                                        <td className="text-center font-bold border-t-0">{order.trailer_plate || "N/A"}</td>

                                        <td className="bg-header w-24 border-t-0 text-center">DESTINO:</td>
                                        <td className="text-center font-bold border-t-0 uppercase">{order.destination || "N/A"}</td>

                                        <td className="bg-header w-24 border-t-0 text-center">ESTADO:</td>
                                        <td className="text-center font-bold border-t-0 border-r-0 uppercase">{order.state || "MX"}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    {/* SHIPMENT SECTION */}
                    <div className="bg-header border border-black border-b-0 text-[10px] py-0.5">DEL EMBARQUE</div>
                    <table className="mb-1">
                        <tr>
                            <td className="bg-header text-center w-24">CÓDIGO</td>
                            <td className="bg-header text-center">DESCRIPCIÓN DEL PRODUCTO</td>
                            <td className="bg-header text-center w-32">TONS. PROGRAMADAS</td>
                        </tr>
                        <tr>
                            <td className="text-center font-bold">{order.product?.code || "1073"}</td>
                            <td className="text-center font-bold uppercase text-lg">{order.product?.name || "UREA AGRICOLA"}</td>
                            <td className="text-center font-bold text-lg">{order.programmed_tons || "0.000"}</td>
                        </tr>
                    </table>

                    <table className="mb-1">
                        <tr>
                            <td className="bg-header text-center w-1/4">PRESENTACIÓN</td>
                            <td className="bg-header text-center w-1/4">NÚMERO DE SACOS</td>
                            <td className="bg-header text-center w-1/4">ORIGEN</td>
                            <td className="bg-header text-center w-1/4">TONS. CARGADAS</td>
                        </tr>
                        <tr>
                            <td className="text-center font-bold uppercase">{order.presentation || "GRANEL"}</td>
                            <td className="text-center font-bold">{calculateSacks()}</td>
                            <td className="text-center font-bold uppercase">{order.origin || "PROAGROINDUSTRIA"}</td>
                            <td className="text-center font-bold"></td>
                        </tr>
                    </table>

                    {/* ALMACEN / ORIGEN CHECKBOXES */}
                    <table className="mb-1">
                        <tr>
                            <td className="text-center font-bold text-[9px] w-1/3">ALMACEN</td>
                            <td className="text-center font-bold text-[9px] w-1/3">ORIGEN DE PRODUCTO</td>
                            <td className="no-border w-1/3"></td>
                        </tr>
                        <tr>
                            <td className="text-center align-middle py-1">
                                <span className="inline-block border border-black w-3 h-3 align-middle mr-1"></span> 1
                                <span className="inline-block border border-black w-3 h-3 align-middle mx-1"></span> 2
                                <span className="inline-block border border-black w-3 h-3 align-middle mx-1"></span> 3
                                <span className="inline-block border border-black w-3 h-3 align-middle mx-1"></span> 4
                                <span className="inline-block border border-black w-3 h-3 align-middle mx-1"></span> 5
                            </td>
                            <td className="text-center align-middle py-1">
                                UREA I <span className="inline-block border border-black w-3 h-3 align-middle mx-1"></span>
                                UREA II <span className="inline-block border border-black w-3 h-3 align-middle mx-1"></span>
                            </td>
                            <td className="no-border">
                                <div className="border-b border-black w-full h-full"></div>
                            </td>
                        </tr>
                    </table>

                    {/* SIGNATURES */}
                    <table className="mb-1 mt-4">
                        <tr>
                            <td className="bg-header text-center w-1/2 py-0.5 rounded-t-lg">DOCUMENTADOR</td>
                            <td className="no-border w-8"></td>
                            <td className="bg-header text-center w-1/2 py-0.5 rounded-t-lg">SUPERVISOR DE EMBARQUE</td>
                        </tr>
                        <tr className="h-16">
                            <td className="align-bottom text-center pb-2">
                                <div className="uppercase text-[9px] font-bold mb-1">{order.documenter_name}</div>
                                <div className="border-t border-black w-3/4 mx-auto text-[8px]">Firma</div>
                            </td>
                            <td className="no-border"></td>
                            <td className="align-bottom text-center pb-2">
                                <div className="border-t border-black w-3/4 mx-auto text-[8px]"></div>
                            </td>
                        </tr>
                    </table>

                    <table className="mb-1">
                        <tr>
                            <td className="bg-header text-center w-1/2 py-0.5 rounded-t-lg">OPERADOR DE BASCULA</td>
                            <td className="no-border w-8"></td>
                            <td className="bg-header text-center w-1/2 py-0.5 rounded-t-lg">OPERADOR DE UNIDAD</td>
                        </tr>
                        <tr className="h-16">
                            <td className="align-bottom text-center pb-2">
                                <div className="uppercase text-[9px] font-bold mb-1">{order.scale_name}</div>
                                <div className="border-t border-black w-3/4 mx-auto text-[8px]">Firma</div>
                            </td>
                            <td className="no-border"></td>
                            <td className="align-bottom text-center pb-2">
                                <div className="uppercase text-[9px] font-bold mb-1">{order.operator_name}</div>
                                <div className="border-t border-black w-3/4 mx-auto text-[8px]">Firma</div>
                            </td>
                        </tr>
                    </table>

                    {/* SECURITY & AUTH */}
                    <div className="flex justify-center my-2">
                        <div className="w-1/3">
                            <div className="bg-header border border-black text-center text-[9px] font-bold py-0.5 rounded-t-lg">Seguridad Física</div>
                            <div className="h-8 border border-black border-t-0 mb-1"></div>
                            <div className="text-center font-bold text-[8px] border-t border-black pt-1">
                                Nombre y firma de quien autoriza la salida
                            </div>
                        </div>
                    </div>

                    {/* TIMES */}
                    <div className="flex justify-between w-full px-4 text-[9px] font-bold mb-2">
                        <div className="flex items-end">
                            <span>Hora inicial de carga:</span>
                            <div className="border-b border-black w-24 mx-2"></div>
                        </div>
                        <div className="flex items-end">
                            <span>Hora final de carga:</span>
                            <div className="border-b border-black w-24 mx-2"></div>
                        </div>
                    </div>

                    {/* OBSERVATIONS */}
                    <table className="mb-1">
                        <tr>
                            <th className="bg-header text-left pl-2 py-0.5">OBSERVACIONES:</th>
                        </tr>
                        <tr className="h-8">
                            <td className="align-top text-[8px] uppercase p-1">{order.observations}</td>
                        </tr>
                    </table>
                </div>

                {/* --- PAGE 2: POLICIES --- */}
                <div style={{ pageBreakBefore: 'always' }} className="policies-section pt-8">
                    {/* POLICIES HEADER */}
                    <table className="mb-4">
                        <tr>
                            <th className="text-center font-bold no-border border-b-2! border-black! pb-2 text-2xl! policy-title">POLÍTICA PARA EL PROCESO DE EMBARQUES</th>
                        </tr>
                        <tr>
                            <td className="no-border p-0 pt-4">
                                <table className="w-full">
                                    <tr>
                                        <td className="w-3/4 border-0 border-b border-r bg-white font-bold pl-4 py-2 text-sm!">
                                            <div className="text-lg">PROAGROINDUSTRIA, S.A. DE C.V.</div>
                                            <div className="font-normal mt-1">Carretera Coatzacoalcos-Villahermosa km 5, Centro.</div>
                                            <div className="font-normal">Coatzacoalcos, Ver., CP 96400</div>
                                            <div className="font-normal">RFC: PRO140101QY9</div>
                                        </td>
                                        <td className="w-1/4 border-0 border-b text-center align-middle" rowSpan={4}>
                                            <img src="/images/logo_proagro.png" alt="PROAGRO" className="h-16 mx-auto object-contain" />
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <th className="text-center font-bold border border-black bg-white text-sm py-1">GLS-TR-FO-013</th>
                        </tr>
                    </table>

                    {/* POLICY DETAILS */}
                    <table className="mb-4">
                        <tr className="h-8">
                            <td className="font-bold border pl-2 w-1/3 bg-gray-50">NOMBRE DEL DEPARTAMENTO</td>
                            <td className="border text-center font-bold w-1/3">LOGÍSTICA Y SUMINISTRO</td>
                            <td className="font-bold border w-1/6 pl-2 bg-gray-50">POLÍTICA N°</td>
                            <td className="border text-center font-bold w-1/6">1</td>
                        </tr>
                        <tr className="h-8">
                            <td className="font-bold border pl-2 bg-gray-50">FECHA DE ENTRADA EN VIGOR:</td>
                            <td className="border text-center">13 DE JUNIO DEL 2023</td>
                            <td className="font-bold border pl-2 bg-gray-50">VERSIÓN N°</td>
                            <td className="border text-center">1</td>
                        </tr>
                        <tr><td colSpan={4} className="text-center font-bold text-blue-800 tracking-widest py-1 no-border text-sm policy-header">ALCANCE</td></tr>
                        <tr><td colSpan={4} className="p-2 text-justify border text-black policy-text">La Presente política es aplicable a los diferentes grupos de interés que forman parte del proceso de los embarques de producto terminado dentro de las instalaciones del Proagroindustria, S.A. de C.V., con especial énfasis en el operador de las líneas transportistas que ingresan a las instalaciones.</td></tr>
                        <tr><td colSpan={4} className="text-center font-bold text-blue-800 tracking-widest py-1 no-border text-sm policy-header">DECLARACIÓN DE LA POLÍTICA</td></tr>
                        <tr><td colSpan={4} className="p-2 text-justify border text-black policy-text">La presente política se realiza como medida para salvaguardar y cumplir con las buenas prácticas de comportamiento, seguridad del personal, protección a instalaciones e infraestructura.</td></tr>
                    </table>

                    <div className="text-center font-bold border-none text-blue-800 text-sm mb-2 tracking-widest mt-4">SECCIÓN DE LAS POLÍTICAS</div>
                    <table className="mb-4 text-xs">
                        <tr>
                            <th className="w-1/2 text-center font-bold py-2 no-border text-sm">ASPECTOS GENERALES</th>
                            <th className="w-1/2 text-center font-bold py-2 no-border text-sm">POLÍTICA DEL ÁREA DE ALMACENES DE PRODUCTO TERMINADO</th>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">1. Portar correctamente el equipo de protección personal.</td>
                            <td className="align-top p-2 border-none policy-text" rowSpan={2}>10. Para el caso de las unidades tipo plataforma es requisito indispensable salir del almacén con <b>por lo menos el 50% de las estibas amarradas</b>, y con la carga tapada.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">2. No ingresar bebidas alcohólicas o bajo la influencia de estas mismas.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">3. La velocidad permitida en las instalaciones es de <b>20km/h.</b></td>
                            <td className="align-top p-2 border-none policy-text">11. Las unidades deberán estar en condiciones adecuadas para la carga.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">4. La velocidad máxima permitida en los patios de maniobras, y dentro de los almacenes de es <b>10 km/h.</b></td>
                            <td className="align-top p-2 border-none policy-text">12. Los supervisores de carga no son responsables por la pérdida del turno de carga.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">5. Para el caso de las unidades tipo “caja seca” el operador deberá corroborar cuando finalice su carga que este correctamente cerrada, para que el operador de bascula proceda a colocar el o los sellos correspondientes.</td>
                            <td className="align-top p-2 border-none policy-text">13. Por razones de preservación del producto, queda estrictamente prohibido mantener funcionando el aire acondicionado de la unidad durante su estancia en los almacenes.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">6. Para el caso de las unidades tipo “Jaula” el operador deberá corroborar que todas las escotillas se encuentren correctamente cerradas, y las lonas se encuentren en optimas condiciones para su uso.</td>
                            <td className="align-top p-2 border-none policy-text">14. Es responsabilidad del operador estar pendiente durante el proceso de carga. El operador debe comunicar al supervisor en turno cualquier observación referente a su carga, cualquier observación de inconformidad con la carga que se manifieste.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">7. Finalizado el proceso de carga, es responsabilidad del operador el aseguramiento de la carga. (amarre, enlonada, etc.)</td>
                            <td className="align-top p-2 border-none policy-text">15. Queda estrictamente prohibido que operadores graben videos o tomen fotografías de las instalaciones o del proceso de operación de carga.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">8. El retiro de lona de la unidad, o enlonada de las unidades son responsabilidad únicamente del operador de la unidad y/o línea transportista.</td>
                            <td className="align-top p-2 border-none policy-text">16. Finalizado el proceso de carga la unidad deberá permanecer en el patio de maniobras debidamente estacionada hasta que le sea indicado su salida.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">9. Queda estrictamente prohibido el acceso a las instalaciones a cualquier persona (polizon) ajena a la carga, dentro de las unidades.</td>
                            <td className="text-center align-middle font-bold h-24 border-none pt-8">
                                <div className="mb-8">OPERADOR DE UNIDAD</div>
                                <div className="border-b border-black w-2/3 mx-auto mb-1"></div>
                                <div className="uppercase">{order.operator_name}</div>
                                <div>FIRMA DE ENTERADO</div>
                            </td>
                        </tr>
                    </table>
                </div>

            </div>
        </div>
    );
}
id: string;
folio: string;
sales_order ?: {
    folio: string;
    sale_order?: string; // Pedido
};
date ?: string;
created_at: string;
client: {
    business_name: string;
    rfc ?: string;
    address ?: string;
};
consignee ?: string;
transport_company ?: string; // Linea transportista
carta_porte ?: string;
operator_name ?: string;
unit_number ?: string;
license_number ?: string;
tractor_plate ?: string;
economic_number ?: string;
unit_type ?: string;
trailer_plate ?: string;
destination ?: string;
product ?: {
    code?: string;
    name: string;
};
presentation ?: string;
sacks_count ?: string;
programmed_tons ?: string;
origin ?: string;
documenter_name ?: string;
scale_name ?: string;
observations ?: string;
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
        <div className="bg-white min-h-screen">
            <Head title={`Imprimir OE - ${order.folio}`} />

            <style>{`
                @media print {
                    @page { size: Letter; margin: 4mm; }
                    body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none; }
                }
                table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 8px; }
                th, td { border: 1px solid black; padding: 1px 3px; }
                .bg-header { background-color: #a0ebac !important; color: black !important; font-weight: bold; text-align: center; font-size: 9px; }
                .bg-light { background-color: #f3f4f6 !important; font-weight: bold; font-size: 8px; }
                .no-border { border: none !important; }
                .text-center { text-align: center; }
                
                /* Specific styles for Policies Page to make it bigger */
                .policies-section table { font-size: 11px; } /* Base font size boost */
                .policies-section .policy-header { font-size: 14px; padding: 4px; }
                .policies-section .policy-title { font-size: 16px; padding: 8px; }
                .policies-section .policy-text { font-size: 11px; padding: 4px; line-height: 1.4; }
                .policies-section td, .policies-section th { padding: 3px 5px; }
            `}</style>

            <div className="max-w-[215mm] mx-auto bg-white p-2">

                {/* PAGE 1: SHIPMENT ORDER (COMPACT) */}
                <div className="page-1">
                    {/* Header Table */}
                    <table className="mb-1">
                        <tr>
                            <td className="no-border w-full text-center">
                                <div className="border border-black p-1 font-bold text-xs bg-white">PROAGROINDUSTRIA S.A. DE C.V.</div>
                                <div className="text-[9px] mt-0.5 font-semibold text-green-700">Carretera Coatzacoalcos-villahermosa Km 5 centro, Coatzacoalcos, Ver. CP. 96400 RFC: PRO140101</div>
                                <div className="text-[9px] font-semibold text-green-700">Tel. (921) 689 0382</div>
                                <div className="text-[9px] font-bold italic mt-0.5">GLS-DD-FO-001</div>
                            </td>
                        </tr>
                    </table>

                    {/* TITLE */}
                    <table className="mb-1">
                        <tr>
                            <th className="bg-header text-sm py-1">ORDEN DE EMBARQUE</th>
                        </tr>
                    </table>

                    {/* FOLIO TABLE */}
                    <table className="mb-1">
                        <tr>
                            <td className="bg-header w-20">FOLIO O.E.</td>
                            <td className="text-center font-bold text-[10px] w-32">{order.folio}</td>
                            <td className="no-border w-2"></td>
                            <td className="bg-header w-24">ORDEN DE VENTA</td>
                            <td className="text-center w-32 font-bold">{order.sales_order?.folio || "N/A"}</td>
                            <td className="no-border w-2"></td>
                            <td className="bg-header w-16">FECHA</td>
                            <td className="text-center font-bold">{order.date || order.created_at.split('T')[0]}</td>
                        </tr>
                    </table>

                    {/* CLIENT DATA */}
                    <table className="mb-1">
                        <tr>
                            <td className="bg-header w-24 text-left pl-2">CLIENTE :</td>
                            <td className="font-bold pl-2">{order.client.business_name}</td>
                            <td rowSpan={4} className="w-32 text-center no-border align-middle pl-2">
                                <img src="/images/logo_proagro.png" alt="PROAGRO" className="h-12 mx-auto object-contain" />
                            </td>
                        </tr>
                        <tr>
                            <td className="bg-header text-left pl-2">R.F.C.:</td>
                            <td className="font-bold pl-2">{order.client.rfc || "N/A"}</td>
                        </tr>
                        <tr>
                            <td className="bg-header text-left pl-2">DIRECCIÓN:</td>
                            <td className="font-bold text-[7px] pl-2 uppercase">{order.client.address || "N/A"}</td>
                        </tr>
                        <tr>
                            <td className="bg-header text-left pl-2">CONSIGNADO:</td>
                            <td className="font-bold text-[7px] pl-2 uppercase flex justify-between items-center border-none">
                                <span>{order.consignee || order.client.business_name}</span>
                                <div className="flex items-center border-l border-black pl-2">
                                    <span className="bg-header px-1 border border-black mr-1">PEDIDO:</span>
                                    <span>{order.sales_order?.sale_order || "N/A"}</span>
                                </div>
                            </td>
                        </tr>
                    </table>

                    {/* TRANSPORTER DATA */}
                    <table className="mb-1">
                        <tr>
                            <th colSpan={4} className="bg-header text-[9px] py-0.5">DEL TRANSPORTISTA</th>
                        </tr>
                        <tr>
                            <td className="bg-header w-20 text-left pl-2">TRANSPORTISTA:</td>
                            <td colSpan={2} className="font-bold uppercase text-[9px] pl-2">{order.transport_company || "N/A"}</td>
                            <td className="p-0 border-0">
                                <table className="w-full h-full border-none">
                                    <tr className="border-none">
                                        <td className="bg-header w-20 border-y-0 border-r-0 text-center">CARTA PORTE:</td>
                                        <td className="text-center font-bold border-y-0 border-r-0">{order.carta_porte || "N/A"}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td className="bg-header text-left pl-2">OPERADOR:</td>
                            <td colSpan={3} className="font-bold uppercase pl-2">{order.operator_name || "N/A"}</td>
                        </tr>
                        <tr>
                            <td className="bg-header text-left pl-2">UNIDAD:</td>
                            <td className="font-bold uppercase pl-2">{order.unit_number || "N/A"}</td>
                            <td className="p-0 border-0" colSpan={2}>
                                <table className="w-full h-full border-none">
                                    <tr className="border-none">
                                        <td className="bg-header w-20 border-y-0 border-l border-black text-center">LICENCIA:</td>
                                        <td className="text-center font-bold border-y-0 border-r-0">{order.license_number || "N/A"}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td className="p-0 border-0" colSpan={4}>
                                <table className="w-full border-none">
                                    <tr className="border-none">
                                        <td className="bg-header w-20 pl-2 text-left border-y-0 border-l-0">TRACTOR:</td>
                                        <td className="text-center font-bold text-[9px] border-y-0">{order.tractor_plate || "N/A"}</td>
                                        <td className="bg-header w-20 text-center border-y-0">ECONÓMICO:</td>
                                        <td className="text-center font-bold text-[9px] border-y-0">{order.economic_number || "N/A"}</td>
                                        <td className="text-center font-bold text-[9px] border-y-0 w-16">{order.unit_number || "UTC-07"}</td>
                                        <td className="bg-header w-24 text-center border-y-0">TIPO DE UNIDAD:</td>
                                        <td className="text-center font-bold text-[9px] border-y-0 border-r-0">{order.unit_type || "VOLTEO"}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td className="p-0 border-0" colSpan={4}>
                                <table className="w-full border-none">
                                    <tr className="border-none">
                                        <td className="bg-header w-20 pl-2 text-left border-y-0 border-l-0">REMOLQUE:</td>
                                        <td className="text-center font-bold text-[9px] border-y-0">{order.trailer_plate || "N/A"}</td>
                                        <td className="bg-header w-16 text-center border-y-0">DESTINO:</td>
                                        <td className="text-center font-bold text-[9px] border-y-0 uppercase">{order.destination || "N/A"}</td>
                                        <td className="bg-header w-16 text-center border-y-0">ESTADO:</td>
                                        <td className="text-center font-bold text-[9px] border-y-0 border-r-0">MX</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    {/* SHIPMENT DATA */}
                    <table className="mb-1">
                        <tr>
                            <th colSpan={3} className="bg-header text-[9px] py-0.5">DEL EMBARQUE</th>
                        </tr>
                        <tr>
                            <td className="bg-header text-center w-24">CÓDIGO</td>
                            <td className="bg-header text-center">DESCRIPCIÓN DEL PRODUCTO</td>
                            <td className="bg-header text-center w-32">TONS. PROGRAMADA</td>
                        </tr>
                        <tr>
                            <td className="text-center font-bold">{order.product?.code || "1073"}</td>
                            <td className="text-center font-bold uppercase">{order.product?.name || "UREA AGRICOLA"}</td>
                            <td className="text-center font-bold">{order.programmed_tons || "0.000"}</td>
                        </tr>
                    </table>

                    <table className="mb-1">
                        <tr>
                            <td className="bg-header text-center w-1/4">PRESENTACIÓN</td>
                            <td className="bg-header text-center w-1/4">NÚMERO DE SACOS</td>
                            <td className="bg-header text-center w-1/4">ORIGEN</td>
                            <td className="bg-header text-center w-1/4">TONS. CARGADAS</td>
                        </tr>
                        <tr>
                            <td className="text-center font-bold uppercase">{order.presentation || "GRANEL"}</td>
                            <td className="text-center font-bold">{calculateSacks()}</td>
                            <td className="text-center font-bold uppercase">{order.origin || "PROAGROINDUSTRIA"}</td>
                            <td className="text-center"></td>
                        </tr>
                    </table>

                    {/* OPTIONS */}
                    <table className="mb-1">
                        <tr>
                            <td className="text-center font-bold w-1/3 text-[9px]">ALMACEN</td>
                            <td className="text-center font-bold w-1/3 text-[9px]">ORIGEN DE PRODUCTO</td>
                            <td className="no-border w-1/3"></td>
                        </tr>
                        <tr>
                            <td className="text-center align-middle py-1">
                                <span className="inline-block border border-black w-3 h-3 align-middle mr-1"></span> 1
                                <span className="inline-block border border-black w-3 h-3 align-middle mx-1"></span> 2
                                <span className="inline-block border border-black w-3 h-3 align-middle mx-1"></span> 3
                                <span className="inline-block border border-black w-3 h-3 align-middle mx-1"></span> 4
                                <span className="inline-block border border-black w-3 h-3 align-middle mx-1"></span> 5
                            </td>
                            <td className="text-center align-middle py-1">
                                UREA I <span className="inline-block border border-black w-3 h-3 align-middle mx-1"></span>
                                UREA II <span className="inline-block border border-black w-3 h-3 align-middle mx-1"></span>
                            </td>
                            <td className="p-0 border-0">
                                <table className="w-full border-none">
                                    <tr className="border-none">
                                        <td className="text-center text-[9px] border-b border-black w-full"></td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    {/* SIGNATURES */}
                    <table className="mb-1">
                        <tr>
                            <td className="bg-header text-center w-1/2 py-0.5 rounded-t-lg">DOCUMENTADOR</td>
                            <td className="no-border w-4"></td>
                            <td className="bg-header text-center w-1/2 py-0.5 rounded-t-lg">SUPERVISOR DE EMBARQUE</td>
                        </tr>
                        <tr className="h-12">
                            <td className="align-bottom text-center pb-1">
                                <div className="uppercase text-[9px] font-bold mb-1">{order.documenter_name}</div>
                                <div className="border-t border-black w-2/3 mx-auto text-[7px]">Firma</div>
                            </td>
                            <td className="no-border"></td>
                            <td className="align-bottom text-center pb-1">
                                <div className="border-t border-black w-2/3 mx-auto text-[7px]"></div>
                            </td>
                        </tr>
                    </table>

                    <table className="mb-1">
                        <tr>
                            <td className="bg-header text-center w-1/2 py-0.5 rounded-t-lg">OPERADOR DE BASCULA</td>
                            <td className="no-border w-4"></td>
                            <td className="bg-header text-center w-1/2 py-0.5 rounded-t-lg">OPERADOR DE UNIDAD</td>
                        </tr>
                        <tr className="h-12">
                            <td className="align-bottom text-center pb-1">
                                <div className="uppercase text-[9px] font-bold mb-1">{order.scale_name}</div>
                                <div className="border-t border-black w-2/3 mx-auto text-[7px]">Firma</div>
                            </td>
                            <td className="no-border"></td>
                            <td className="align-bottom text-center pb-1">
                                <div className="uppercase text-[9px] font-bold mb-1">{order.operator_name}</div>
                                <div className="border-t border-black w-2/3 mx-auto text-[7px]">Firma</div>
                            </td>
                        </tr>
                    </table>

                    <table className="mb-1">
                        <tr className="no-border">
                            <td className="no-border w-1/3"></td>
                            <td className="bg-header text-center w-1/3 py-0.5 rounded-t-lg border border-black">Seguridad Física</td>
                            <td className="no-border w-1/3"></td>
                        </tr>
                        <tr className="no-border">
                            <td className="no-border"></td>
                            <td className="h-8 border border-black no-border-t"></td>
                            <td className="no-border"></td>
                        </tr>
                    </table>

                    <div className="text-center w-2/3 mx-auto border-t border-black text-[9px] pt-1 mb-2">
                        Nombre y firma de quien autoriza la salida
                    </div>

                    {/* TIMES */}
                    <table className="mb-1 no-border font-medium text-[9px]">
                        <tr className="no-border">
                            <td className="no-border text-right w-1/3">Hora inicial de carga:</td>
                            <td className="no-border text-left pl-1 border-b border-black w-1/6"></td>
                            <td className="no-border w-8"></td>
                            <td className="no-border text-right w-1/6">Hora final de carga:</td>
                            <td className="no-border text-left pl-1 border-b border-black w-1/4"></td>
                        </tr>
                    </table>

                    <table className="mb-1">
                        <tr>
                            <th className="bg-header text-left pl-2 py-0.5" style={{ backgroundColor: "#a0ebac" }}>OBSERVACIONES:</th>
                        </tr>
                        <tr className="h-6">
                            <td className="align-top text-[8px] uppercase p-1">{order.observations}</td>
                        </tr>
                    </table>
                </div>


                {/* PAGE 2: POLICIES (FULL PAGE EXPANSION) */}
                <div style={{ pageBreakBefore: 'always' }} className="policies-section">

                    {/* POLICIES HEADER */}
                    <table className="mb-4">
                        <tr>
                            <th className="text-center font-bold no-border border-b-2! border-black! pb-2 text-2xl! policy-title">POLÍTICA PARA EL PROCESO DE EMBARQUES</th>
                        </tr>
                        <tr>
                            <td className="no-border p-0 pt-4">
                                <table className="w-full">
                                    <tr>
                                        <td className="w-3/4 border-0 border-b border-r bg-white font-bold pl-4 py-2 text-sm!">
                                            <div className="text-lg">PROAGROINDUSTRIA, S.A. DE C.V.</div>
                                            <div className="font-normal mt-1">Carretera Coatzacoalcos-Villahermosa km 5, Centro.</div>
                                            <div className="font-normal">Coatzacoalcos, Ver., CP 96400</div>
                                            <div className="font-normal">RFC: PRO140101QY9</div>
                                        </td>
                                        <td className="w-1/4 border-0 border-b text-center align-middle" rowSpan={4}>
                                            <img src="/images/logo_proagro.png" alt="PROAGRO" className="h-16 mx-auto object-contain" />
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <th className="text-center font-bold border border-black bg-white text-sm py-1">GLS-TR-FO-013</th>
                        </tr>
                    </table>

                    {/* POLICY DETAILS */}
                    <table className="mb-4">
                        <tr className="h-8">
                            <td className="font-bold border pl-2 w-1/3 bg-gray-50">NOMBRE DEL DEPARTAMENTO</td>
                            <td className="border text-center font-bold w-1/3">LOGÍSTICA Y SUMINISTRO</td>
                            <td className="font-bold border w-1/6 pl-2 bg-gray-50">POLÍTICA N°</td>
                            <td className="border text-center font-bold w-1/6">1</td>
                        </tr>
                        <tr className="h-8">
                            <td className="font-bold border pl-2 bg-gray-50">FECHA DE ENTRADA EN VIGOR:</td>
                            <td className="border text-center">13 DE JUNIO DEL 2023</td>
                            <td className="font-bold border pl-2 bg-gray-50">VERSIÓN N°</td>
                            <td className="border text-center">1</td>
                        </tr>
                        <tr><td colSpan={4} className="text-center font-bold text-blue-800 tracking-widest py-1 no-border text-sm policy-header">ALCANCE</td></tr>
                        <tr><td colSpan={4} className="p-2 text-justify border text-black policy-text">La Presente política es aplicable a los diferentes grupos de interés que forman parte del proceso de los embarques de producto terminado dentro de las instalaciones del Proagroindustria, S.A. de C.V., con especial énfasis en el operador de las líneas transportistas que ingresan a las instalaciones.</td></tr>
                        <tr><td colSpan={4} className="text-center font-bold text-blue-800 tracking-widest py-1 no-border text-sm policy-header">DECLARACIÓN DE LA POLÍTICA</td></tr>
                        <tr><td colSpan={4} className="p-2 text-justify border text-black policy-text">La presente política se realiza como medida para salvaguardar y cumplir con las buenas prácticas de comportamiento, seguridad del personal, protección a instalaciones e infraestructura.</td></tr>
                    </table>

                    <div className="text-center font-bold border-none text-blue-800 text-sm mb-2 tracking-widest mt-4">SECCIÓN DE LAS POLÍTICAS</div>
                    <table className="mb-4 text-xs">
                        <tr>
                            <th className="w-1/2 text-center font-bold py-2 no-border text-sm">ASPECTOS GENERALES</th>
                            <th className="w-1/2 text-center font-bold py-2 no-border text-sm">POLÍTICA DEL ÁREA DE ALMACENES DE PRODUCTO TERMINADO</th>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">1. Portar correctamente el equipo de protección personal.</td>
                            <td className="align-top p-2 border-none policy-text" rowSpan={2}>10. Para el caso de las unidades tipo plataforma es requisito indispensable salir del almacén con <b>por lo menos el 50% de las estibas amarradas</b>, y con la carga tapada.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">2. No ingresar bebidas alcohólicas o bajo la influencia de estas mismas.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">3. La velocidad permitida en las instalaciones es de <b>20km/h.</b></td>
                            <td className="align-top p-2 border-none policy-text">11. Las unidades deberán estar en condiciones adecuadas para la carga.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">4. La velocidad máxima permitida en los patios de maniobras, y dentro de los almacenes de es <b>10 km/h.</b></td>
                            <td className="align-top p-2 border-none policy-text">12. Los supervisores de carga no son responsables por la pérdida del turno de carga.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">5. Para el caso de las unidades tipo “caja seca” el operador deberá corroborar cuando finalice su carga que este correctamente cerrada, para que el operador de bascula proceda a colocar el o los sellos correspondientes.</td>
                            <td className="align-top p-2 border-none policy-text">13. Por razones de preservación del producto, queda estrictamente prohibido mantener funcionando el aire acondicionado de la unidad durante su estancia en los almacenes.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">6. Para el caso de las unidades tipo “Jaula” el operador deberá corroborar que todas las escotillas se encuentren correctamente cerradas, y las lonas se encuentren en optimas condiciones para su uso.</td>
                            <td className="align-top p-2 border-none policy-text">14. Es responsabilidad del operador estar pendiente durante el proceso de carga. El operador debe comunicar al supervisor en turno cualquier observación referente a su carga, cualquier observación de inconformidad con la carga que se manifieste.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">7. Finalizado el proceso de carga, es responsabilidad del operador el aseguramiento de la carga. (amarre, enlonada, etc.)</td>
                            <td className="align-top p-2 border-none policy-text">15. Queda estrictamente prohibido que operadores graben videos o tomen fotografías de las instalaciones o del proceso de operación de carga.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">8. El retiro de lona de la unidad, o enlonada de las unidades son responsabilidad únicamente del operador de la unidad y/o línea transportista.</td>
                            <td className="align-top p-2 border-none policy-text">16. Finalizado el proceso de carga la unidad deberá permanecer en el patio de maniobras debidamente estacionada hasta que le sea indicado su salida.</td>
                        </tr>
                        <tr>
                            <td className="align-top p-2 border-none policy-text">9. Queda estrictamente prohibido el acceso a las instalaciones a cualquier persona (polizon) ajena a la carga, dentro de las unidades.</td>
                            <td className="text-center align-middle font-bold h-24 border-none pt-8">
                                <div className="mb-8">OPERADOR DE UNIDAD</div>
                                <div className="border-b border-black w-2/3 mx-auto mb-1"></div>
                                <div className="uppercase">{order.operator_name}</div>
                                <div>FIRMA DE ENTERADO</div>
                            </td>
                        </tr>
                    </table>
                </div>

            </div>
        </div>
    );
}
