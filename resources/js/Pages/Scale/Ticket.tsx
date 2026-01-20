import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';

interface TicketData {
    folio: string;
    ticket_number: string;
    date: string;
    time: string;
    reference: string; // e.g., N/A
    operation: string; // e.g., ENTRADA / SALIDA
    scale_number: number;
    product: string;
    presentation: string; // e.g., GRANEL
    client: string; // Cliente o Proveedor
    sale_order: string; // N/A
    withdrawal_letter: string; // Carta Porte
    driver: string;
    tractor_plate: string;
    trailer_plate: string;
    destination: string;
    transporter: string;
    consignee: string; // Consignado
    observations: string;
    programmed_weight: string; // Cantidad Programada e.g. N/A
    economic_number: string;

    // Weights
    entry_weight: number;
    exit_weight: number;
    net_weight: number;
    tare_weight: number;
    gross_weight: number;

    // Dates
    entry_at: string;
    exit_at: string;

    weighmaster: string;
    documenter: string;
}

interface TicketProps {
    ticket: TicketData;
}

const TicketCopy: React.FC<{ ticket: TicketData; copyName: string; isLast?: boolean }> = ({ ticket, copyName, isLast }) => {
    return (
        <div className={`w-[24cm] mx-auto bg-white p-6 pt-2 mb-4 relative text-black font-sans box-border border border-gray-300 print:border-none ${!isLast ? 'print:break-after-page' : ''}`}>

            {/* --- Header --- */}
            <div className="flex mb-1 items-center">
                {/* Logo Section */}
                <div className="w-[20%] p-1 flex items-center justify-center">
                    <img
                        src="/img/Proagro2.png"
                        alt="Logo Proagro"
                        className="h-20 w-auto object-contain"
                        onError={(e) => {
                            e.currentTarget.src = "/images/logo_proagro.png"; // Fallback to original if new one fails
                        }}
                    />
                </div>

                {/* Company Info */}
                <div className="w-[55%] flex flex-col justify-center items-center text-center px-2">
                    <h1 className="font-bold text-[24px] leading-tight tracking-tight">PRO-AGROINDUSTRIA S.A. DE C.V.</h1>
                    <p className="text-[11px] font-bold">COATZACOALCOS, VERACRUZ</p>
                    <p className="text-[14px] font-bold mt-1">LOGISTICA Y SUMINISTROS</p>
                    <p className="text-[10px] mt-0.5">GLS-TR-FO-005.</p>
                    <div className="border border-black px-6 py-0.5 mt-1 font-bold text-[14px] uppercase tracking-widest">
                        Tickets de Peso
                    </div>
                </div>

                {/* Folio & Date */}
                <div className="w-[25%] flex flex-col border border-black">
                    {/* Folio */}
                    <div className="flex-1 flex flex-col items-center justify-center p-1 border-b border-black">
                        <div className="text-[11px] font-bold uppercase">FOLIO</div>
                        <div className="border-[2px] border-black px-2 py-0.5 mt-0.5 flex items-center font-bold">
                            <span className="text-[16px]">No PRO</span>
                            <span className="text-[20px] text-red-600 ml-2">{ticket.folio || ticket.ticket_number}</span>
                            <span className="text-[16px] ml-2">B</span>
                        </div>
                    </div>
                    {/* Date */}
                    <div className="flex text-[10px]">
                        <div className="w-1/3 flex items-center justify-center font-bold bg-gray-50 uppercase h-10 border-r border-black">Fecha:</div>
                        <div className="flex-1 flex flex-col items-center justify-center font-mono">
                            <div className="flex w-full justify-around border-b border-gray-100 px-1 font-bold text-[9px]">
                                <span>DIA</span><span>MES</span><span>AÑO</span>
                            </div>
                            <div className="flex w-full justify-around px-1 text-[12px] font-bold">
                                <span>{ticket.date.split('/')[0]}</span>
                                <span>{ticket.date.split('/')[1]}</span>
                                <span>{ticket.date.split('/')[2]}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="flex border border-black text-[12px]">

                {/* --- Left Column: Data --- */}
                <div className="w-[60%] border-r border-black flex flex-col">
                    <div className="flex border-b border-black">
                        <div className="w-1/4 font-bold border-r border-black px-1.5 py-0.5 uppercase">Referencia:</div>
                        <div className="w-1/4 px-1.5 py-0.5 border-r border-black">{ticket.reference}</div>
                        <div className="w-1/4 font-bold border-r border-black px-1.5 py-0.5 uppercase">Operación:</div>
                        <div className="w-1/4 px-1.5 py-0.5 text-center font-bold">{ticket.operation}</div>
                    </div>

                    {[
                        ['Producto:', `${ticket.product} (${ticket.presentation})`],
                        ['Cantidad Programada:', ticket.programmed_weight || 'N/A'],
                        ['Cliente ó Proveedor:', ticket.client],
                        ['No. Orden de Venta:', ticket.sale_order],
                        ['Carta Porte:', ticket.withdrawal_letter],
                    ].map(([label, value], idx) => (
                        <div key={idx} className="flex border-b border-black">
                            <div className="w-[35%] font-bold border-r border-black px-1.5 py-0.5 uppercase">{label}</div>
                            <div className="w-[65%] px-1.5 py-0.5">{value}</div>
                        </div>
                    ))}

                    <div className="flex border-b border-black">
                        <div className="w-1/4 font-bold border-r border-black px-1.5 py-0.5 uppercase">No. de Placas:</div>
                        <div className="w-1/4 px-1.5 py-0.5 border-r border-black font-mono">{ticket.tractor_plate}</div>
                        <div className="w-1/4 font-bold border-r border-black px-1.5 py-0.5 uppercase">Econo:</div>
                        <div className="w-1/4 px-1.5 py-0.5 font-mono">{ticket.economic_number}</div>
                    </div>

                    {[
                        ['Conductor:', ticket.driver],
                        ['Destino:', ticket.destination],
                        ['Transportista:', ticket.transporter],
                        ['Consignación:', ticket.consignee],
                    ].map(([label, value], idx) => (
                        <div key={idx} className="flex border-b border-black">
                            <div className="w-1/4 font-bold border-r border-black px-1.5 py-0.5 uppercase">{label}</div>
                            <div className="w-3/4 px-1.5 py-0.5 uppercase">{value}</div>
                        </div>
                    ))}

                    {/* Observaciones Area */}
                    <div className="flex-1 min-h-[60px] flex flex-col">
                        <div className="font-bold px-1.5 pt-0.5 text-[10px] uppercase">Observaciones:</div>
                        <div className="px-1.5 py-0.5 text-[11px] italic leading-tight">
                            {ticket.observations}
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Weights (Dot Matrix Simulation) --- */}
                <div className="w-[40%] flex flex-col font-mono text-[13px] bg-gray-50/5">
                    <div className="border-b border-black text-center font-bold py-1 uppercase text-[11px]">Espacio para Impresión</div>

                    <div className="flex-1 p-3 space-y-2 flex flex-col justify-center">
                        <div className="text-center opacity-60 text-[10px] mb-2">PRO-AGROINDUSTRIA S.A DE C.V <br /> BASCULA {ticket.scale_number}</div>

                        <div className="flex justify-between">
                            <span>TICKET No.:</span>
                            <span className="font-bold">{ticket.ticket_number.replace('TK-', '')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>VEHICULO :</span>
                            <span>{ticket.economic_number}</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-gray-400 pb-1">
                            <span>ENTRADA  :</span>
                            <div className="flex flex-col items-end">
                                <span>{ticket.entry_weight.toLocaleString()} kg</span>
                                <span className="text-[9px] opacity-70">{ticket.entry_at || ticket.date}</span>
                            </div>
                        </div>

                        {ticket.net_weight > 0 ? (
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between">
                                    <span>BRUTO    :</span>
                                    <span>{ticket.gross_weight.toLocaleString()} kg</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>TARA     :</span>
                                    <span>{ticket.tare_weight.toLocaleString()} kg</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t-2 border-black font-bold text-[18px]">
                                    <span>NETO     :</span>
                                    <span>{ticket.net_weight.toLocaleString()} kg</span>
                                </div>
                                <div className="text-right text-[10px] opacity-70">{ticket.exit_at || ticket.time}</div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-[20px] opacity-20 rotate-[-15deg] font-bold border-2 border-dashed border-gray-300 m-4">
                                PENDIENTE
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Footer / Signatures --- */}
            <div className="flex justify-between mt-auto mb-2 px-4 h-24 items-end">
                <div className="flex flex-col items-center w-[30%]">
                    <div className="w-full h-10 border-b border-black text-center text-[10px] flex items-end justify-center pb-1">
                        {ticket.documenter}
                    </div>
                    <div className="text-[10px] font-bold text-center mt-1 uppercase">Firma de Documentador</div>
                </div>
                <div className="flex flex-col items-center w-[30%]">
                    <div className="w-full h-10 border-b border-black text-center text-[10px] flex items-end justify-center pb-1">
                        {ticket.weighmaster}
                    </div>
                    <div className="text-[10px] font-bold text-center mt-1 uppercase">Firma del Pesador</div>
                    <div className="text-[9px] text-red-600 font-bold">BASCULA</div>
                </div>
                <div className="flex flex-col items-center w-[30%]">
                    <div className="w-full h-10 border-b border-black text-center text-[10px] flex items-end justify-center pb-1 uppercase">
                        {ticket.driver}
                    </div>
                    <div className="text-[10px] font-bold text-center mt-1 uppercase">Firma de Operador</div>
                </div>
            </div>

            <div className="absolute top-2 right-2 text-[9px] font-bold opacity-30 tracking-widest">{copyName}</div>
        </div>
    );
};

export default function Ticket({ ticket }: TicketProps) {

    useEffect(() => {
        // Optional: auto print
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        window.history.back();
    };

    return (
        <div className="bg-gray-200 min-h-screen p-4 print:p-0 print:bg-white text-sm">
            <Head title={`Ticket - ${ticket.ticket_number}`} />

            <style>{`
                @media print {
                    @page {
                        size: letter landscape; /* Ajustar a carta horizontal para q quepan 2 o half-letter */
                        margin: 0.5cm;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="max-w-4xl mx-auto mb-4 flex justify-between print:hidden">
                <button
                    onClick={handleBack}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow flex items-center gap-2"
                >
                    Regresar
                </button>
                <div className="text-xl font-bold text-gray-800">Vista Previa de Ticket</div>
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow flex items-center gap-2 font-bold"
                >
                    IMPRIMIR
                </button>
            </div>

            <div className="max-w-[25cm] mx-auto print:max-w-none">
                <TicketCopy ticket={ticket} copyName="ORIGINAL" />
                {/* <TicketCopy ticket={ticket} copyName="COPIA" isLast={true} /> */}
            </div>
        </div>
    );
}
