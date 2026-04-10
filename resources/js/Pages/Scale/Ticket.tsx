import React, { useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";

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
    is_vessel: boolean;
}

interface TicketProps {
    ticket: TicketData;
}

const TicketCopy: React.FC<{
    ticket: TicketData;
    copyName: string;
    isLast?: boolean;
}> = ({ ticket, copyName, isLast }) => {
    const isVessel = ticket.is_vessel;
    const { props } = usePage<any>();
    const tenant = props.tenant;

    return (
        <div
            className={`mx-auto bg-white mb-4 relative text-black font-sans box-border border border-gray-300 print:border-none 
                ${isVessel ? "w-[14cm] p-4 min-h-[21cm]" : "w-[24cm] p-6 pt-2 print:pt-10"} 
                ${!isLast ? "print:break-after-page" : ""}`}
        >
            {/* --- Header --- */}
            <div className={`flex mb-2 items-center ${isVessel ? "flex-col border-b border-black pb-2" : "flex-row"}`}>
                {/* Logo Section */}
                <div className={`${isVessel ? "w-full mb-2" : "w-[20%]"} p-1 flex items-center justify-center`}>
                    <img
                        src={tenant?.logo || "/images/logovecode.png"}
                        alt={tenant?.name || "Logo"}
                        className={`${isVessel ? "h-16" : "h-20"} w-auto object-contain`}
                        onError={(e) => {
                            e.currentTarget.src = "/img/Proagro2.png";
                        }}
                    />
                </div>

                {/* Company Info */}
                <div className={`${isVessel ? "w-full mb-3" : "w-[55%]"} flex flex-col justify-center items-center text-center px-1`}>
                    <h1 className={`font-bold leading-tight tracking-tight ${isVessel ? "text-[18px]" : "text-[24px]"}`}>
                        {tenant?.name || 'PRO-AGROINDUSTRIA S.A. DE C.V.'}
                    </h1>
                    <p className="text-[10px] font-bold">
                        {tenant?.slug === 'proagro' ? 'COATZACOALCOS, VERACRUZ' : 'SISTEMA DE LOGÍSTICA'}
                    </p>
                    <p className={`font-bold mt-1 ${isVessel ? "text-[12px]" : "text-[14px]"}`}>
                        {tenant?.slug === 'proagro' ? 'LOGISTICA Y SUMINISTROS' : 'CONTROL DE PESO'}
                    </p>
                    <p className="text-[9px] mt-0.5">{tenant?.slug === 'proagro' ? 'GLS-TR-FO-005.' : 'VCD-TR-FO-005.'}</p>
                    <div className="border border-black px-4 py-0.5 mt-2 font-bold text-[12px] uppercase tracking-widest bg-gray-50">
                        TICKET DE PESO
                    </div>
                </div>

                {/* Folio & Date */}
                <div className={`${isVessel ? "w-full" : "w-[25%]"} flex ${isVessel ? "flex-row" : "flex-col"} border border-black`}>
                    {/* Folio */}
                    <div className={`flex-1 flex flex-col items-center justify-center p-1 ${isVessel ? "border-r" : "border-b"} border-black`}>
                        <div className="text-[10px] font-bold uppercase">
                            FOLIO
                        </div>
                        <div className="border-[2px] border-black px-3 py-0.5 mt-0.5 flex items-center font-bold">
                            <span className={`${isVessel ? "text-[20px]" : "text-[24px]"} text-red-600`}>
                                {(ticket.folio || "").split("-").pop()}
                            </span>
                        </div>
                    </div>
                    {/* Date */}
                    <div className={`${isVessel ? "w-1/2" : "flex-1"} flex text-[9px]`}>
                        <div className="w-1/3 flex items-center justify-center font-bold bg-gray-700 text-white uppercase h-full border-r border-black">
                            Fecha:
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center font-mono">
                            <div className="flex w-full justify-around border-b border-gray-100 px-1 font-bold text-[8px]">
                                <span>DIA</span>
                                <span>MES</span>
                                <span>AÑO</span>
                            </div>
                            <div className="flex w-full justify-around px-1 text-[11px] font-bold">
                                <span>{ticket.date.split("/")[0]}</span>
                                <span>{ticket.date.split("/")[1]}</span>
                                <span>{ticket.date.split("/")[2]}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className={`flex border border-black ${isVessel ? "flex-col text-[11px]" : "flex-row text-[12px]"}`}>
                {/* --- Data Column (or Full Width on Vessel) --- */}
                <div className={`${isVessel ? "w-full" : "w-[60%] border-r border-black"} flex flex-col`}>
                    <div className="flex border-b border-black">
                        <div className="w-1/4 font-bold border-r border-black px-1.5 py-0.5 uppercase">
                            Referencia:
                        </div>
                        <div className="w-1/4 px-1.5 py-0.5 border-r border-black truncate">
                            {ticket.reference || "N/A"}
                        </div>
                        <div className="w-1/4 font-bold border-r border-black px-1.5 py-0.5 uppercase">
                            Operación:
                        </div>
                        <div className="w-1/4 px-1.5 py-0.5 text-center font-bold">
                            {ticket.operation}
                        </div>
                    </div>

                    {[
                        ["Producto:", `${ticket.product} (${ticket.presentation})`],
                        ["Cantidad Programada:", ticket.programmed_weight || "N/A"],
                        ["Cliente ó Proveedor:", ticket.client],
                        ["No. Orden de Venta:", ticket.sale_order || "N/A"],
                        ["Carta Porte:", ticket.withdrawal_letter],
                    ].map(([label, value], idx) => (
                        <div key={idx} className="flex border-b border-black">
                            <div className="w-[35%] font-bold border-r border-black px-1.5 py-0.5 uppercase">
                                {label}
                            </div>
                            <div className="w-[65%] px-1.5 py-0.5 overflow-hidden text-ellipsis">{value}</div>
                        </div>
                    ))}

                    <div className="flex border-b border-black">
                        <div className="w-1/4 font-bold border-r border-black px-1.5 py-0.5 uppercase leading-tight">
                            Placas:
                        </div>
                        <div className="w-1/4 px-1.5 py-0.5 border-r border-black font-mono text-[10px]">
                            {ticket.tractor_plate} / {ticket.trailer_plate}
                        </div>
                        <div className="w-1/4 font-bold border-r border-black px-1.5 py-0.5 uppercase leading-tight">
                            Econo:
                        </div>
                        <div className="w-1/4 px-1.5 py-0.5 font-mono">
                            {ticket.economic_number}
                        </div>
                    </div>

                    {[
                        ["Conductor:", ticket.driver],
                        ["Destino:", ticket.destination],
                        ["Transportista:", ticket.transporter],
                        ["Consignación:", ticket.consignee],
                    ].map(([label, value], idx) => (
                        <div key={idx} className={`flex ${isVessel ? "border-b" : "border-b"} border-black`}>
                            <div className="w-1/4 font-bold border-r border-black px-1.5 py-0.5 uppercase">
                                {label}
                            </div>
                            <div className="w-3/4 px-1.5 py-0.5 uppercase overflow-hidden text-ellipsis">
                                {value}
                            </div>
                        </div>
                    ))}

                    {/* Observaciones Area */}
                    <div className={`flex flex-col ${isVessel ? "min-h-[40px] border-b border-black" : "min-h-[60px] flex-1"}`}>
                        <div className="font-bold px-1.5 pt-0.5 text-[9px] uppercase">
                            Observaciones:
                        </div>
                        <div className="px-1.5 py-0.5 text-[10px] italic leading-tight">
                            {ticket.observations}
                        </div>
                    </div>
                </div>

                {/* --- Weight Section --- */}
                <div className={`${isVessel ? "w-full p-2 bg-gray-50/10" : "w-[40%] flex flex-col font-mono text-[13px] bg-gray-50/5"}`}>
                    {!isVessel && (
                        <div className="border-b border-black text-center font-bold py-1 uppercase text-[11px] h-[19px]">
                            &nbsp;
                        </div>
                    )}

                    <div className={`${isVessel ? "space-y-1 font-mono text-[12px]" : "flex-1 p-3 space-y-2 flex flex-col justify-center"}`}>
                        {isVessel && <div className="font-bold border-b border-black mb-1 text-center py-0.5">DATOS DE PESAJE</div>}
                        
                        {!isVessel && (
                            <div className="text-center opacity-60 text-[10px] mb-2">
                                {tenant?.name || 'VECODE'} <br /> BASCULA{" "}
                                {ticket.scale_number}
                            </div>
                        )}

                        <div className="flex justify-between border-b border-dotted border-gray-400 pb-1">
                            <span>{isVessel ? "PESO ENTRADA :" : "ENTRADA :"}</span>
                            <div className="flex flex-col items-end">
                                <span>
                                    {(ticket.entry_weight).toLocaleString("es-MX")} kg
                                </span>
                                <span className="text-[9px] opacity-70">
                                    {ticket.entry_at || ticket.date}
                                </span>
                            </div>
                        </div>

                        {ticket.net_weight > 0 ? (
                            <div className={`${isVessel ? "space-y-1 mt-1" : "space-y-2 pt-2"}`}>
                                <div className="flex justify-between">
                                    <span>{isVessel ? "PESO BRUTO :" : "BRUTO :"}</span>
                                    <span>
                                        {(ticket.gross_weight).toLocaleString("es-MX")} kg
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{isVessel ? "PESO TARA :" : "TARA :"}</span>
                                    <span>
                                        {(ticket.tare_weight).toLocaleString("es-MX")} kg
                                    </span>
                                </div>
                                <div className={`flex justify-between pt-1 border-t-2 border-black font-bold ${isVessel ? "text-[16px]" : "text-[18px]"}`}>
                                    <span>{isVessel ? "PESO NETO :" : "NETO :"}</span>
                                    <span>
                                        {(ticket.net_weight).toLocaleString("es-MX")} kg
                                    </span>
                                </div>
                                <div className="text-right text-[10px] opacity-70">
                                    {ticket.exit_at || ticket.time}
                                </div>
                            </div>
                        ) : (
                            <div className={`flex items-center justify-center opacity-20 rotate-[-15deg] font-bold border-2 border-dashed border-gray-300 ${isVessel ? "p-4 text-[16px] my-2" : "flex-1 text-[20px] m-4"}`}>
                                PENDIENTE
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Footer / Signatures --- */}
            <div className={`flex justify-between mt-6 px-1 items-end ${isVessel ? "h-16 mb-4" : "h-24 mt-auto mb-2"}`}>
                {[
                    ["Documentador", ticket.documenter],
                    ["Pesador", ticket.weighmaster],
                    ["Operador", ticket.driver],
                ].map(([role, name], idx) => (
                    <div key={idx} className="flex flex-col items-center w-[30%]">
                        <div className="w-full border-b border-black text-center text-[9px] flex items-end justify-center pb-0.5 truncate uppercase">
                            {name}
                        </div>
                        <div className="text-[8px] font-bold text-center mt-1 uppercase">
                            Firma de {role}
                        </div>
                    </div>
                ))}
            </div>

            <div className="absolute top-2 right-2 text-[9px] font-bold opacity-30 tracking-widest">
                {copyName}
            </div>
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
        const params = new URLSearchParams(window.location.search);
        if (params.get("from") === "history") {
            window.close();
            return;
        }

        if (
            ticket.net_weight > 0 ||
            (ticket.operation &&
                ticket.operation.toUpperCase().includes("SALIDA"))
        ) {
            window.location.href = route("scale.index") + "?view=pending";
        } else {
            window.history.back();
        }
    };

    return (
        <div className="bg-gray-200 min-h-screen p-4 print:p-0 print:bg-white text-sm">
            <Head title={`Ticket - ${ticket.ticket_number}`} />

            <style>{`
                @media print {
                    @page {
                        size: ${ticket.is_vessel ? "half-letter portrait" : "letter landscape"};
                        margin: ${ticket.is_vessel ? "0.5cm" : "2.5cm 0.5cm 0.5cm 0.5cm"};
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
                <div className="text-xl font-bold text-gray-800">
                    Vista Previa de Ticket
                </div>
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
