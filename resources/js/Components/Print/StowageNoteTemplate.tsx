import React from 'react';

interface Props {
    order: any;
}

export default function StowageNoteTemplate({ order }: Props) {
    // Landscape layout considerations: Width is much larger (approx 270mm).
    // Scaling content to fill the landscape page.

    const gridCols = Array.from({ length: 24 }, (_, i) => i + 1);
    const gridRows = ['H-1', 'H-2', 'H-3', 'H-4', 'H-5', 'H-6'];

    const weightRegistrationRows = [
        { labels: ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', 'X9', 'X10'] },
        { labels: ['X11', 'X12', 'X13', 'X14', 'X15', 'X16', 'X17', 'X18', 'X19', 'X20'] },
    ];

    return (
        <div className="w-full h-full bg-white p-2 font-sans text-[10px]">
            {/* --- HEADER --- */}
            <div className="flex w-full border-2 border-green-700 h-20 mb-1">
                <div className="w-[15%] flex items-center justify-center p-2 border-r-2 border-green-700">
                    <img src="/images/logo_proagro.png" alt="ProAgro" className="object-contain h-14" />
                </div>
                <div className="w-[70%] flex flex-col items-center justify-center border-r-2 border-green-700">
                    <h1 className="text-xl font-bold">PRO-AGROINDUSTRIA, S.A. DE C.V.</h1>
                    <h2 className="text-lg font-bold">GLS-AP-FO-002</h2>
                    <h2 className="text-xl font-bold">NOTA DE ESTIBA A CAMIÓN</h2>
                </div>
                <div className="w-[15%] flex flex-col h-full text-[8px]">
                    <div className="flex border-b border-green-700 h-1/3">
                        <div className="w-1/2 border-r border-green-700 bg-green-100 flex items-center justify-center font-bold">FECHA</div>
                        <div className="w-1/2 flex items-center justify-center font-bold">{order.date || order.created_at?.split('T')[0]}</div>
                    </div>
                    <div className="flex border-b border-green-700 h-1/3">
                        <div className="w-1/2 border-r border-green-700 bg-green-100 flex items-center justify-center font-bold">TURNO</div>
                        <div className="w-1/2 flex items-center justify-center"></div>
                    </div>
                    <div className="flex h-1/3">
                        <div className="w-1/2 border-r border-green-700 bg-green-100 flex items-center justify-center font-bold">HORA</div>
                        <div className="w-1/2 flex items-center justify-center"></div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 1: DRIVER & TRANSPORT (Wider for Landscape) --- */}
            <div className="flex w-full border-2 border-green-700 mb-1">
                {/* Driver Info - MAPPED TO OPERADOR DE SALIDA */}
                <div className="w-[35%] border-r-2 border-green-700">
                    <div className="bg-green-100 font-bold text-center border-b border-green-700 p-0.5">NOMBRE Y FIRMA DEL CHOFER</div>
                    <div className="h-10 flex items-end justify-center font-bold uppercase p-1 text-sm bg-gray-50">
                        {order.operator_name || order.operator?.name || "SIN ASIGNAR"}
                    </div>
                </div>
                {/* Carrier Data - MAPPED TO LINEA TRANSPORTISTA */}
                <div className="w-[65%]">
                    <div className="bg-green-100 font-bold text-center border-b border-green-700 p-0.5">DATOS DEL TRANSPORTISTA</div>
                    <div className="flex h-10">
                        <div className="w-3/5 border-r border-green-700">
                            <div className="text-[8px] bg-green-50 pl-1 border-b border-green-700">NOMBRE DE LA FLETERA</div>
                            <div className="h-full flex items-center justify-center font-bold uppercase text-xs">
                                {order.transport_company || order.carrier?.name || "N/A"}
                            </div>
                        </div>
                        <div className="w-2/5 flex flex-col">
                            <div className="flex border-b border-green-700 h-1/2">
                                <div className="w-1/2 bg-green-50 text-[8px] pl-1 border-r border-green-700 flex items-center">TIPO DE UNIDAD</div>
                                <div className="w-1/2 flex items-center justify-center pl-1 font-bold">{order.is_full ? 'FULL' : (order.unit_type || 'SENCILLO')}</div>
                            </div>
                            <div className="h-1/2 flex">
                                <div className="w-1/2 bg-green-50 text-[8px] pl-1 border-r border-green-700 flex items-center">PLACAS</div>
                                <div className="w-1/2 flex flex-col justify-center text-[7px] leading-tight pl-1 font-bold">
                                    <div>TRACTO: {order.tractor_plate}</div>
                                    <div>REMOLQUE: {order.trailer_plate}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 2: GENERAL DATA --- */}
            <div className="w-full border-2 border-green-700 mb-1">
                <div className="bg-green-100 font-bold text-center border-b border-green-700 p-0.5">DATOS GENERALES</div>
                <div className="flex h-12">
                    <div className="w-[15%] border-r border-green-700 flex flex-col">
                        <div className="bg-green-50 text-[8px] pl-1 border-b border-green-700 h-4 flex items-center">ORDEN DE VENTA</div>
                        {/* MAPPED TO OV LINKED TO OE */}
                        <div className="flex-1 flex items-center justify-center font-bold text-sm">{order.sales_order?.sale_order || order.sales_order?.folio || "N/A"}</div>
                    </div>
                    <div className="w-[15%] border-r border-green-700 flex flex-col">
                        <div className="bg-green-50 text-[8px] pl-1 border-b border-green-700 h-4 flex items-center">ORDEN DE EMBARQUE</div>
                        <div className="flex-1 flex items-center justify-center font-bold text-lg">{order.folio}</div>
                    </div>
                    <div className="w-[45%] border-r border-green-700 flex flex-col">
                        <div className="bg-green-100 text-center text-[8px] border-b border-green-700 h-4 flex items-center justify-center">DESTINATARIO</div>
                        <div className="flex flex-1">
                            <div className="w-2/3 border-r border-green-700 flex flex-col">
                                <div className="text-[7px] text-center bg-green-50 border-b border-green-700">NOMBRE</div>
                                {/* MAPPED TO CLIENT BUSINESS NAME */}
                                <div className="h-full flex items-center justify-center text-center font-bold p-1 uppercase leading-none text-xs">
                                    {order.client?.business_name || order.client?.name}
                                </div>
                            </div>
                            <div className="w-1/3 flex flex-col">
                                <div className="text-[7px] text-center bg-green-50 border-b border-green-700">DESTINO</div>
                                <div className="h-full flex items-center justify-center text-center font-bold p-1 uppercase leading-none text-[9px]">
                                    {order.destination || order.state}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-[25%] flex flex-col justify-end p-1 items-center">
                        <div className="bg-green-100 border border-green-700 text-center w-full mb-3 text-[9px]">SUPERVISOR</div>
                        <div className="w-full border-b border-black h-2"></div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 3: THE GRID (E-) --- */}
            <div className="flex w-full mb-1">
                <div className="w-full">
                    <div className="flex justify-center font-bold text-lg mb-1">E-</div>
                    <table className="w-full border-collapse border border-black text-center text-[8px]">
                        <thead>
                            <tr className="h-4">
                                <th className="border border-black w-8 bg-green-50"></th>
                                {gridCols.map(col => (
                                    <th key={col} className="border border-black bg-gray-100">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {gridRows.map(rowLabel => (
                                <tr key={rowLabel} className="h-5">
                                    <td className="border border-black bg-gray-100 font-bold">{rowLabel}</td>
                                    {gridCols.map(col => (
                                        <td key={`${rowLabel}-${col}`} className="border border-black"></td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end -mt-8 mb-4 relative z-10 pointer-events-none">
                {/* Floating Box visual */}
                <div className="border-2 border-black bg-white rounded-lg w-40 h-16 mr-8"></div>
            </div>


            {/* --- SECTION 4: PRODUCT DATA --- */}
            <table className="w-full border-collapse border-2 border-green-700 text-[10px] mb-1">
                <thead>
                    <tr className="bg-green-100 text-center font-bold h-6">
                        <th className="border border-green-700 w-[10%]">CODIGO</th>
                        <th className="border border-green-700 w-[30%]">PRODUCTO</th>
                        <th className="border border-green-700 w-[10%]">NO. DE ALMACEN</th>
                        <th className="border border-green-700 w-[10%]">TOTAL SACOS</th>
                        <th className="border border-green-700 w-[10%]">AJUSTE</th>
                        <th className="border border-green-700 w-[30%]">JUSTIFICAR</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="h-8 text-center font-bold">
                        <td className="border border-green-700">{order.product?.code || "1073"}</td>
                        <td className="border border-green-700 text-lg">{order.product?.name || "UREA AGRICOLA"}</td>
                        <td className="border border-green-700"></td>
                        <td className="border border-green-700 text-lg">{order.sacks_count || "N/A"}</td>
                        <td className="border border-green-700"></td>
                        <td className="border border-green-700"></td>
                    </tr>
                    {['LINEA 1', 'LINEA 2', 'LINEA 3', 'LINEA 4'].map((line, idx) => (
                        <tr key={idx} className="h-5">
                            <td className="border border-green-700 bg-gray-100 font-bold text-center text-[9px]">{idx === 0 ? 'NO. DE LOTE' : idx === 1 ? 'VERIFICADOR' : ''}</td>
                            <td className="border border-green-700 text-center font-bold">{line}</td>
                            <td className="border border-green-700" colSpan={4}></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* --- SECTION 5: FOOTER (Quality & Weights - Landscape Layout) --- */}
            <div className="flex w-full border-2 border-green-700">
                {/* Left: Quality Statement (25%) */}
                <div className="w-[25%] text-[8px] p-2 border-r-2 border-green-700 flex flex-col">
                    <div className="bg-green-100 font-bold text-center border border-green-700 mb-2 p-1">CALIDAD DE PRODUCTO Y CANTIDAD DE SACOS CARGADOS</div>
                    <p className="text-justify mb-4">
                        Confirmo que el número de sacos cargados corresponden a la cantidad establecida en este plan de estiba.
                    </p>
                    <div className="text-center mt-auto mb-4">
                        <div className="border-b border-black w-4/5 mx-auto mb-1 font-bold text-[9px] uppercase">
                            {/* Driver Signature Name */}
                            {order.operator_name || order.operator?.name || "SIN ASIGNAR"}
                        </div>
                        <div>Nombre y firma del chofer</div>
                    </div>
                    <div className="bg-green-100 font-bold text-center border border-green-700 p-0.5">COMENTARIOS</div>
                    <div className="h-8 border border-green-700 mt-1"></div>
                </div>

                {/* Right: Weights (75%) */}
                <div className="w-[75%]">
                    <div className="bg-green-200 text-center font-bold border-b border-green-700 p-1 text-[10px]">
                        Registro de pesos en caso de revision de peso de sacos (Muestreo del embarque) kg
                    </div>
                    <div className="flex h-full">
                        {/* Weight Grid */}
                        <div className="w-[70%] border-r border-green-700">
                            <table className="w-full border-collapse border border-green-700 text-center text-[10px]">
                                <tbody>
                                    {weightRegistrationRows.map((row, idx) => (
                                        <React.Fragment key={idx}>
                                            <tr className="bg-green-50 font-bold h-5">
                                                {row.labels.map(label => (
                                                    <td key={label} className="border border-green-700 w-[10%]">{label}</td>
                                                ))}
                                            </tr>
                                            <tr className="h-8">
                                                {row.labels.map(label => (
                                                    <td key={`val-${label}`} className="border border-green-700"></td>
                                                ))}
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                            <div className="bg-green-200 text-[9px] p-2 text-center font-bold h-full flex items-center justify-center">
                                NOTA: CUALQUIER RECLAMACIÓN SOBRE FALTANTES, DEBERÁ ACOMPAÑARSE DE ESTA NOTA DE ESTIBA INDICANDO EL LUGAR EXACTO DEL FALTANTE.
                            </div>
                        </div>

                        {/* Validation Summary - Adjusted for Landscape width */}
                        <div className="w-[30%] bg-white">
                            <div className="bg-green-100 text-center text-[8px] font-bold border-b border-green-700 p-1">VALIDACIÓN DE PESO DE SACOS KG</div>
                            <div className="flex border-b border-green-700 h-10">
                                <div className="w-1/2 bg-gray-100 flex items-center justify-center font-bold text-[9px] border-r border-green-700">SUMA</div>
                                <div className="w-1/2"></div>
                            </div>
                            <div className="flex border-b border-green-700 h-10">
                                <div className="w-1/2 bg-gray-100 flex items-center justify-center font-bold text-[9px] border-r border-green-700">PESO PROMEDIO</div>
                                <div className="w-1/2"></div>
                            </div>
                            <div className="flex h-14">
                                <div className="w-1/2 bg-gray-100 flex items-center justify-center text-center font-bold text-[9px] border-r border-green-700 leading-tight p-1">LIMITES DE CONTROL</div>
                                <div className="w-1/2 flex items-center justify-center font-bold text-lg">0-0</div>
                            </div>
                            <div className="bg-green-200 text-center text-[9px] font-bold border-t border-green-700 p-1 h-full flex items-center justify-center">IM EMBARQUE ESTIMADO</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
