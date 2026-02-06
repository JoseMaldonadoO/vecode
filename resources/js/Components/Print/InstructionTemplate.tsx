import React from 'react';
import { ShipmentOrder } from '@/types';

interface Props {
    order: ShipmentOrder | any; // Allow loose typing for compatibility between views
}

export default function InstructionTemplate({ order }: Props) {

    return (
        <div className="w-full h-full bg-white text-black font-sans box-border text-[11px]" style={{ pageBreakAfter: 'always' }}>
            {/* HEADERS */}
            <div className="border border-green-800 relative">
                {/* Top Row: Logos & Titles */}
                <div className="flex w-full border-b border-green-800 h-24">
                    {/* Left: Proagro Logo Area */}
                    <div className="w-[20%] p-2 flex items-center justify-center border-r border-green-800">
                        <img src="/images/logo_proagro.png" alt="ProAgro" className="h-full object-contain" />
                    </div>

                    {/* Center: Title Area */}
                    <div className="w-[60%] flex flex-col items-center justify-center py-2">
                        <h1 className="text-sm font-bold tracking-wider">PRO-AGROINDUSTRIA, S.A. DE C.V.</h1>
                        <h2 className="text-[10px] font-bold mt-1">ALMACÉN DE PRODUCTO TERMINADO</h2>
                        <h2 className="text-xl font-black mt-2 uppercase">INSTRUCCIÓN DE CARGA</h2>
                        <p className="text-[10px] font-bold mt-1">GLS-AP-FO-001</p>
                    </div>

                    {/* Right: Truck Logo Area (LOG.png) */}
                    <div className="w-[20%] p-2 flex items-center justify-center border-l border-green-800 relative">
                        {/* Try strict path and simplified styling */}
                        <img src="/images/LOG.png" alt="Transport" className="max-h-full max-w-full object-contain" />
                    </div>
                </div>

                {/* Sub-Header Row: Date, Shift, Lote (Blanks as requested) */}
                <div className="flex w-full text-xs font-bold py-1 px-1">
                    <div className="w-1/3 flex items-end">
                        <span className="mr-2">FECHA:</span>
                        <div className="border-b border-black flex-1 text-center font-normal px-2 h-4">
                            {/* BLANK */}
                        </div>
                    </div>
                    <div className="w-1/3 flex items-end px-2">
                        <span className="mr-2">TURNO:</span>
                        <div className="border-b border-black flex-1 text-center font-normal h-4">
                            {/* BLANK */}
                        </div>
                    </div>
                    <div className="w-1/3 flex items-end pl-2">
                        <span className="mr-2">LOTE:</span>
                        <div className="border-b border-black flex-1 text-center font-normal h-4">
                            {/* BLANK */}
                        </div>
                    </div>
                </div>
            </div>

            {/* PRODUCT TABLE SECTION */}
            <div className="mt-2 border border-black border-t-0">
                <table className="w-full text-[10px] border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black py-1 px-2 w-[30%] font-bold text-center">PRODUCTO</th>
                            <th className="border border-black py-1 px-2 w-[20%] font-bold text-center">PRESENTACIÓN</th>
                            <th className="border border-black py-1 px-2 w-[15%] font-bold text-center">TM PROGRAMADAS</th>
                            <th className="border border-black py-1 px-2 w-[15%] font-bold text-center">TM CARGADAS</th>
                            <th className="border border-black py-1 px-2 w-[20%] font-bold text-center bg-green-50">ORDEN DE EMBARQUE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="text-center font-bold text-sm h-14">
                            <td className="border border-black py-2 px-1 uppercase leading-tight">
                                {order.product?.name || order.product_name || "UREA AGRICOLA"}
                            </td>
                            <td className="border border-black py-2 uppercase">
                                {order.presentation || "ENVSADO"}
                                {order.sack_type ? ` - ${order.sack_type}` : ''}
                            </td>
                            <td className="border border-black py-2">{Number(order.programmed_tons).toFixed(3)}</td>
                            <td className="border border-black py-2">{/* Manual fill */}</td>
                            {/* Changed to BLACK text as requested */}
                            <td className="border border-black py-2 text-black font-black text-lg">{order.folio}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* TRANSPORT DETAILS SECTION */}
            <div className="mt-6 flex w-full justify-between items-start">

                {/* LEFT SIDE: PLATES & ECONOMIC */}
                <div className="w-[60%] pr-4 pt-4">

                    <div className="flex w-full justify-between items-end mb-6">
                        {/* TRACTOR (Left) */}
                        <div className="flex items-center">
                            <div className="w-16 text-right pr-2 text-xs font-bold pt-4">PLACAS:</div>
                            <div className="flex flex-col items-center">
                                <div className="text-xs font-bold mb-1 uppercase">TRACTOR</div>
                                <div className="border-2 border-black px-4 py-2 font-black text-3xl text-center min-w-[150px] uppercase bg-white">
                                    {order.tractor_plate || "N/A"}
                                </div>
                            </div>
                        </div>

                        {/* ECONOMICO (Center/Right) */}
                        <div className="flex flex-col items-center px-4 pb-2">
                            <span className="text-[10px] font-bold uppercase mb-1">ECONÓMICO</span>
                            <span className="border-b-2 border-black font-black text-xl px-4">{order.economic_number || "00"}</span>
                        </div>
                    </div>

                    {/* TRAILER ROW (Below) */}
                    <div className="flex items-center">
                        <div className="w-16 text-right pr-2 text-xs font-bold pt-4">PLACAS:</div>
                        <div className="flex flex-col items-center">
                            <div className="text-xs font-bold mb-1 uppercase">REMOLQUE</div>
                            <div className="border-2 border-black px-4 py-2 font-black text-3xl text-center min-w-[150px] uppercase bg-white">
                                {order.trailer_plate || "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: TIMES */}
                <div className="w-[40%] flex flex-col items-end pt-2 pr-4">
                    <div className="border-2 border-black h-12 w-48 mb-8 relative">
                        <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-100 px-2 text-[11px] font-bold border-2 border-black h-5 flex items-center leading-none whitespace-nowrap">
                            HORA DE INICIO:
                        </span>
                    </div>

                    <div className="border-2 border-black h-12 w-48 relative">
                        <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-100 px-2 text-[11px] font-bold border-2 border-black h-5 flex items-center leading-none whitespace-nowrap">
                            HORA FINAL
                        </span>
                    </div>
                </div>
            </div>

            <div className="border-b-4 border-black my-8 w-full opacity-0"></div>

            {/* INFO BOXES - RESTRUCTURED */}
            <div className="flex w-full mt-8 gap-4 items-stretch">
                {/* LEFT BOX: CLIENT/TRANSPORT info */}
                <div className="w-1/2 border-2 border-black p-3 text-xs flex flex-col justify-center">
                    <div className="flex mb-3 items-baseline">
                        <span className="font-bold w-24">CLIENTE:</span>
                        <span className="font-bold uppercase flex-1 border-b-2 border-gray-300">
                            {order.client_name || order.client?.business_name}
                        </span>
                    </div>
                    <div className="flex mb-3 items-baseline">
                        <span className="font-bold w-24">TRANSPORT:</span>
                        <span className="uppercase flex-1 border-b-2 border-gray-300">
                            {order.transport_company || order.transporter?.name}
                        </span>
                    </div>
                    <div className="flex items-baseline">
                        <span className="font-bold w-24">OPERADOR:</span>
                        <span className="uppercase flex-1 border-b-2 border-gray-300">
                            {order.operator_name}
                        </span>
                    </div>
                </div>

                {/* RIGHT BOX: WAREHOUSE (Thicker borders) */}
                <div className="w-1/2 border-2 border-black text-xs flex flex-col">
                    <div className="flex border-b-2 border-black h-12">
                        <div className="w-1/2 bg-gray-200 font-bold flex items-center justify-center border-r-2 border-black p-2 text-center">
                            ALMACÉN #
                        </div>
                        <div className="w-1/2 p-2 relative">
                            {/* Blank */}
                        </div>
                    </div>
                    <div className="flex-1 p-2 flex items-center pt-4">
                        <span className="font-bold mr-2 whitespace-nowrap">LÍNEA DE ENVASADO # GLS-APT-</span>
                        <div className="border-b-2 border-black flex-1"></div>
                    </div>
                </div>
            </div>

            {/* SIGNATURES SECTION */}
            <div className="mt-28 flex justify-between px-16 text-[10px] font-bold text-center uppercase">
                <div className="w-5/12">
                    <div className="border-t border-black pt-2">
                        SUPERVISIÓN DE PRO-AGROINDUSTRIA
                    </div>
                </div>
                <div className="w-5/12">
                    <div className="border-t border-black pt-2">
                        PRESTADOR DEL SERVICIO
                    </div>
                </div>
            </div>
        </div>
    );
}
