import React from 'react';

interface Props {
    order: any;
}

export default function StowageNoteTemplate({ order }: Props) {
    // Exact replication of the reference image style.
    // Colors: Green headers (bg-green-200/300), Green borders (border-green-800).

    const gridCols = Array.from({ length: 24 }, (_, i) => i + 1);
    const gridRows = ['H-1', 'H-2', 'H-3', 'H-4', 'H-5', 'H-6'];

    const weightRegistrationRows = [
        { labels: ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'X8', 'X9', 'X10'] },
        { labels: ['X11', 'X12', 'X13', 'X14', 'X15', 'X16', 'X17', 'X18', 'X19', 'X20'] },
    ];

    // Helper for table cell classes
    const cellClass = "border border-green-800 px-1 py-0.5";
    const headerClass = "bg-green-200 font-bold text-center border border-green-800 text-[9px] uppercase";
    const labelClass = "bg-green-100 font-bold text-[8px] border-r border-green-800 px-1 flex items-center";

    return (
        <div className="w-full h-full bg-white font-sans text-[10px] text-black leading-tight">

            {/* --- HEADER --- */}
            <div className="flex w-full border-2 border-green-800 mb-1">
                {/* Logo Section */}
                <div className="w-[15%] border-r-2 border-green-800 p-1 flex flex-col items-center justify-center">
                    <img src="/images/logo_proagro.png" alt="ProAgro" className="h-10 object-contain mb-1" />
                    <div className="text-[8px] font-bold text-green-800 leading-none text-center">PRO <br /> AGROINDUSTRIA</div>
                </div>

                {/* Title Section */}
                <div className="w-[75%] border-r-2 border-green-800 flex flex-col items-center justify-center py-1">
                    <h1 className="text-xl font-bold uppercase">PRO-AGROINDUSTRIA, S.A. DE C.V.</h1>
                    <h2 className="text-lg font-bold uppercase">GLS-AP-FO-002</h2>
                    <h2 className="text-xl font-bold uppercase">NOTA DE ESTIBA A CAMIÓN</h2>
                </div>

                {/* Meta Data Section */}
                <div className="w-[10%] flex flex-col text-[8px]">
                    <div className="flex-1 flex border-b border-green-800">
                        <div className="w-[40%] bg-green-100 font-bold flex items-center justify-center border-r border-green-800">FECHA</div>
                        <div className="w-[60%] flex items-center justify-center font-bold px-1">{order.date || order.created_at?.split('T')[0]}</div>
                    </div>
                    <div className="flex-1 flex border-b border-green-800">
                        <div className="w-[40%] bg-green-100 font-bold flex items-center justify-center border-r border-green-800">TURNO</div>
                        <div className="w-[60%] flex items-center justify-center px-1"></div>
                    </div>
                    <div className="flex-1 flex">
                        <div className="w-[40%] bg-green-100 font-bold flex items-center justify-center border-r border-green-800">HORA</div>
                        <div className="w-[60%] flex items-center justify-center px-1"></div>
                    </div>
                </div>
            </div>

            {/* --- TRANSPORTISTA SECTION --- */}
            <div className="flex w-full border-2 border-green-800 mb-1">
                {/* Driver Name */}
                <div className="w-[30%] border-r-2 border-green-800 flex flex-col">
                    <div className={headerClass}>NOMBRE Y FIRMA DEL CHOFER</div>
                    <div className="flex-1 flex items-center justify-center font-bold uppercase text-xs p-1">
                        {order.operator_name || order.operator?.name || "SIN ASIGNAR"}
                    </div>
                </div>
                {/* Transport Details */}
                <div className="w-[70%] flex flex-col">
                    <div className={headerClass}>DATOS DEL TRANSPORTISTA</div>
                    {/* Row 1 */}
                    <div className="flex border-b border-green-800">
                        <div className="w-[20%] text-[7px] bg-green-50 pl-1 border-r border-green-800 flex items-center">NOMBRE DE LA FLETERA</div>
                        <div className="w-[50%] font-bold uppercase px-1 flex items-center border-r border-green-800 text-[10px]">
                            {order.transport_company || order.carrier?.name || "N/A"}
                        </div>
                        <div className="w-[15%] text-[7px] bg-green-50 pl-1 border-r border-green-800 flex items-center">TIPO DE UNIDAD</div>
                        <div className="w-[15%] font-bold text-center flex items-center justify-center uppercase">
                            {order.is_full ? 'FULL' : (order.unit_type || 'SENCILLO')}
                        </div>
                    </div>
                    {/* Row 2 */}
                    <div className="flex h-6">
                        <div className="w-[70%] font-bold uppercase px-1 flex items-center border-r border-green-800 text-[10px]">
                            {/* CTM or extra transport data can go here, using carrier name again or empty if redundant */}
                        </div>
                        <div className="w-[10%] text-[7px] bg-green-50 pl-1 border-r border-green-800 flex items-center">PLACAS</div>
                        <div className="w-[20%] font-bold text-[8px] flex flex-col justify-center px-1 leading-none uppercase">
                            <div>TRACTO: {order.tractor_plate}</div>
                            <div>REMOLQUE: {order.trailer_plate}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DATOS GENERALES --- */}
            <div className="w-full border-2 border-green-800 mb-2">
                <div className={headerClass}>DATOS GENERALES</div>
                <div className="flex h-10">
                    <div className="w-[15%] border-r border-green-800">
                        <div className="bg-green-50 text-[7px] pl-1 border-b border-green-800">ORDEN DE VENTA</div>
                        <div className="h-6 flex items-center justify-center font-bold">{order.sales_order?.sale_order || order.sales_order?.folio || "N/A"}</div>
                    </div>
                    <div className="w-[15%] border-r border-green-800">
                        <div className="bg-green-50 text-[7px] pl-1 border-b border-green-800">ORDEN DE EMBARQUE</div>
                        <div className="h-6 flex items-center justify-center font-bold text-sm">{order.folio}</div>
                    </div>
                    <div className="w-[40%] border-r border-green-800">
                        <div className="bg-green-100 text-center text-[7px] border-b border-green-800">DESTINATARIO</div>
                        <div className="flex h-6">
                            <div className="w-[60%] border-r border-green-800 flex flex-col">
                                <div className="text-[6px] pl-1 bg-green-50 border-b border-green-800">NOMBRE</div>
                                <div className="flex-1 flex items-center justify-center font-bold uppercase text-[9px] leading-none px-1 text-center">
                                    {order.client?.business_name || order.client?.name}
                                </div>
                            </div>
                            <div className="w-[40%] flex flex-col">
                                <div className="text-[6px] pl-1 bg-green-50 border-b border-green-800">DESTINO</div>
                                <div className="flex-1 flex items-center justify-center font-bold uppercase text-[8px] leading-none px-1 text-center">
                                    {order.destination || order.state}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-[30%] flex flex-col">
                        <div className="text-[7px] bg-green-100 text-center border-b border-green-800">SUPERVISOR</div>
                        <div className="flex-1 pt-4 border-b border-green-800 mx-2"></div>
                    </div>
                </div>
            </div>

            {/* --- GRID E- --- */}
            <div className="w-full mb-1 relative">
                <div className="text-center font-bold text-lg mb-1">E-</div>
                <table className="w-full border-collapse border border-black text-center text-[8px]">
                    <thead>
                        <tr>
                            <th className="border border-black w-6 bg-gray-100"></th>
                            {gridCols.map(col => (
                                <th key={col} className="border border-black bg-gray-100 h-4">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {gridRows.map(rowLabel => (
                            <tr key={rowLabel} className="h-4">
                                <td className="border border-black bg-gray-100 font-bold">{rowLabel}</td>
                                {gridCols.map(col => (
                                    <td key={`${rowLabel}-${col}`} className="border border-black"></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Floating Box - Styled like reference */}
                <div className="absolute -right-2 top-8 w-24 h-12 border-2 border-black bg-white rounded-xl z-10"></div>
            </div>

            {/* --- PRODUCT TABLE --- */}
            <table className="w-full border-collapse border-2 border-green-800 text-[9px] mb-1 mt-2">
                <thead>
                    <tr className="bg-green-200 text-center font-bold">
                        <th className="border border-green-800 w-[10%]">CODIGO</th>
                        <th className="border border-green-800 w-[30%]">PRODUCTO</th>
                        <th className="border border-green-800 w-[15%]">NO. DE ALMACEN</th>
                        <th className="border border-green-800 w-[10%]">TOTAL SACOS</th>
                        <th className="border border-green-800 w-[10%]">AJUSTE</th>
                        <th className="border border-green-800 w-[25%]">JUSTIFICAR</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="h-6 font-bold text-center">
                        <td className="border border-green-800">{order.product?.code || "1073"}</td>
                        <td className="border border-green-800 uppercase text-xs">{order.product?.name || "UREA AGRICOLA"}</td>
                        <td className="border border-green-800"></td>
                        <td className="border border-green-800">{order.sacks_count || "N/A"} <span className="text-[7px]">KG</span></td>
                        <td className="border border-green-800"></td>
                        <td className="border border-green-800"></td>
                    </tr>
                    {['LINEA 1', 'LINEA 2', 'LINEA 3', 'LINEA 4'].map((line, idx) => (
                        <tr key={idx} className="h-4">
                            <td className="border border-green-800 bg-gray-100 font-bold text-center text-[8px] uppercase">
                                {idx === 0 ? 'NO. DE LOTE' : idx === 1 ? 'VERIFICADOR' : ''}
                            </td>
                            <td className="border border-green-800 text-center font-bold uppercase">{line}</td>
                            <td className="border border-green-800" colSpan={4}></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* --- FOOTER SECTION --- */}
            <div className="flex w-full border-2 border-green-800 mt-1">
                {/* Quality / Comments */}
                <div className="w-[35%] border-r-2 border-green-800 flex flex-col p-1">
                    <div className="bg-green-100 border border-green-800 text-[8px] font-bold text-center mb-1">CALIDAD DE PRODUCTO Y CANTIDAD DE SACOS</div>
                    <p className="text-[8px] text-justify mb-4 px-1">
                        Confirmo que el número de sacos cargados corresponden a la cantidad establecida.
                    </p>

                    <div className="text-center mt-auto mb-2">
                        <div className="border-b border-black w-3/4 mx-auto mb-1 font-bold text-[9px] uppercase">
                            {order.operator_name || order.operator?.name || "SIN ASIGNAR"}
                        </div>
                        <div className="text-[7px]">Nombre y firma del chofer</div>
                    </div>

                    <div className="bg-green-100 border border-green-800 text-[8px] font-bold text-center mb-1">COMENTARIOS</div>
                    <div className="h-6 border border-green-800"></div>
                </div>

                {/* Weights & Validation */}
                <div className="w-[65%] flex">
                    {/* Weight Grid */}
                    <div className="w-[70%] border-r border-green-800 flex flex-col">
                        <div className="bg-green-200 border-b border-green-800 text-center font-bold text-[8px] p-0.5">
                            Registro de pesos en caso de revision de peso de sacos (Muestreo del embarque) kg
                        </div>
                        <div className="flex-1">
                            <table className="w-full border-collapse border-b border-green-800 text-center text-[9px]">
                                <tbody>
                                    {weightRegistrationRows.map((row, idx) => (
                                        <React.Fragment key={idx}>
                                            <tr className="bg-green-50 font-bold h-4">
                                                {row.labels.map(label => (
                                                    <td key={label} className="border border-green-800 w-[10%]">{label}</td>
                                                ))}
                                            </tr>
                                            <tr className="h-5">
                                                {row.labels.map(label => (
                                                    <td key={`val-${label}`} className="border border-green-800"></td>
                                                ))}
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-green-200 text-[6px] font-bold text-center p-0.5 h-full flex items-center justify-center">
                            NOTA: CUALQUIER FALTANTE DEBERÁ ACOMPAÑARSE DE ESTA NOTA INDICANDO LUGAR EXACTO.
                        </div>
                    </div>

                    {/* Validation */}
                    <div className="w-[30%] flex flex-col text-[8px]">
                        <div className="bg-green-100 border-b border-green-800 text-center font-bold p-0.5">VALIDACIÓN</div>

                        <div className="flex h-6 border-b border-green-800">
                            <div className="w-1/2 bg-gray-50 border-r border-green-800 flex items-center justify-center font-bold">SUMA</div>
                            <div className="w-1/2"></div>
                        </div>
                        <div className="flex h-6 border-b border-green-800">
                            <div className="w-1/2 bg-gray-50 border-r border-green-800 flex items-center justify-center font-bold">PROMEDIO</div>
                            <div className="w-1/2"></div>
                        </div>
                        <div className="flex flex-1 border-b border-green-800">
                            <div className="w-1/2 bg-gray-50 border-r border-green-800 flex items-center justify-center font-bold text-center">LIMITES</div>
                            <div className="w-1/2 flex items-center justify-center font-bold text-sm">0-0</div>
                        </div>
                        <div className="bg-green-200 h-8 flex items-center justify-center text-center font-bold leading-none px-1">
                            IM EMBARQUE ESTIMADO
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
