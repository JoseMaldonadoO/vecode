import React from 'react';

interface Props {
    order: any;
}

export default function WeightVerificationTemplate({ order }: Props) {
    // Generate 40 rows for the table
    const rows = Array.from({ length: 40 }, (_, i) => i + 1);

    return (
        <div className="w-full h-full bg-white px-4 py-2 font-sans text-xs">
            {/* COMPACT HEADER */}
            <div className="flex w-full border-b-2 border-green-800 h-20 mb-1">
                {/* Left: Proagro Logo Area */}
                <div className="w-[20%] p-1 flex items-center justify-center border-r border-green-800">
                    <img src="/images/logo_proagro.png" alt="ProAgro" className="h-full object-contain" />
                </div>

                {/* Center: Title Area */}
                <div className="w-[60%] flex flex-col items-center justify-center py-1">
                    <h1 className="text-xs font-bold tracking-wider">PRO-AGROINDUSTRIA, S.A. DE C.V.</h1>
                    <h2 className="text-[8px] font-bold mt-0.5">ALMACÉN DE PRODUCTO TERMINADO</h2>
                    <h2 className="text-base font-bold mt-0.5 uppercase">VERIFICACION DE PESO DE SACOS</h2>
                    <p className="text-[8px] font-bold mt-0.5">GLS-AP-FO-003</p>
                </div>

                {/* Right: Truck Logo Area */}
                <div className="w-[20%] p-1 flex items-center justify-center border-l border-green-800">
                    <img src="/images/LOG.png" alt="Transport" className="max-h-full max-w-full object-contain" />
                </div>
            </div>

            {/* HEADER DETAILS - COMPACT */}
            <div className="flex flex-wrap w-full font-bold mb-1 text-[9px] uppercase">
                <div className="w-1/2 flex mb-0.5 items-end">
                    <span className="w-16">PRODUCTO:</span>
                    <span className="border-b border-black flex-1 leading-none">{order.product?.name || "UREA AGRICOLA"}</span>
                </div>
                <div className="w-[30%] flex mb-0.5 items-end justify-end pr-4">
                    <span className="mr-2">O.E.</span>
                    <span className="font-black text-xs leading-none">{order.folio}</span>
                </div>
                <div className="w-[20%] flex mb-0.5 items-end">
                    <span className="mr-2">TURNO</span>
                    <div className="border-b border-black flex-1 h-3"></div>
                </div>

                <div className="w-1/2 flex mb-0.5 items-end">
                    <span className="w-16">TRACTOR</span>
                    <span className="border-b border-black w-24 text-center leading-none">{order.tractor_plate || "N/A"}</span>
                    <span className="w-10 text-right pr-1">REM.</span>
                    <span className="border-b border-black w-24 text-center leading-none">{order.trailer_plate || "N/A"}</span>
                </div>
                <div className="w-1/2 flex mb-0.5 items-end">
                    <span className="mr-2">LINEA DE CARGA:</span>
                    <span className="font-normal">GLS-APT-</span>
                    <div className="border-b border-black w-16 h-3"></div>
                </div>
            </div>

            <div className="flex justify-end mb-1">
                <div className="border border-black p-0.5 w-24">
                    <div className="bg-gray-200 text-center font-bold text-[8px] border-b border-black leading-none">FECHA</div>
                    <div className="text-center font-bold h-4 flex items-center justify-center">
                        {/* Blank for manual entry */}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-start">

                {/* LEFT COLUMN - TABLE (70% width) */}
                <div className="w-[70%]">
                    <table className="w-full border-collapse border border-black text-center text-[8px]">
                        <thead>
                            <tr className="bg-gray-200 leading-3">
                                <th rowSpan={3} className="border border-black w-6">N°</th>
                                <th colSpan={6} className="border border-black">VERIFICACIÓN DE PESO DE SACOS</th>
                            </tr>
                            <tr className="bg-green-100 leading-3">
                                <th colSpan={2} className="border border-black">LIMITE INFERIOR</th>
                                <th colSpan={2} className="border border-black">LIMITE DE CONTROL</th>
                                <th colSpan={2} className="border border-black">LIMITE SUPERIOR</th>
                            </tr>
                            <tr className="bg-gray-200 leading-3">
                                <th colSpan={2} className="border border-black">LIC</th>
                                <th colSpan={2} className="border border-black">LC</th>
                                <th colSpan={2} className="border border-black">LSC</th>
                            </tr>
                            <tr className="leading-3">
                                <th className="border border-black bg-white"></th>
                                <th colSpan={2} className="border border-black font-bold">24.900</th>
                                <th colSpan={2} className="border border-black font-bold">25.080</th>
                                <th colSpan={2} className="border border-black font-bold">25.250</th>
                            </tr>
                            <tr className="font-bold bg-gray-100 leading-3">
                                <th className="border border-black"></th>
                                <th className="border border-black w-[15%]">ENSC.01</th>
                                <th className="border border-black w-[15%]">ENSC.02</th>
                                <th className="border border-black w-[15%]">ENSC.01</th>
                                <th className="border border-black w-[15%]">ENSC.02</th>
                                <th className="border border-black w-[15%]">ENSC.01</th>
                                <th className="border border-black w-[15%]">ENSC.02</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row} className="h-3"> {/* Hyper compact rows */}
                                    <td className="border border-black font-bold bg-gray-50 leading-none">{row}</td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                </tr>
                            ))}
                            {/* TOTALS ROW */}
                            <tr className="h-4 bg-green-100 leading-none">
                                <td className="border border-black font-bold text-sm">∑=</td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                            </tr>
                            <tr className="h-4 bg-gray-200 leading-none">
                                <td className="border border-black font-bold text-[8px]">∑Total=</td>
                                <td className="border border-black" colSpan={2}></td>
                                <td className="border border-black" colSpan={2}></td>
                                <td className="border border-black" colSpan={2}></td>
                            </tr>
                            <tr className="h-5 leading-none">
                                <td className="border border-black font-bold text-sm">X =</td>
                                <td className="border border-black" colSpan={6}>
                                    <div className="flex justify-center items-center h-full">
                                        <span className="mr-2 uppercase text-[8px]">Ton. Programadas</span>
                                        <span className="font-bold border border-black px-2 bg-white w-20 text-[9px]">{Number(order.programmed_tons).toFixed(3)}</span>
                                    </div>
                                </td>
                            </tr>
                            <tr className="h-4 bg-gray-100 leading-none">
                                <td className="border border-black font-bold text-[8px]">Peso=</td>
                                <td className="border border-black" colSpan={6}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* RIGHT COLUMN - SIGNATURES (25% width) - REMOVED FIXED HEIGHT */}
                <div className="w-[25%] flex flex-col items-center justify-center pt-8 space-y-16">

                    {/* SUPERVISOR */}
                    <div className="w-full text-center">
                        <div className="bg-green-100 border border-black font-bold text-[10px] py-1 uppercase mb-8">SUPERVISOR</div>
                        <div className="border-t border-black pt-1 w-full mx-auto text-[9px]">NOMBRE Y FIRMA</div>
                    </div>

                    {/* VERIFICADOR */}
                    <div className="w-full text-center">
                        <div className="bg-green-100 border border-black font-bold text-[10px] py-1 uppercase mb-8">VERIFICADOR</div>
                        <div className="border-t border-black pt-1 w-full mx-auto text-[9px]">NOMBRE Y FIRMA</div>
                    </div>

                </div>

            </div>
        </div>
    );
}
