import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";

export default function Edit({
    auth,
    ticket,
    order,
}: {
    auth: any;
    ticket: any;
    order: any;
}) {
    const { data, setData, put, processing, errors, reset } = useForm({
        tare_weight: ticket.tare_weight || 0,
        gross_weight: ticket.gross_weight || 0,
        net_weight: ticket.net_weight || 0,
        observations: order.observation || "",
    });

    // Auto-calculate Net Weight when Tare or Gross changes
    useEffect(() => {
        const net = Math.abs(
            (parseFloat(data.gross_weight) || 0) -
                (parseFloat(data.tare_weight) || 0),
        );
        setData("net_weight", net);
    }, [data.gross_weight, data.tare_weight]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use order.id because the route expects the "id" which I mapped to Order ID in controller logic (or ticket ID? Wait.)
        // In controller: destroyTicket($id) -> find Order($id).
        // updateTicket($id) -> find Order($id).
        // So I must pass Order ID.
        put(route("scale.tickets.update", order.id));
    };

    return (
        <DashboardLayout
            user={auth.user}
            header={`Editar Ticket #${ticket.ticket_number}`}
        >
            <Head title={`Editar Ticket ${ticket.ticket_number}`} />

            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <Link
                        href={route("scale.tickets.index")}
                        className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Volver al Historial
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header Info */}
                    <div className="bg-gray-50 p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                                Folio Orden
                            </span>
                            <div className="text-2xl font-black text-gray-900">
                                {order.folio}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                <span className="font-bold">Cliente:</span>{" "}
                                {order.client_name ||
                                    order.client?.name ||
                                    order.vessel?.client?.name ||
                                    "N/A"}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
                                Estatus
                            </span>
                            <div className="text-lg font-bold text-gray-800 uppercase">
                                {ticket.weighing_status === "completed"
                                    ? "Completado"
                                    : "En Progreso"}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                <span className="font-bold">Chofer:</span>{" "}
                                {order.operator_name || "N/A"}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-8 space-y-6">
                        {/* Weights Section */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                                Ajuste de Pesos (kg)
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-indigo-50 rounded-xl border border-indigo-100">
                                {/* Tare */}
                                <div>
                                    <InputLabel
                                        htmlFor="tare_weight"
                                        value="Peso Tara (Entrada)"
                                        className="text-indigo-900"
                                    />
                                    <TextInput
                                        id="tare_weight"
                                        type="number"
                                        className="mt-1 block w-full font-mono text-lg font-bold text-center border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.tare_weight}
                                        onChange={(e) =>
                                            setData(
                                                "tare_weight",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.tare_weight}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Gross */}
                                <div>
                                    <InputLabel
                                        htmlFor="gross_weight"
                                        value="Peso Bruto (Salida)"
                                        className="text-indigo-900"
                                    />
                                    <TextInput
                                        id="gross_weight"
                                        type="number"
                                        className="mt-1 block w-full font-mono text-lg font-bold text-center border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.gross_weight}
                                        onChange={(e) =>
                                            setData(
                                                "gross_weight",
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.gross_weight}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Net (Read Only usually, but editable if needed? logic says auto-calc) */}
                                <div>
                                    <InputLabel
                                        htmlFor="net_weight"
                                        value="Peso Neto (Calculado)"
                                        className="text-green-700"
                                    />
                                    <TextInput
                                        id="net_weight"
                                        type="number"
                                        className="mt-1 block w-full font-mono text-xl font-black text-center border-green-200 bg-green-50 text-green-800 pointer-events-none"
                                        value={data.net_weight}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="mt-2 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <p>
                                    Advertencia: Modificar los pesos manualmente
                                    afectará los reportes y el inventario.
                                    Asegúrese de tener autorización.
                                </p>
                            </div>
                        </div>

                        {/* Observations */}
                        <div>
                            <InputLabel
                                htmlFor="observations"
                                value="Observaciones / Motivo de Edición"
                            />
                            <textarea
                                id="observations"
                                value={data.observations}
                                onChange={(e) =>
                                    setData("observations", e.target.value)
                                }
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm h-24"
                                placeholder="Especifique por qué se está modificando el ticket..."
                            ></textarea>
                            <InputError
                                message={errors.observations}
                                className="mt-2"
                            />
                        </div>

                        <div className="flex items-center justify-end pt-6 border-t border-gray-100">
                            <Link
                                href={route("scale.tickets.index")}
                                className="mr-4 text-gray-500 hover:text-gray-700 font-medium text-sm underline"
                            >
                                Cancelar
                            </Link>

                            <PrimaryButton
                                disabled={processing}
                                className="px-6 py-3 text-base"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                Guardar Cambios
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
