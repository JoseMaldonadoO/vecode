import React from 'react';

interface Props {
    order: any;
}

export default function StowageNoteTemplate({ order }: Props) {
    // Strategy Change: Instead of relying on @page landscape (which is breaking into 3 pages),
    // we will render this on a standard page but ROTATE the content 90 degrees.
    // This ensures it fits on one sheet regardless of printer auto-rotation logic.

    // Standard Letter dimensions: 215.9mm x 279.4mm
    // We will creaete a container of 279mm x 215mm and rotate it.

    const gridCols = Array.from({ length: 24 }, (_, i) => i + 1);
    const gridRows = ['H-1', 'H-2', 'H-3', 'H-4', 'H-5', 'H-6'];

    const weightRegistrationRows = [
        { labels: ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', 'X9', 'X10'] },
        { labels: ['X11', 'X12', 'X13', 'X14', 'X15', 'X16', 'X17', 'X18', 'X19', 'X20'] },
    ];

    // Helper classes
    const borderClass = "border border-green-800";
    const headerClass = "bg-green-200 font-bold text-center border border-green-800 text-[9px] uppercase";

    return (
        // Wrapper that simulates a landscape page on a portrait sheet if needed, or just fills the landscape page
        // The rotation logic will be handled in Print.tsx via CSS class .rotate-landscape
        <div className="w-full h-full bg-white font-sans text-[10px] text-black leading-tight p-2 box-border">

            {/* --- HEADER --- */}
            <div className={`flex w-full ${borderClass} border-2 mb-1 h-[12%]`}>
                {/* Logo Section */}
                <div className={`w-[20%] ${borderClass} border-r-2 p-1 flex flex-col items-center justify-center`}>
                    <img src="/images/logo_proagro.png" alt="ProAgro" className="h-10 object-contain mb-1" />
                    <div className="text-[10px] font-bold text-green-800 leading-none text-center">PRO <br /> AGROINDUSTRIA</div>
                </div>

                {/* Title Section */}
                <div className={`w-[60%] ${borderClass} border-r-2 flex flex-col items-center justify-center py-1`}>
                    <h1 className="text-2xl font-bold uppercase">PRO-AGROINDUSTRIA, S.A. DE C.V.</h1>
                    <h2 className="text-xl font-bold uppercase">GLS-AP-FO-002</h2>
                    <h2 className="text-2xl font-bold uppercase">NOTA DE ESTIBA A CAMIÓN</h2>
                </div>

                {/* Meta Data Section */}
                <div className="w-[20%] flex flex-col text-[9px]">
                    <div className={`flex-1 flex ${borderClass} border-b`}>
                        <div className={`w-[40%] bg-green-200 font-bold flex items-center justify-center ${borderClass} border-r`}>FECHA</div>
                        <div className="w-[60%] flex items-center justify-center font-bold px-1"></div>
                    </div>
                    <div className={`flex-1 flex ${borderClass} border-b`}>
                        <div className={`w-[40%] bg-green-200 font-bold flex items-center justify-center ${borderClass} border-r`}>TURNO</div>
                        <div className="w-[60%] flex items-center justify-center px-1"></div>
                    </div>
                    <div className={`flex-1 flex ${borderClass}`}>
                        <div className={`w-[40%] bg-green-200 font-bold flex items-center justify-center ${borderClass} border-r`}>HORA</div>
                        <div className="w-[60%] flex items-center justify-center px-1"></div>
                    </div>
                </div>
            </div>

            {/* --- TRANSPORTISTA SECTION (MATCHING IMAGE 2) --- */}
            <div className={`flex w-full ${borderClass} border-2 mb-1 h-[15%]`}>
                {/* Vertical Label Strip */}
                <div className="w-[3%] bg-green-300 flex items-center justify-center border-r border-green-800">
                    <span className="transform -rotate-90 whitespace-nowrap font-bold text-[10px]">DATOS DEL TRANSPORTISTA</span>
                </div>

                <div className="w-[97%] flex flex-col">
                    {/* Top Row: Fletera | Unidad | Placas */}
                    <div className="flex h-1/2 border-b border-green-800">
                        <div className={`w-[15%] bg-green-100 flex items-center justify-center text-center font-bold text-[8px] ${borderClass} border-r px-1`}>NOMBRE DE LA FLETERA</div>
                        <div className={`w-[45%] flex items-center justify-center font-bold uppercase text-[10px] ${borderClass} border-r`}>
                            {order.transport_company || order.carrier?.name || "N/A"}
                        </div>
                        <div className={`w-[10%] bg-green-100 flex items-center justify-center text-center font-bold text-[8px] ${borderClass} border-r px-1`}>TIPO DE UNIDAD</div>
                        <div className={`w-[10%] flex items-center justify-center font-bold uppercase text-[9px] ${borderClass} border-r`}>
                            {order.is_full ? 'FULL' : (order.unit_type || 'SENCILLO')}
                        </div>
                        <div className={`w-[5%] bg-green-100 flex items-center justify-center text-center font-bold text-[8px] ${borderClass} border-r px-0.5`}>PLACAS</div>
                        <div className={`w-[15%] flex flex-col justify-center px-1 font-bold text-[8px] leading-tight`}>
                            <div>TRACTO: {order.tractor_plate}</div>
                            <div>REMOLQUE: {order.trailer_plate}</div>
                            {order.is_full && <div>REMOLQUE 2: {order.trailer2_plate}</div>}
                        </div>
                    </div>
                    {/* Bottom Row: Chofer */}
                    <div className="flex h-1/2">
                        <div className={`w-[15%] bg-green-100 flex items-center justify-center text-center font-bold text-[8px] ${borderClass} border-r px-1`}>NOMBRE Y FIRMA DEL CHOFER</div>
                        <div className={`w-[85%] flex items-center justify-center font-bold uppercase text-[12px]`}>
                            {order.operator_name || order.operator?.name || "SIN ASIGNAR"}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DATOS GENERALES --- */}
            <div className={`w-full ${borderClass} border-2 mb-1 flex h-[6%]`}>
                <div className="w-[3%] bg-green-300 flex items-center justify-center border-r border-green-800">
                    <span className="transform -rotate-90 whitespace-nowrap font-bold text-[8px]">DATOS GENERALES</span>
                </div>
                <div className="w-[97%] flex">
                    <div className={`w-[15%] ${borderClass} border-r flex flex-col`}>
                        <div className={`bg-green-100 text-[7px] text-center ${borderClass} border-b`}>ORDEN DE VENTA</div>
                        <div className="flex-1 flex items-center justify-center font-bold">{order.sales_order?.sale_order || order.sales_order?.folio || "N/A"}</div>
                    </div>
                    <div className={`w-[15%] ${borderClass} border-r flex flex-col`}>
                        <div className={`bg-green-100 text-[7px] text-center ${borderClass} border-b`}>ORDEN DE EMBARQUE</div>
                        <div className="flex-1 flex items-center justify-center font-bold text-xs">{order.folio}</div>
                    </div>
                    <div className={`w-[30%] ${borderClass} border-r flex flex-col`}>
                        <div className={`bg-green-100 text-[7px] text-center ${borderClass} border-b`}>DESTINATARIO (CLIENTE)</div>
                        <div className="flex-1 flex items-center justify-center font-bold uppercase text-[9px] leading-none px-1 text-center">
                            {order.client?.business_name || order.client?.name}
                        </div>
                    </div>
                    <div className={`w-[20%] ${borderClass} border-r flex flex-col`}>
                        <div className={`bg-green-100 text-[7px] text-center ${borderClass} border-b`}>DESTINO</div>
                        <div className="flex-1 flex items-center justify-center font-bold uppercase text-[8px] leading-none px-1 text-center">
                            {order.destination || order.state}
                        </div>
                    </div>
                    <div className={`w-[20%] flex flex-col`}>
                        <div className={`bg-green-100 text-[7px] text-center ${borderClass} border-b`}>SUPERVISOR</div>
                        <div className="flex-1"></div>
                    </div>
                </div>
            </div>

            {/* --- GRID E- --- */}
            <div className="w-full mb-1 relative">
                <div className="text-center font-bold text-base mb-0.5">E-</div>
                <table className="w-full border-collapse border border-green-800 text-center text-[7px]">
                    <thead>
                        <tr>
                            <th className="border border-green-800 w-5 bg-gray-100"></th>
                            {gridCols.map(col => (
                                <th key={col} className="border border-green-800 bg-gray-100 h-3">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {gridRows.map(rowLabel => (
                            <tr key={rowLabel} className="h-3">
                                <td className="border border-green-800 bg-gray-100 font-bold">{rowLabel}</td>
                                {gridCols.map(col => (
                                    <td key={`${rowLabel}-${col}`} className="border border-green-800"></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Floating Box */}
                <div className="absolute -right-1 top-6 w-20 h-10 border-2 border-black bg-white rounded-lg z-10"></div>
            </div>

            {/* --- PRODUCT TABLE --- */}
            <table className={`w-full border-collapse ${borderClass} border-2 text-[8px] mb-1 leading-none`}>
                <thead>
                    <tr className="bg-green-200 text-center font-bold">
                        <th className={`${borderClass} w-[10%]`}>CODIGO</th>
                        <th className={`${borderClass} w-[30%]`}>PRODUCTO</th>
                        <th className={`${borderClass} w-[15%]`}>NO. DE ALMACEN</th>
                        <th className={`${borderClass} w-[10%]`}>TOTAL SACOS</th>
                        <th className={`${borderClass} w-[10%]`}>AJUSTE</th>
                        <th className={`${borderClass} w-[25%]`}>JUSTIFICAR</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="h-5 font-bold text-center">
                        <td className={borderClass}>{order.product?.code || "1073"}</td>
                        <td className={`${borderClass} uppercase text-[9px]`}>{order.product?.name || "UREA AGRICOLA"}</td>
                        <td className={borderClass}></td>
                        <td className={borderClass}>{order.sacks_count || "N/A"} <span className="text-[6px]">KG</span></td>
                        <td className={borderClass}></td>
                        <td className={borderClass}></td>
                    </tr>
                    {['LINEA 1', 'LINEA 2', 'LINEA 3', 'LINEA 4'].map((line, idx) => (
                        <tr key={idx} className="h-3">
                            <td className={`${borderClass} bg-gray-100 font-bold text-center text-[7px] uppercase`}>
                                {idx === 0 ? 'NO. DE LOTE' : idx === 1 ? 'VERIFICADOR' : ''}
                            </td>
                            <td className={`${borderClass} text-center font-bold uppercase`}>{line}</td>
                            <td className={borderClass} colSpan={4}></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* --- FOOTER SECTION (Compact) --- */}
            <div className={`flex w-full ${borderClass} border-2 mt-0.5`}>
                {/* Quality / Comments */}
                <div className={`w-[35%] ${borderClass} border-r-2 flex flex-col p-1`}>
                    <div className={`bg-green-100 ${borderClass} text-[7px] font-bold text-center mb-0.5`}>CALIDAD DE PRODUCTO Y CANTIDAD DE SACOS</div>
                    <p className="text-[7px] text-justify mb-2 px-1 leading-none">
                        Confirmo que el número de sacos cargados corresponden a la cantidad establecida.
                    </p>

                    <div className="text-center mt-auto mb-1">
                        <div className="border-b border-black w-3/4 mx-auto mb-0.5 font-bold text-[8px] uppercase">
                            {order.operator_name || order.operator?.name || "SIN ASIGNAR"}
                        </div>
                        <div className="text-[6px]">Nombre y firma del chofer</div>
                    </div>

                    <div className={`bg-green-100 ${borderClass} text-[7px] font-bold text-center mb-0.5`}>COMENTARIOS</div>
                    <div className={`h-4 ${borderClass}`}></div>
                </div>

                {/* Weights & Validation */}
                <div className="w-[65%] flex">
                    <div className={`w-[70%] ${borderClass} border-r flex flex-col`}>
                        <div className={`bg-green-200 ${borderClass} border-b text-center font-bold text-[7px] p-0.5`}>
                            Registro de pesos en caso de revision de peso de sacos (Muestreo del embarque) kg
                        </div>
                        <div className="flex-1">
                            <table className={`w-full border-collapse ${borderClass} border-b text-center text-[8px]`}>
                                <tbody>
                                    {weightRegistrationRows.map((row, idx) => (
                                        <React.Fragment key={idx}>
                                            <tr className="bg-green-50 font-bold h-3">
                                                {row.labels.map(label => (
                                                    <td key={label} className={`${borderClass} w-[10%]`}>{label}</td>
                                                ))}
                                            </tr>
                                            <tr className="h-4">
                                                {row.labels.map(label => (
                                                    <td key={`val-${label}`} className={borderClass}></td>
                                                ))}
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-green-200 text-[5px] font-bold text-center p-0.5 h-full flex items-center justify-center leading-none">
                            NOTA: CUALQUIER FALTANTE DEBERÁ ACOMPAÑARSE DE ESTA NOTA INDICANDO LUGAR EXACTO.
                        </div>
                    </div>

                    <div className="w-[30%] flex flex-col text-[7px]">
                        <div className={`bg-green-100 ${borderClass} border-b text-center font-bold p-0.5`}>VALIDACIÓN</div>

                        <div className={`flex h-5 ${borderClass} border-b`}>
                            <div className={`w-1/2 bg-gray-50 ${borderClass} border-r flex items-center justify-center font-bold`}>SUMA</div>
                            <div className="w-1/2"></div>
                        </div>
                        <div className={`flex h-5 ${borderClass} border-b`}>
                            <div className={`w-1/2 bg-gray-50 ${borderClass} border-r flex items-center justify-center font-bold`}>PROMEDIO</div>
                            <div className="w-1/2"></div>
                        </div>
                        <div className={`flex flex-1 ${borderClass} border-b`}>
                            <div className={`w-1/2 bg-gray-50 ${borderClass} border-r flex items-center justify-center font-bold text-center`}>LIMITES</div>
                            <div className="w-1/2 flex items-center justify-center font-bold text-xs">0-0</div>
                        </div>
                        <div className="bg-green-200 h-6 flex items-center justify-center text-center font-bold leading-none px-1">
                            IM EMBARQUE ESTIMADO
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
