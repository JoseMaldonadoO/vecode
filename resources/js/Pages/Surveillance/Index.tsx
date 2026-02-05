import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, router, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import {
    Scan,
    User,
    CheckCircle,
    XCircle,
    Clock,
    Truck,
    Search,
    History,
    FileText,
    LogOut,
    AlertTriangle,
    Camera,
    Calendar,
    ChevronRight
} from "lucide-react";
import Modal from "@/Components/Modal";
import axios from "axios";
import Swal from "sweetalert2";
import { QrReader } from "react-qr-reader";

export default function Index({ auth, pending_logs, in_plant, history }: { auth: any, pending_logs: any[], in_plant: any[], history: any }) {
    const [activeTab, setActiveTab] = useState("scan");
    const [qrInput, setQrInput] = useState("");
    const [viewingLog, setViewingLog] = useState<any>(null);
    const [exitModalLog, setExitModalLog] = useState<any>(null);
    const [exitDateTime, setExitDateTime] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);
    const [showCamera, setShowCamera] = useState(false);

    // Auto-focus logic for scanner
    useEffect(() => {
        if (activeTab === "scan" && !showCamera) {
            inputRef.current?.focus();
        }
    }, [activeTab, showCamera]);

    const processScan = async (code: string) => {
        if (!code) return;

        try {
            const response = await axios.post(route('surveillance.scan'), { qr: code });
            const data = response.data;

            // Success Notification
            Swal.fire({
                icon: 'success',
                title: 'Escaneado',
                text: data.message || 'Operador agregado a pendientes.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });

            setQrInput("");
            setShowCamera(false);

            // Optionally redirect to pending tab
            // setActiveTab("pending");

        } catch (error: any) {
            console.error("Scan Error Details:", error);
            const errorMessage = error.response?.data?.error || 'Error de conexión o código inválido';

            Swal.fire({
                icon: 'error',
                title: 'Error de Escaneo',
                html: `<p class="text-lg">${errorMessage}</p><p class="text-xs text-gray-400 mt-2">Intento: ${code}</p>`,
                timer: 4000,
                showConfirmButton: true
            });

            setQrInput("");
        }
    };

    const handleManualScan = (e: React.FormEvent) => {
        e.preventDefault();
        processScan(qrInput);
    };

    const handleCameraScan = (result: any, error: any) => {
        if (!!result) {
            processScan(result?.text);
            setShowCamera(false);
        }
    };

    const authorizeLog = (logId: number, authorized: boolean) => {
        Swal.fire({
            title: authorized ? '¿Autorizar Ingreso?' : '¿Denegar Ingreso?',
            text: authorized ? "Se registrará la hora de entrada actual." : "El operador será rechazado.",
            icon: authorized ? 'success' : 'warning',
            showCancelButton: true,
            confirmButtonText: authorized ? 'Sí, autorizar' : 'Sí, rechazar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('surveillance.store'), {
                    log_id: logId,
                    authorized: authorized
                }, {
                    onSuccess: () => {
                        // Success toast
                    }
                });
            }
        });
    };

    const handleExitSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!exitDateTime) return;

        router.put(route('surveillance.update', exitModalLog.id), {
            exit_at: exitDateTime
        }, {
            onSuccess: () => {
                setExitModalLog(null);
                setExitDateTime("");
                Swal.fire('Salida Registrada', '', 'success');
            }
        });
    };

    return (
        <DashboardLayout user={auth.user} header="Vigilancia y Control de Acceso">
            <Head title="Vigilancia" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Header Section */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black text-indigo-900 uppercase tracking-tight flex items-center">
                                <Scan className="w-8 h-8 mr-3 text-indigo-600" />
                                Vigilancia y Control de Acceso
                            </h2>
                            <p className="text-gray-500 text-sm font-medium ml-11">
                                Gestión de entradas, salidas y seguridad en planta
                            </p>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="bg-white rounded-t-2xl border-b border-gray-200 flex overflow-x-auto shadow-sm">
                        <button
                            onClick={() => setActiveTab("scan")}
                            className={`flex items-center px-8 py-5 font-bold text-sm uppercase tracking-wider transition-all border-b-4 ${activeTab === "scan"
                                ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        >
                            <Scan className={`w-5 h-5 mr-2 ${activeTab === "scan" ? "text-indigo-600" : "text-gray-400"}`} />
                            Registro Escaneo
                        </button>
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={`flex items-center px-8 py-5 font-bold text-sm uppercase tracking-wider transition-all border-b-4 ${activeTab === "pending"
                                ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        >
                            <Clock className={`w-5 h-5 mr-2 ${activeTab === "pending" ? "text-indigo-600" : "text-gray-400"}`} />
                            Pendientes
                            <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${activeTab === "pending" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                                {pending_logs.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab("in_plant")}
                            className={`flex items-center px-8 py-5 font-bold text-sm uppercase tracking-wider transition-all border-b-4 ${activeTab === "in_plant"
                                ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        >
                            <Truck className={`w-5 h-5 mr-2 ${activeTab === "in_plant" ? "text-indigo-600" : "text-gray-400"}`} />
                            En Planta
                            <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${activeTab === "in_plant" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                                {in_plant.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`flex items-center px-8 py-5 font-bold text-sm uppercase tracking-wider transition-all border-b-4 ${activeTab === "history"
                                ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        >
                            <History className={`w-5 h-5 mr-2 ${activeTab === "history" ? "text-indigo-600" : "text-gray-400"}`} />
                            Historial
                        </button>
                    </div>

                    <div className="bg-white rounded-b-2xl shadow-xl border border-gray-100 p-8 min-h-[600px]">

                        {/* Tab: SCAN */}
                        {activeTab === "scan" && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-10">
                                <div className="text-center space-y-4">
                                    <div className="bg-indigo-50 p-6 rounded-3xl inline-block mb-2 shadow-inner">
                                        <Scan className="w-16 h-16 text-indigo-600" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Escáner de Acceso</h2>
                                    <p className="text-gray-500 text-lg max-w-md mx-auto">Escanea el código QR del operador (Barco o Salida) o ingresa manualmente el ID.</p>
                                </div>

                                {showCamera ? (
                                    <div className="w-full max-w-sm mx-auto bg-black rounded-3xl overflow-hidden relative shadow-2xl ring-4 ring-indigo-100">
                                        <QrReader
                                            onResult={handleCameraScan}
                                            constraints={{ facingMode: "environment" }}
                                            className="w-full h-80 object-cover"
                                        />
                                        <button
                                            onClick={() => setShowCamera(false)}
                                            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white/40 transition-all"
                                        >
                                            <XCircle className="w-8 h-8" />
                                        </button>
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                            <p className="text-white text-center font-bold animate-pulse">Buscando código QR...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full max-w-lg space-y-6">
                                        <form onSubmit={handleManualScan} className="w-full relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Search className="h-6 w-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            </div>
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={qrInput}
                                                onChange={(e) => setQrInput(e.target.value)}
                                                className="block w-full pl-12 pr-32 py-5 border-2 border-gray-100 bg-gray-50 rounded-2xl focus:ring-0 focus:border-indigo-500 focus:bg-white text-xl font-bold shadow-sm transition-all placeholder-gray-400"
                                                placeholder="Escanear o escribir ID..."
                                                autoComplete="off"
                                            />
                                            <button
                                                type="submit"
                                                className="absolute inset-y-2 right-2 px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-md transition-all flex items-center"
                                            >
                                                BUSCAR
                                            </button>
                                        </form>

                                        <div className="relative flex py-2 items-center">
                                            <div className="flex-grow border-t border-gray-200"></div>
                                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">O utiliza la cámara</span>
                                            <div className="flex-grow border-t border-gray-200"></div>
                                        </div>

                                        <button
                                            onClick={() => setShowCamera(true)}
                                            className="w-full flex items-center justify-center px-6 py-5 border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl text-indigo-600 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all group font-bold text-lg"
                                        >
                                            <Camera className="w-7 h-7 mr-3 group-hover:scale-110 transition-transform" />
                                            ACTIVAR CÁMARA
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: PENDING */}
                        {activeTab === "pending" && (
                            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white text-left">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-100">Escaneado</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-100">Operador</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-100">Unidad</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-100">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {pending_logs.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-16 text-center text-gray-500 bg-gray-50/50">
                                                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="font-medium text-lg">No hay unidades en espera.</p>
                                                    <p className="text-sm">Escanea un código QR para agregarlo a esta lista.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            pending_logs.map((log) => (
                                                <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-200 text-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center text-gray-900">
                                                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-gray-900 uppercase">
                                                            {log.subject?.operator_name || log.subject?.name || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-medium">
                                                            Línea: {log.subject?.transport_line || log.subject?.transporter_line || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-gray-900 font-mono">
                                                            {log.subject?.tractor_plate}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                        <button
                                                            onClick={() => authorizeLog(log.id, false)}
                                                            className="text-red-600 hover:text-white hover:bg-red-600 border border-red-600 px-4 py-2 rounded-lg transition-all font-black text-xs uppercase"
                                                        >
                                                            Denegar
                                                        </button>
                                                        <button
                                                            onClick={() => authorizeLog(log.id, true)}
                                                            className="bg-green-600 text-white hover:bg-green-700 px-5 py-2 rounded-lg transition-all shadow-md font-black text-xs uppercase"
                                                        >
                                                            Autorizar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Tab: IN PLANT */}
                        {activeTab === "in_plant" && (
                            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-lg">
                                <table className="min-w-full divide-y divide-gray-200 text-left">
                                    <thead className="bg-gradient-to-r from-indigo-800 to-indigo-900 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-100">Entrada</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-100">Operador</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-100">Unidad</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-100">Tipo</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-indigo-100">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {in_plant.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-16 text-center text-gray-500 bg-gray-50/50">
                                                    <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="font-medium text-lg">No hay unidades en planta actualmente.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            in_plant.map((log) => (
                                                <tr key={log.id} className="hover:bg-indigo-50/50 transition-colors duration-200 text-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center text-gray-900">
                                                            <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                                                            {new Date(log.entry_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-bold ml-6">
                                                            {new Date(log.entry_at).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-gray-900 uppercase">
                                                            {log.subject?.operator_name || log.subject?.name || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-medium">
                                                            Lic: {log.subject?.license || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-gray-900 font-mono">
                                                            {log.subject?.tractor_plate}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Econ: <span className="font-bold">{log.subject?.economic_number}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wide ${log.subject_type.includes('Vessel')
                                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                            : 'bg-green-100 text-green-800 border border-green-200'
                                                            }`}>
                                                            {log.subject_type.includes('Vessel') ? 'Barco/Muelle' : 'Salida/Doc'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                        <button
                                                            onClick={() => setViewingLog(log)}
                                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-4 py-2 rounded-lg transition-all shadow-sm font-bold"
                                                        >
                                                            DETALLES
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setExitModalLog(log);
                                                                // Pre-fill current local datetime
                                                                const now = new Date();
                                                                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                                                                setExitDateTime(now.toISOString().slice(0, 16));
                                                            }}
                                                            className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all shadow-sm font-bold"
                                                        >
                                                            MARCAR SALIDA
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Tab: HISTORY */}
                        {activeTab === "history" && (
                            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-lg">
                                <table className="min-w-full divide-y divide-gray-200 text-left">
                                    <thead className="bg-gradient-to-r from-indigo-800 to-indigo-900 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-100">Tiempos</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-100">Operador</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-100">Unidad</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-100">Tipo</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-indigo-100">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {history.data.map((log: any) => (
                                            <tr key={log.id} className="hover:bg-indigo-50/50 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center text-green-700 font-medium mb-1">
                                                        <span className="w-12 text-xs uppercase font-bold text-gray-400">Entró:</span>
                                                        {new Date(log.entry_at).toLocaleString()}
                                                    </div>
                                                    <div className="flex items-center text-red-700 font-medium">
                                                        <span className="w-12 text-xs uppercase font-bold text-gray-400">Salió:</span>
                                                        {new Date(log.exit_at).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="font-bold uppercase text-gray-800">
                                                        {log.subject?.operator_name || log.subject?.name}
                                                    </div>
                                                    {log.subject?.status === 'vetoed' && (
                                                        <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                                            VETADO
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                        {log.subject?.tractor_plate}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wide ${log.subject_type.includes('Vessel')
                                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                        : 'bg-green-100 text-green-800 border border-green-200'
                                                        }`}>
                                                        {log.subject_type.includes('Vessel') ? 'Barco' : 'Salida'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => setViewingLog(log)}
                                                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-all shadow-sm inline-flex items-center font-bold text-xs uppercase"
                                                    >
                                                        <User className="w-3 h-3 mr-1.5" />
                                                        Ver
                                                    </button>

                                                    {!log.subject_type.includes('Vessel') && (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(log.subject?.status === 'active'
                                                                    ? `¿Está seguro que desea VETAR al operador ${log.subject?.name}?`
                                                                    : `¿Desea ACTIVAR nuevamente al operador ${log.subject?.name}?`)) {
                                                                    router.patch(route('documentation.exit-operators.toggle', log.subject.id));
                                                                }
                                                            }}
                                                            className={`inline-flex items-center px-3 py-1.5 rounded-lg border transition-all shadow-sm font-bold text-xs uppercase ${log.subject?.status === 'active'
                                                                    ? 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'
                                                                    : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'
                                                                }`}
                                                        >
                                                            {log.subject?.status === 'active' ? (
                                                                <>
                                                                    <AlertTriangle className="w-3 h-3 mr-1.5" />
                                                                    Vetar
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-3 h-3 mr-1.5" />
                                                                    Activar
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Manual Exit Modal */}
            <Modal show={!!exitModalLog} onClose={() => setExitModalLog(null)} maxWidth="md">
                <form onSubmit={handleExitSubmit} className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-gray-900 uppercase flex items-center">
                            <Clock className="w-6 h-6 mr-3 text-red-600" />
                            Registrar Salida
                        </h2>
                        <button type="button" onClick={() => setExitModalLog(null)} className="text-gray-400 hover:text-gray-600">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase mb-2">Operador</p>
                            <p className="text-xl font-black text-gray-900 border-b pb-2">
                                {exitModalLog?.subject?.operator_name || exitModalLog?.subject?.name}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 uppercase flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Fecha y Hora de Salida
                            </label>
                            <input
                                type="datetime-local"
                                value={exitDateTime}
                                onChange={(e) => setExitDateTime(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-lg font-bold text-indigo-900 focus:border-indigo-500 focus:ring-0 transition-all"
                                required
                            />
                            <p className="text-xs text-gray-400">Ingresa el momento exacto en que la unidad cruzó la salida.</p>
                        </div>
                    </div>

                    <div className="mt-10 flex gap-4">
                        <button
                            type="button"
                            onClick={() => setExitModalLog(null)}
                            className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-wide text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-3 bg-red-600 text-white font-black py-4 px-8 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 uppercase tracking-wide text-sm"
                        >
                            Confirmar Salida
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Details Modal (Shared for In-Plant and History) */}
            <Modal show={!!viewingLog} onClose={() => setViewingLog(null)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                        <div className="flex items-center">
                            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                <User className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase">Detalles del Registro</h2>
                        </div>
                        <button onClick={() => setViewingLog(null)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    {viewingLog && viewingLog.subject && (
                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 border border-indigo-100 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-100 rounded-full opacity-50 blur-2xl"></div>
                                <div className="flex items-start space-x-6 relative z-10">
                                    <div className="h-24 w-24 bg-white rounded-2xl flex items-center justify-center border-2 border-indigo-50 shadow-md flex-shrink-0">
                                        <Truck className="w-12 h-12 text-indigo-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-3xl font-black text-gray-900 uppercase leading-none mb-2 tracking-tight">
                                            {viewingLog.subject.operator_name || viewingLog.subject.name}
                                        </h3>
                                        <div className="inline-block px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
                                            {viewingLog.subject.transport_line || viewingLog.subject.transporter_line}
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 mt-2">
                                            <div className="bg-white/80 p-3 rounded-xl border border-indigo-50 shadow-sm">
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Placas</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono font-bold text-gray-900 border border-gray-200">
                                                        {viewingLog.subject.tractor_plate}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-white/80 p-3 rounded-xl border border-indigo-50 shadow-sm">
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Unidad</p>
                                                <p className="text-sm text-gray-800 font-bold mt-1">
                                                    {viewingLog.subject.unit_type}
                                                </p>
                                                <p className="text-xs text-indigo-500 font-bold">
                                                    #{viewingLog.subject.economic_number}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Hora de Entrada</p>
                                    <p className="text-xl font-black text-gray-900">
                                        {new Date(viewingLog.entry_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Autorizado Por</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {viewingLog.user?.name || 'Sistema'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={() => setViewingLog(null)}
                            className="bg-gray-100 text-gray-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-wide text-sm"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
