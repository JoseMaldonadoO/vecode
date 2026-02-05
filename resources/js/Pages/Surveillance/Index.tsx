import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, router } from "@inertiajs/react";
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
    Camera
} from "lucide-react";
import Modal from "@/Components/Modal";
import axios from "axios";
import Swal from "sweetalert2";
import { QrReader } from "react-qr-reader";

export default function Index({ auth, in_plant, history }: { auth: any, in_plant: any[], history: any }) {
    const [activeTab, setActiveTab] = useState("scan");
    const [qrInput, setQrInput] = useState("");
    const [scannedSubject, setScannedSubject] = useState<any>(null);
    const [scannedType, setScannedType] = useState<string>("");
    const [showChecklist, setShowChecklist] = useState(false);
    const [checklistData, setChecklistData] = useState<any>({});
    const [viewingLog, setViewingLog] = useState<any>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [showCamera, setShowCamera] = useState(false);

    // Auto-focus logic for scanner
    useEffect(() => {
        if (activeTab === "scan" && !showChecklist && !showCamera) {
            inputRef.current?.focus();
        }
    }, [activeTab, showChecklist, scannedSubject, showCamera]);

    const processScan = async (code: string) => {
        if (!code) return;

        try {
            const response = await axios.post(route('surveillance.scan'), { qr: code });
            const data = response.data;

            if (data.status === 'in_plant') {
                Swal.fire({
                    icon: 'info',
                    title: 'Ya en planta',
                    text: 'Este operador ya registró su entrada.',
                    timer: 2000
                });
                setQrInput("");
                setShowCamera(false);
            } else {
                setScannedSubject(data.subject);
                setScannedType(data.type);
                setQrInput("");
                setShowCamera(false);
                setShowChecklist(true);
            }
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
            // Do NOT re-focus immediately to allow reading the alert
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
        if (!!error) {
            // console.info(error);
        }
    };

    const submitEntry = (authorized: boolean) => {
        router.post(route('surveillance.store'), {
            subject_id: scannedSubject.id,
            subject_type: scannedType,
            authorized: authorized,
            checklist_data: checklistData
        }, {
            onSuccess: () => {
                setShowChecklist(false);
                setScannedSubject(null);
                setChecklistData({});
                Swal.fire({
                    icon: authorized ? 'success' : 'warning',
                    title: authorized ? 'Acceso Autorizado' : 'Acceso Denegado',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    const markExit = (id: number) => {
        Swal.fire({
            title: '¿Confirmar Salida?',
            text: "Se registrará la fecha y hora actual.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, marcar salida',
            cancelButtonText: 'Cancelar'
        }).then((result: any) => {
            if (result.isConfirmed) {
                router.put(route('surveillance.update', id), {}, {
                    onSuccess: () => {
                        Swal.fire('Salida Registrada', '', 'success');
                    }
                });
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
                            Registro de Acceso
                        </button>
                        <button
                            onClick={() => setActiveTab("in_plant")}
                            className={`flex items-center px-8 py-5 font-bold text-sm uppercase tracking-wider transition-all border-b-4 ${activeTab === "in_plant"
                                ? "border-indigo-600 text-indigo-700 bg-indigo-50/50"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        >
                            <Truck className={`w-5 h-5 mr-2 ${activeTab === "in_plant" ? "text-indigo-600" : "text-gray-400"}`} />
                            En Planta
                            <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${activeTab === "in_plant" ? "bg-indigo-200 text-indigo-800" : "bg-gray-200 text-gray-600"}`}>
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

                        {/* Tab: IN PLANT */}
                        {activeTab === "in_plant" && (
                            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-indigo-800 to-indigo-900 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-indigo-100">Hora Entrada</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-indigo-100">Operador</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-indigo-100">Unidad</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-indigo-100">Tipo</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-indigo-100">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {in_plant.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-16 text-center text-gray-500 bg-gray-50/50">
                                                    <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="font-medium text-lg">No hay unidades registradas en planta actualmente.</p>
                                                    <p className="text-sm">Las entradas registradas aparecerán aquí.</p>
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
                                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow inline-flex items-center font-bold"
                                                        >
                                                            <User className="w-4 h-4 mr-2" />
                                                            VER
                                                        </button>
                                                        <button
                                                            onClick={() => markExit(log.id)}
                                                            className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow hover:ring-2 ring-red-300 font-bold"
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
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-indigo-800 to-indigo-900 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-indigo-100">Tiempos</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-indigo-100">Operador</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-indigo-100">Unidad</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-indigo-100">Tipo</th>
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
                                {/* Pagination could be added here */}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Details Modal */}
            <Modal show={!!viewingLog} onClose={() => setViewingLog(null)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                        <div className="flex items-center">
                            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                <User className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase">Detalles del Operador</h2>
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
                                                    {viewingLog.subject.trailer_plate && (
                                                        <span className="bg-gray-50 px-2 py-1 rounded text-sm font-mono text-gray-600 border border-gray-200">
                                                            {viewingLog.subject.trailer_plate}
                                                        </span>
                                                    )}
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
                                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center mb-2">
                                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Hora de Entrada</p>
                                    </div>
                                    <p className="text-xl font-black text-gray-900">
                                        {new Date(viewingLog.entry_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Autorizado Por</p>
                                    </div>
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

            {/* Authorization Modal */}
            <Modal show={showChecklist} onClose={() => setShowChecklist(false)} maxWidth="2xl">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-gray-900 uppercase">Validación de Acceso</h2>
                        <button onClick={() => setShowChecklist(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    {scannedSubject && (
                        <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-6 mb-8 flex items-start space-x-5 border border-gray-100 shadow-inner">
                            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center border-2 border-gray-100 shadow-sm flex-shrink-0">
                                <User className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-black text-gray-900 uppercase leading-none">{scannedSubject.operator_name || scannedSubject.name}</h3>
                                    {scannedSubject.status === 'vetoed' && (
                                        <span className="flex items-center text-red-600 text-xs font-black bg-red-50 px-2 py-1 rounded border border-red-100 animate-pulse">
                                            <AlertTriangle className="w-3 h-3 mr-1" /> VETADO
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-indigo-600 mt-1">{scannedSubject.transport_line || scannedSubject.transporter_line}</p>
                                <div className="mt-3 flex gap-3">
                                    <div className="bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold mr-2">Placa</span>
                                        <span className="font-mono font-bold text-gray-900">{scannedSubject.tractor_plate}</span>
                                    </div>
                                    <div className="bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold mr-2">Econ</span>
                                        <span className="font-mono font-bold text-gray-900">{scannedSubject.economic_number}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 mb-10 text-center bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100">
                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-md ring-4 ring-indigo-50">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h4 className="font-black text-indigo-900 text-xl uppercase tracking-tight">Validación de Requisitos</h4>
                        <p className="text-indigo-800 font-medium text-lg">
                            Realice el checklist físico correspondiente.
                        </p>
                        <p className="text-sm text-indigo-600 font-bold bg-indigo-100/50 inline-block px-4 py-1 rounded-full">
                            Si el operador cumple con los requisitos, autorice el acceso.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <button
                            onClick={() => submitEntry(false)}
                            className="w-full flex items-center justify-center px-6 py-4 bg-red-50 border-2 border-red-100 rounded-2xl font-black text-red-600 hover:bg-red-100 hover:border-red-200 transition-all uppercase tracking-wide group"
                        >
                            <XCircle className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                            Bloquear Acceso
                        </button>
                        <button
                            onClick={() => submitEntry(true)}
                            className="w-full flex items-center justify-center px-6 py-4 bg-green-600 border-2 border-green-600 rounded-2xl font-black text-white hover:bg-green-700 hover:border-green-700 transition-all shadow-lg shadow-green-200 uppercase tracking-wide group"
                        >
                            <CheckCircle className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                            Autorizar Entrada
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
