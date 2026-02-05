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
            Swal.fire({
                icon: 'error',
                title: 'No encontrado',
                text: error.response?.data?.error || 'Código QR no válido',
                timer: 1500
            });
            setQrInput("");
            // Keep camera open on error to try again? Or close?
            // Usually better to keep open or delay slightly
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
        <DashboardLayout user={auth.user} header="Vigilancia (Control de Acceso)">
            <Head title="Vigilancia" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Tabs Navigation */}
                    <div className="bg-white rounded-t-xl border-b border-gray-200 flex overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("scan")}
                            className={`flex items-center px-6 py-4 font-medium transition-colors ${activeTab === "scan" ? "border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        >
                            <Scan className="w-5 h-5 mr-2" />
                            Registro de Acceso
                        </button>
                        <button
                            onClick={() => setActiveTab("in_plant")}
                            className={`flex items-center px-6 py-4 font-medium transition-colors ${activeTab === "in_plant" ? "border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        >
                            <Truck className="w-5 h-5 mr-2" />
                            En Planta ({in_plant.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`flex items-center px-6 py-4 font-medium transition-colors ${activeTab === "history" ? "border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        >
                            <History className="w-5 h-5 mr-2" />
                            Historial
                        </button>
                    </div>

                    <div className="bg-white rounded-b-xl shadow-sm p-6 min-h-[500px]">

                        {/* Tab: SCAN */}
                        {activeTab === "scan" && (
                            <div className="flex flex-col items-center justify-center py-10 space-y-8">
                                <div className="text-center">
                                    <div className="bg-indigo-100 p-4 rounded-full inline-block mb-4">
                                        <Scan className="w-12 h-12 text-indigo-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">Escáner de Acceso</h2>
                                    <p className="text-gray-500">Escanea el código QR del operador (Barco o Salida)</p>
                                </div>

                                {showCamera ? (
                                    <div className="w-full max-w-sm mx-auto bg-black rounded-lg overflow-hidden relative">
                                        <QrReader
                                            onResult={handleCameraScan}
                                            constraints={{ facingMode: "environment" }}
                                            className="w-full h-64 object-cover"
                                        />
                                        <button
                                            onClick={() => setShowCamera(false)}
                                            className="absolute top-2 right-2 p-2 bg-white/80 rounded-full text-gray-600 hover:bg-white"
                                        >
                                            <XCircle className="w-6 h-6" />
                                        </button>
                                        <p className="text-white text-center py-2 text-sm">Apuntando cámara...</p>
                                    </div>
                                ) : (
                                    <div className="w-full max-w-md space-y-4">
                                        <form onSubmit={handleManualScan} className="w-full">
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Search className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    ref={inputRef}
                                                    type="text"
                                                    value={qrInput}
                                                    onChange={(e) => setQrInput(e.target.value)}
                                                    className="block w-full pl-10 pr-3 py-4 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-lg shadow-sm"
                                                    placeholder="Esperando lectura de QR..."
                                                    autoComplete="off"
                                                />
                                                <button
                                                    type="submit"
                                                    className="absolute inset-y-0 right-0 px-4 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 font-medium transition-colors"
                                                >
                                                    Buscar
                                                </button>
                                            </div>
                                        </form>

                                        <div className="text-center">
                                            <span className="text-gray-400 text-sm">O usa la cámara</span>
                                        </div>

                                        <button
                                            onClick={() => setShowCamera(true)}
                                            className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all group"
                                        >
                                            <Camera className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                                            <span className="font-medium">Abrir Cámara</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: IN PLANT */}
                        {activeTab === "in_plant" && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Entrada</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operador</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {in_plant.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                                    No hay unidades registradas en planta actualmente.
                                                </td>
                                            </tr>
                                        ) : (
                                            in_plant.map((log) => (
                                                <tr key={log.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {new Date(log.entry_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        <br />
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(log.entry_at).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {log.subject?.operator_name || log.subject?.name || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {log.subject?.license || 'Licencia N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {log.subject?.tractor_plate}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Econ: {log.subject?.economic_number}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.subject_type.includes('Vessel')
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {log.subject_type.includes('Vessel') ? 'Barco/Muelle' : 'Salida/Doc'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => markExit(log.id)}
                                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                                                        >
                                                            Marcar Salida
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
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada / Salida</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operador</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {history.data.map((log: any) => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div>In: {new Date(log.entry_at).toLocaleString()}</div>
                                                    <div className="text-gray-900 font-medium">Out: {new Date(log.exit_at).toLocaleString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.subject?.operator_name || log.subject?.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {log.subject?.tractor_plate}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.subject_type.includes('Vessel')
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {log.subject_type.includes('Vessel') ? 'Barco' : 'Salida'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        Completado
                                                    </span>
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

            {/* Checklist Modal */}
            <Modal show={showChecklist} onClose={() => setShowChecklist(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Validación de Acceso</h2>
                        <button onClick={() => setShowChecklist(false)} className="text-gray-400 hover:text-gray-600">
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>

                    {scannedSubject && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-start space-x-4">
                            <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0">
                                <User className="w-8 h-8 text-gray-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{scannedSubject.operator_name || scannedSubject.name}</h3>
                                <p className="text-sm text-gray-500">{scannedSubject.transport_line || scannedSubject.transporter_line}</p>
                                <div className="mt-2 text-xs flex space-x-2">
                                    <span className="bg-white border px-2 py-0.5 rounded">
                                        Placa: <strong>{scannedSubject.tractor_plate}</strong>
                                    </span>
                                    <span className="bg-white border px-2 py-0.5 rounded">
                                        Econ: <strong>{scannedSubject.economic_number}</strong>
                                    </span>
                                </div>
                                {scannedSubject.status === 'vetoed' && (
                                    <div className="mt-2 flex items-center text-red-600 text-sm font-bold bg-red-50 p-1 rounded">
                                        <AlertTriangle className="w-4 h-4 mr-1" /> OPERADOR VETADO
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 mb-8">
                        <h4 className="font-medium text-gray-700 border-b pb-2">Checklist de Seguridad</h4>

                        {['Licencia Vigente', 'Casco de Seguridad', 'Chaleco Reflejante', 'Botas de Seguridad', 'Unidad Limpia/Vacia'].map((item) => (
                            <label key={item} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    onChange={(e) => setChecklistData({ ...checklistData, [item]: e.target.checked })}
                                />
                                <span className="text-gray-700 font-medium">{item}</span>
                            </label>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => submitEntry(false)}
                            className="w-full flex items-center justify-center px-4 py-3 bg-red-100 border border-transparent rounded-lg font-semibold text-red-700 hover:bg-red-200 transition-colors"
                        >
                            <XCircle className="w-5 h-5 mr-2" />
                            Bloquear Acceso
                        </button>
                        <button
                            onClick={() => submitEntry(true)}
                            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 border border-transparent rounded-lg font-semibold text-white hover:bg-green-700 transition-colors shadow-sm"
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Autorizar Entrada
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
