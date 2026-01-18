import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';

interface TicketData {
    folio: string;
    ticket_number: string;
    date: string;
    time: string;
    reference: string;
    operation: string;
    scale_number: number;
    product: string;
    presentation: string;
    client: string;
    sale_order: string; // OV
    withdrawal_letter: string; // Carta Porte / Retiro
    driver: string;
    tractor_plate: string;
    trailer_plate: string;
    destination: string;
    transporter: string;
    consignee: string;
    observations: string;

    // Weights
    entry_weight: number;
    exit_weight: number; // Pb (Peso Bruto usually, or second weight)
    net_weight: number;
    tare_weight: number; // Tara
    gross_weight: number; // Bruto

    // Dates
    entry_at: string;
    exit_at: string;

    weighmaster: string;
    documenter: string; // Optional if we capture it
}

interface TicketProps {
    ticket: TicketData;
}

const TicketCopy: React.FC<{ ticket: TicketData; copyName: string; isLast?: boolean }> = ({ ticket, copyName, isLast }) => {
    return (
        <div className={`w-[21cm] h-[14.8cm] mx-auto bg-white p-8 mb-4 relative text-black font-sans box-border ${!isLast ? 'print:break-after-page' : ''}`}>
            {/* Header */}
            <div className="flex border-b-2 border-black pb-2 mb-2">
                <div className="w-1/4 flex items-center justify-center border-r-2 border-black pr-2">
                    <img src="/images/logo-placeholder.png" alt="Proagro" className="h-16 w-auto object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <div className="text-center font-bold text-sm hidden">PROAGRO</div>
                </div>
                <div className="w-2/4 text-center px-2 flex flex-col justify-center">
                    <h1 className="font-bold text-lg leading-tight">PRO-AGROINDUSTRIA S.A. DE C.V.</h1>
                    <p className="text-xs">COATZACOALCOS, VERACRUZ</p>
                    <p className="text-xs font-bold">LOGISTICA Y SUMINISTROS</p>
                    <p className="text-xs border border-black inline-block px-2 mt-1 mx-auto">TICKETS DE PESO</p>
                </div>
                <div className="w-1/4 flex flex-col justify-center items-center border-l-2 border-black pl-2">
                    <div className="text-xs font-bold mb-1">FOLIO</div>
                    <div className="border border-black px-2 py-1 font-mono text-lg font-bold">
                        {ticket.ticket_number}
                    </div>
                </div>
            </div>

            {/* Content Table Style */}
            <div className="w-full text-xs">
                {/* Fecha Header */}
                <div className="flex justify-end mb-1">
                    <div className="flex border border-black">
                        <div className="bg-gray-200 px-2 font-bold border-r border-black">FECHA:</div>
                        <div className="px-2">{ticket.date}</div>
                        <div className="px-2 border-l border-black bg-gray-200 font-bold">HORA:</div>
                        <div className="px-2">{ticket.time}</div>
                    </div>
                </div>

                {/* Rows */}
                <div className="border border-black">
                    {/* Row 1 */}
                    <div className="flex border-b border-black">
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">REFERENCIA:</div>
                        <div className="w-2/6 px-1 border-r border-black">{ticket.reference}</div>
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">OPERACION:</div>
                        <div className="w-1/6 px-1 border-r border-black">{ticket.operation}</div>
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">BASCULA:</div>
                        <div className="w-1/6 px-1 text-center">{ticket.scale_number}</div>
                    </div>

                    {/* Row 2: Producto & Entrada */}
                    <div className="flex border-b border-black">
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">PRODUCTO:</div>
                        <div className="w-2/6 px-1 border-r border-black">{ticket.product} {ticket.presentation}</div>
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black !text-black">1er PESO:</div>
                        <div className="w-1/6 px-1 font-mono text-right border-r border-black">{ticket.entry_weight.toLocaleString()} Kg</div>
                        <div className="w-2/6 bg-gray-100"></div>
                    </div>

                    {/* Row 3: Cliente & Cantidad */}
                    <div className="flex border-b border-black">
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">CLIENTE:</div>
                        <div className="w-2/6 px-1 border-r border-black truncate" title={ticket.client}>{ticket.client}</div>
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black !text-black">2do PESO:</div>
                        <div className="w-1/6 px-1 font-mono text-right border-r border-black">{ticket.exit_weight.toLocaleString()} Kg</div>
                        <div className="w-2/6 bg-gray-100"></div>
                    </div>

                    {/* Row 4: OV & Bruto */}
                    <div className="flex border-b border-black">
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">ORDEN VENTA:</div>
                        <div className="w-2/6 px-1 border-r border-black">{ticket.sale_order}</div>
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">BRUTO:</div>
                        <div className="w-1/6 px-1 font-mono text-right border-r border-black">{ticket.gross_weight.toLocaleString()} Kg</div>
                        <div className="w-2/6 bg-gray-100"></div>
                    </div>

                    {/* Row 5: Carta Porte & Tara */}
                    <div className="flex border-b border-black">
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">CARTA PORTE:</div>
                        <div className="w-2/6 px-1 border-r border-black">{ticket.withdrawal_letter}</div>
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">TARA:</div>
                        <div className="w-1/6 px-1 font-mono text-right border-r border-black">{ticket.tare_weight.toLocaleString()} Kg</div>
                        <div className="w-2/6 bg-gray-100"></div>
                    </div>

                    {/* Row 6: Placas & Neto */}
                    <div className="flex border-b border-black">
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">PLACAS:</div>
                        <div className="w-2/6 px-1 border-r border-black">{ticket.tractor_plate} / {ticket.trailer_plate}</div>
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">NETO:</div>
                        <div className="w-1/6 px-1 font-bold font-mono text-right border-r border-black">{ticket.net_weight.toLocaleString()} Kg</div>
                        <div className="w-2/6 bg-gray-100"></div>
                    </div>

                    {/* Row 7: Conductor & Timestamp */}
                    <div className="flex border-b border-black">
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">CONDUCTOR:</div>
                        <div className="w-2/6 px-1 border-r border-black truncate" title={ticket.driver}>{ticket.driver}</div>
                        <div className="w-3/6 px-1 text-center italic text-[10px] text-gray-500">
                            Entrada: {ticket.entry_at} | Salida: {ticket.exit_at}
                        </div>
                    </div>

                    {/* Row 8: Destino */}
                    <div className="flex border-b border-black">
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">DESTINO:</div>
                        <div className="w-5/6 px-1 truncate" title={ticket.destination}>{ticket.destination}</div>
                    </div>

                    {/* Row 9: Transportista && Destara Info (Empty slots in original) */}
                    <div className="flex border-b border-black">
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">TRANSP.:</div>
                        <div className="w-2/6 px-1 border-r border-black truncate" title={ticket.transporter}>{ticket.transporter}</div>
                        <div className="w-3/6 bg-white"></div>
                    </div>

                    {/* Row 10: Consignado */}
                    <div className="flex border-b border-black">
                        <div className="w-1/6 bg-gray-50 px-1 font-bold border-r border-black">CONSIGNADO:</div>
                        <div className="w-5/6 px-1 truncate" title={ticket.consignee}>{ticket.consignee}</div>
                    </div>
                </div>

                {/* Observaciones */}
                <div className="border-l border-r border-b border-black mb-2">
                    <div className="bg-gray-100 font-bold px-1 text-center border-b border-black text-[10px]">OBSERVACIONES</div>
                    <div className="px-1 h-8 overflow-hidden text-[10px]">{ticket.observations}</div>
                </div>

                {/* Firmas */}
                <div className="flex justify-between mt-8 text-[10px] pt-4">
                    <div className="flex flex-col items-center w-1/3">
                        <div className="border-t border-black w-3/4 text-center pt-1 font-bold">{ticket.documenter}</div>
                        <div>FIRMA DE DOCUMENTADOR</div>
                    </div>
                    <div className="flex flex-col items-center w-1/3">
                        <div className="border-t border-black w-3/4 text-center pt-1 font-bold">{ticket.weighmaster}</div>
                        <div>FIRMA DEL PESADOR</div>
                    </div>
                    <div className="flex flex-col items-center w-1/3">
                        <div className="border-t border-black w-3/4 text-center pt-1 font-bold">{ticket.driver}</div>
                        <div>FIRMA DEL OPERADOR</div>
                    </div>
                </div>

                {/* Copy Label */}
                <div className="text-center font-bold text-red-600 mt-2 uppercase border border-red-200 inline-block px-4 py-1 rounded w-full">
                    {copyName}
                </div>
            </div>
        </div>
    );
};

