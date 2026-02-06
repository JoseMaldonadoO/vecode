import React from 'react';

interface Props {
    order: any;
}

export default function WeightVerificationTemplate({ order }: Props) {
    // Generate 40 rows for the table
    const rows = Array.from({ length: 40 }, (_, i) => i + 1);

    return (
        <div className="w-full h-full bg-white p-4 font-sans text-xs">
            {/* MATCHING HEADER STYLE FROM INSTRUCTION TEMPLATE */}
            <div className="flex w-full border-b-2 border-green-800 h-24 mb-2">
                {/* Left: Proagro Logo Area */}
                <div className="w-[20%] p-2 flex items-center justify-center border-r border-green-800">
                    <img src="/images/logo_proagro.png" alt="ProAgro" className="h-full object-contain" />
                </div>

                {/* Center: Title Area */}
                <div className="w-[60%] flex flex-col items-center justify-center py-2">
                    <h1 className="text-sm font-bold tracking-wider">PRO-AGROINDUSTRIA, S.A. DE C.V.</h1>
                    <h2 className="text-[10px] font-bold mt-1">ALMACÉN DE PRODUCTO TERMINADO</h2>
                    <h2 className="text-lg font-bold mt-1 uppercase">VERIFICACION DE PESO DE SACOS</h2>
                    <p className="text-[10px] font-bold mt-1">GLS-AP-FO-003</p>
                </div>

                {/* Right: Truck Logo Area */}
                <div className="w-[20%] p-2 flex items-center justify-center border-l border-green-800">
                    <img src="/images/LOG.png" alt="Transport" className="max-h-full max-w-full object-contain" />
                </div>
            </div>

            {/* HEADER DETAILS */}
            <div className="flex flex-wrap w-full font-bold mb-2 text-[10px] uppercase">
                <div className="w-1/2 flex mb-1">
                    <span className="w-20">PRODUCTO:</span>
                    <span className="border-b border-black flex-1">{order.product?.name || "UREA AGRICOLA"}</span>
                </div>
                <div className="w-[30%] flex mb-1 justify-end pr-4">
                    <span className="mr-2">O.E.</span>
                    <span className="font-black text-sm">{order.folio}</span>
                </div>
                <div className="w-[20%] flex mb-1">
                    <span className="mr-2">TURNO</span>
                    <div className="border-b border-black flex-1"></div>
                </div>

                <div className="w-1/2 flex mb-1">
                    <span className="w-20">TRACTOR</span>
                    <span className="border-b border-black w-24 text-center">{order.tractor_plate || "N/A"}</span>
                    <span className="w-10 text-right pr-1">REM.</span>
                    <span className="border-b border-black w-24 text-center">{order.trailer_plate || "N/A"}</span>
                </div>
                <div className="w-1/2 flex mb-1">
                    <span className="mr-2">LINEA DE CARGA:</span>
                    <span className="font-normal">GLS-APT-</span>
                    <div className="border-b border-black w-16"></div>
                </div>
            </div>

            <div className="flex justify-end mb-2">
                <div className="border border-black p-1 w-32">
                    <div className="bg-gray-200 text-center font-bold text-[10px] border-b border-black">FECHA</div>
                    <div className="text-center font-bold h-6 flex items-center justify-center">
                        {/* Blank for manual entry */}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-start">

                {/* LEFT COLUMN - TABLE (70% width) */}
                <div className="w-[70%]">
                    <table className="w-full border-collapse border border-black text-center text-[9px]">
                        <thead>
                            <tr className="bg-gray-200">
                                <th rowSpan={3} className="border border-black w-8">N°</th>
                                <th colSpan={6} className="border border-black">VERIFICACIÓN DE PESO DE SACOS</th>
                            </tr>
                            <tr className="bg-green-100">
                                <th colSpan={2} className="border border-black">LIMITE INFERIOR</th>
                                <th colSpan={2} className="border border-black">LIMITE DE CONTROL</th>
                                <th colSpan={2} className="border border-black">LIMITE SUPERIOR</th>
                            </tr>
                            <tr className="bg-gray-200">
                                <th colSpan={2} className="border border-black">LIC</th>
                                <th colSpan={2} className="border border-black">LC</th>
                                <th colSpan={2} className="border border-black">LSC</th>
                            </tr>
                            <tr>
                                <th className="border border-black bg-white"></th>
                                <th colSpan={2} className="border border-black font-bold">24.900</th>
                                <th colSpan={2} className="border border-black font-bold">25.080</th>
                                <th colSpan={2} className="border border-black font-bold">25.250</th>
                            </tr>
                            <tr className="font-bold bg-gray-100">
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
                                <tr key={row} className="h-4">
                                    <td className="border border-black font-bold bg-gray-50">{row}</td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                    <td className="border border-black"></td>
                                </tr>
                            ))}
                            {/* TOTALS ROW */}
                            <tr className="h-6 bg-green-100">
                                <td className="border border-black font-bold text-lg">∑=</td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                                <td className="border border-black"></td>
                            </tr>
                            <tr className="h-6 bg-gray-200">
                                <td className="border border-black font-bold">∑Total=</td>
                                <td className="border border-black" colSpan={2}></td>
                                <td className="border border-black" colSpan={2}></td>
                                <td className="border border-black" colSpan={2}></td>
                            </tr>
                            <tr className="h-6">
                                <td className="border border-black font-bold text-lg">X =</td>
                                <td className="border border-black" colSpan={6}>
                                    <div className="flex justify-center items-center h-full">
                                        <span className="mr-2 uppercase text-[9px]">Ton. Programadas</span>
                                        <span className="font-bold border border-black px-2 bg-white w-24">{Number(order.programmed_tons).toFixed(3)}</span>
                                    </div>
                                </td>
                            </tr>
                            <tr className="h-6 bg-gray-100">
                                <td className="border border-black font-bold">Peso=</td>
                                <td className="border border-black" colSpan={6}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* RIGHT COLUMN - SIGNATURES (25% width) */}
                <div className="w-[25%] flex flex-col items-center justify-between h-[800px] pt-20">

                    {/* SUPERVISOR */}
                    <div className="w-full text-center">
                        <div className="bg-green-100 border border-black font-bold text-xs py-1 uppercase mb-16">SUPERVISOR</div>
                        <div className="border-t border-black pt-1 w-full mx-auto text-xs">NOMBRE Y FIRMA</div>
                    </div>

                    {/* VERIFICADOR */}
                    <div className="w-full text-center">
                        <div className="bg-green-100 border border-black font-bold text-xs py-1 uppercase mb-16">VERIFICADOR</div>
                        <div className="border-t border-black pt-1 w-full mx-auto text-xs">NOMBRE Y FIRMA</div>
                    </div>

                </div>

            </div>
        </div>
    );
}
