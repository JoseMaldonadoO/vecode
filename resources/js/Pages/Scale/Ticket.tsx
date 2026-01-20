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
        <div className={`w-[24cm] h-[14cm] mx-auto bg-white p-6 mb-4 relative text-black font-sans box-border border border-gray-300 print:border-none ${!isLast ? 'print:break-after-page' : ''}`}>

            {/* --- Header --- */}
            <div className="flex border border-black mb-1 p-1">
                {/* Logo Section */}
                <div className="w-[20%] flex flex-col items-center justify-center border-r border-black p-1">
                    <img src="/images/logo_proagro.png" alt="Logo" className="h-16 w-auto object-contain mb-1" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <div className="text-[10px] font-bold text-center leading-none">PRO<br />AGROINDUSTRIA</div>
                    <div className="text-[8px] text-center mt-1">BASCULA</div>
                    <div className="text-[8px] text-center">RECIBIDO/DESPACHADO</div>
                </div>

                {/* Company Info */}
                <div className="w-[55%] flex flex-col justify-center items-center text-center px-2">
                    <h1 className="font-bold text-xl leading-tight">PRO-AGROINDUSTRIA S.A. DE C.V.</h1>
                    <p className="text-xs font-semibold">COATZACOALCOS, VERACRUZ</p>
                    <p className="text-sm font-bold mt-1">LOGISTICA Y SUMINISTROS</p>
                    <p className="text-[10px] mt-1">GLS-TR-FO-005.</p>
                    <div className="border border-black px-4 py-0.5 mt-1 font-bold text-sm bg-gray-100">
                        TICKETS DE PESO
                    </div>
                </div>

                {/* Folio & Date */}
                <div className="w-[25%] flex flex-col border-l border-black">
                    {/* Folio */}
                    <div className="flex-1 flex flex-col items-center justify-center p-2 border-b border-black">
                        <div className="text-xs font-bold mb-1">FOLIO</div>
                        <div className="border border-black px-3 py-1 font-mono text-xl font-bold rounded-sm">
                            No PRO <span className="text-red-600">{ticket.folio || ticket.ticket_number}</span> B
                        </div>
                    </div>
                    {/* Date */}
                    <div className="flex text-xs h-8">
                        <div className="w-1/4 flex items-center justify-center font-bold border-r border-black bg-gray-100 pl-1">FECHA:</div>
                        <div className="flex-1 flex items-center justify-around px-1 font-mono">
                            {ticket.date}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="flex border border-black text-[10px]">

                {/* --- Left Column: Data --- */}
                <div className="w-[60%] border-r border-black">
                    {/* Row 1 */}
                    <div className="flex border-b border-black">
                        <div className="w-[25%] font-bold px-1 py-0.5 bg-gray-100 border-r border-black">REFERENCIA:</div>
                        <div className="w-[35%] px-1 py-0.5 border-r border-black">{ticket.reference || 'N/A'}</div>
                        <div className="w-[20%] font-bold px-1 py-0.5 bg-gray-100 border-r border-black">OPERACIÓN:</div>
                        <div className="w-[20%] px-1 py-0.5 font-bold text-center">{ticket.operation}</div>
                    </div>

                    {/* Row 2 */}
                    <div className="flex border-b border-black">
                        <div className="w-[25%] font-bold px-1 py-0.5 bg-gray-100 border-r border-black">PRODUCTO:</div>
                        <div className="w-[75%] px-1 py-0.5">{ticket.product} ({ticket.presentation})</div>
                    </div>

                    {/* Row 3 */}
                    <div className="flex border-b border-black">
                        <div className="w-[40%] font-bold px-1 py-0.5 bg-gray-100 border-r border-black">CANTIDAD PROGRAMADA:</div>
                        <div className="w-[60%] px-1 py-0.5">{ticket.programmed_weight || 'N/A'}</div>
                    </div>

                    {/* Row 4 */}
                    <div className="flex border-b border-black">
                        <div className="w-[30%] font-bold px-1 py-0.5 bg-gray-100 border-r border-black">CLIENTE Ó PROVEEDOR:</div>
                        <div className="w-[70%] px-1 py-0.5">{ticket.client}</div>
                    </div>

                    {/* Row 5 */}
                    <div className="flex border-b border-black">
                        <div className="w-[30%] font-bold px-1 py-0.5 bg-gray-100 border-r border-black">No. ORDEN DE VENTA:</div>
                        <div className="w-[70%] px-1 py-0.5">{ticket.sale_order}</div>
                    </div>

                    {/* Row 6 */}
                    <div className="flex border-b border-black">
                        <div className="w-[30%] font-bold px-1 py-0.5 bg-gray-100 border-r border-black">CARTA DE RETIRO:</div>
                        <div className="w-[70%] px-1 py-0.5">{ticket.withdrawal_letter}</div>
                    </div>

                    {/* Row 7 */}
                    <div className="flex border-b border-black">
                        <div className="w-[25%] font-bold px-1 py-0.5 bg-gray-100 border-r border-black">No. DE PLACAS:</div>
                        <div className="w-[25%] px-1 py-0.5 border-r border-black">{ticket.trailer_plate || ticket.tractor_plate}</div>
                        <div className="w-[20%] font-bold px-1 py-0.5 bg-gray-100 border-r border-black">ECONO:</div>
                        <div className="w-[30%] px-1 py-0.5">{ticket.economic_number || 'N/A'}</div>
                    </div>

                    {/* Row 8 */}
                    <div className="flex border-b border-black">
                        <div className="w-[25%] font-bold px-1 py-0.5 bg-gray-100 border-r border-black">CONDUCTOR:</div>
                        <div className="w-[75%] px-1 py-0.5 uppercase">{ticket.driver}</div>
                    </div>

                    {/* Row 9 */}
                    <div className="flex border-b border-black">
                        <div className="w-[25%] font-bold px-1 py-0.5 bg-gray-100 border-r border-black">DESTINO:</div>
                        <div className="w-[75%] px-1 py-0.5 uppercase">{ticket.destination}</div>
                    </div>

                    {/* Row 10 */}
                    <div className="flex border-b border-black">
                        <div className="w-[25%] font-bold px-1 py-0.5 bg-gray-100 border-r border-black">TRANSPORTISTA:</div>
                        <div className="w-[75%] px-1 py-0.5 uppercase">{ticket.transporter}</div>
                    </div>

                    {/* Row 11 */}
                    <div className="flex border-b border-black">
                        <div className="w-[25%] font-bold px-1 py-0.5 bg-gray-100 border-r border-black">CONSIGNADO:</div>
                        <div className="w-[75%] px-1 py-0.5 uppercase">{ticket.consignee || 'N/A'}</div>
                    </div>

                    {/* Observaciones */}
                    <div className="h-16 bg-white">
                        <div className="font-bold px-1 py-0.5 bg-gray-100 border-b border-black">OBSERVACIONES:</div>
                        <div className="px-1 py-0.5 italic">{ticket.observations}</div>
                    </div>
                </div>

                {/* --- Right Column: Weights --- */}
                <div className="w-[40%] flex flex-col bg-cyan-50/10"> {/* Subtle tinge or keeping it white as requested */}
                    <div className="border-b border-black px-1 py-1 text-center font-bold bg-gray-100">ESPACIO PARA IMPRESIÓN</div>

                    <div className="flex-1 p-4 font-mono text-xs space-y-3">
                        <div className="text-center text-gray-500 text-[10px]">PRO-AGROINDUSTRIA S.A DE C.V</div>
                        <div className="text-center text-gray-500 text-[10px]">BASCULA {ticket.scale_number}</div>

                        <div className="flex justify-between mt-4">
                            <span>TICKET No.:</span>
                            <span className="font-bold">{ticket.ticket_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>VEHICULO:</span>
                            <span>{ticket.economic_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>ENTRADA :</span>
                            <span>{ticket.entry_weight.toLocaleString()} kg</span>
                        </div>
                        <div className="text-right text-[9px] text-gray-500">{ticket.entry_at || ticket.date}</div>

                        {/* Salida data */}
                        {ticket.net_weight > 0 && (
                            <>
                                <div className="mt-4 flex justify-between">
                                    <span>BRUTO &nbsp;:</span>
                                    <span>{ticket.gross_weight.toLocaleString()} kg</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>TARA &nbsp;&nbsp;:</span>
                                    <span>{ticket.tare_weight.toLocaleString()} kg</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t border-dashed border-gray-400 pt-1">
                                    <span>NETO &nbsp;&nbsp;:</span>
                                    <span>{ticket.net_weight.toLocaleString()} kg</span>
                                </div>
                                <div className="text-right text-[9px] text-gray-500">{ticket.exit_at || ticket.time}</div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Signatures --- */}
            <div className="flex justify-between mt-auto pt-8 px-4 text-[10px] absolute bottom-8 w-full left-0 box-border">
                <div className="flex flex-col items-center w-[30%]">
                    <div className="border-t border-black w-full text-center pt-1 font-bold">{ticket.documenter || '___________________'}</div>
                    <div>FIRMA DE DOCUMENTADOR</div>
                </div>
                <div className="flex flex-col items-center w-[30%]">
                    <div className="border-t border-black w-full text-center pt-1 font-bold">{ticket.weighmaster}</div>
                    <div>FIRMA DEL PESADOR</div>
                </div>
                <div className="flex flex-col items-center w-[30%]">
                    <div className="border-t border-black w-full text-center pt-1 font-bold relative">
                        {ticket.driver}
                    </div>
                    <div>FIRMA DE OPERADOR</div>
                </div>
            </div>

            <div className="absolute top-2 right-2 text-[10px] text-gray-400 opacity-50">{copyName}</div>
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