export default function Ticket({ ticket }: TicketProps) {

    useEffect(() => {
        // Automatically trigger print on load? Or wait for user?
        // Let's wait for user to click print, but show a toast or something?
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        // Redirect back using window.location or Inertia router
        window.location.href = '/scale';
    };

    return (
        <div className="bg-gray-200 min-h-screen p-4 print:p-0 print:bg-white text-sm">
            <Head title={`Ticket - ${ticket.ticket_number}`} />

            {/* Styling for Print */}
            <style>{`
                @media print {
                    @page {
                        size: A5 landscape;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            {/* Action Bar (Hidden in Print) */}
            <div className="max-w-4xl mx-auto mb-4 flex justify-between print:hidden">
                <button
                    onClick={handleBack}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Regresar
                </button>
                <div className="text-xl font-bold text-gray-800">Vista Previa de Ticket</div>
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow flex items-center gap-2 font-bold"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                    </svg>
                    IMPRIMIR
                </button>
            </div>

            {/* Ticket Copies */}
            <div className="max-w-5xl mx-auto">
                <TicketCopy ticket={ticket} copyName="CLIENTE" />
                <TicketCopy ticket={ticket} copyName="VIGILANCIA" />
                <TicketCopy ticket={ticket} copyName="DOCUMENTACIÓN" isLast={true} />
            </div>
        </div>
    );
}
