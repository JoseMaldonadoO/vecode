import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import {
    UserX,
    Search,
    QrCode,
    ArrowLeft,
    ShieldAlert,
    Truck,
    CreditCard,
    AlertCircle,
    User,
} from "lucide-react";
import axios from "axios";
// @ts-ignore
import { debounce } from "lodash";

interface Operator {
    id: number;
    name: string;
    transport_line: string;
    unit_type: string;
    tractor_plate: string;
    trailer_plate: string;
    status: string;
}

export default function VetoOperator({ auth }: { auth: any }) {
    const [search, setSearch] = useState("");
    const [operator, setOperator] = useState<Operator | null>(null);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchRef = useRef<HTMLInputElement>(null);

    const fetchOperators = async (query: string) => {
        if (!query) {
            setOperator(null);
            return;
        }

        setSearching(true);
        setError(null);
        try {
            const response = await axios.get(route('surveillance.operators.search'), {
                params: { q: query }
            });

            if (response.data.length > 0) {
                setOperator(response.data[0]);
            } else {
                setOperator(null);
                setError("No se encontró ningún operador con esos datos.");
            }
        } catch (err) {
            console.error(err);
            setError("Error al buscar el operador.");
        } finally {
            setSearching(false);
        }
    };

    const debouncedSearch = useRef(
        debounce((query: string) => fetchOperators(query), 500)
    ).current;

    useEffect(() => {
        // Handle QR input directly or search by text
        if (search.startsWith("OP_EXIT ")) {
            fetchOperators(search);
        } else {
            debouncedSearch(search);
        }
    }, [search]);

    const handleVeto = () => {
        if (!operator) return;

        if (confirm(`¿Está seguro que desea VETAR al operador ${operator.name}? Esta acción restringirá su acceso a la planta.`)) {
            setLoading(true);
            router.post(route('surveillance.operators.veto', operator.id), {}, {
                onSuccess: () => {
                    setLoading(false);
                    // Refresh operator data
                    fetchOperators(search);
                },
                onError: () => setLoading(false)
            });
        }
    };

    return (
        <DashboardLayout user={auth.user} header="Veto de Operadores">
            <Head title="Vigilancia - Vetar Operador" />

            <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8">
                    <Link
                        href={route("surveillance.index")}
                        className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a Menú
                    </Link>
                    <div className="flex items-center">
                        <div className="bg-red-100 p-3 rounded-xl mr-4">
                            <UserX className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase">Control de Acceso</h2>
                            <p className="text-gray-500 text-sm">Escanee el QR o busque al operador por ID/Nombre</p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-8 overflow-hidden relative">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            {searching ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
                            ) : (
                                <Search className="h-6 w-6 text-gray-400" />
                            )}
                        </div>
                        <input
                            ref={searchRef}
                            type="text"
                            autoFocus
                            className="block w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-lg font-bold placeholder-gray-400 transition-all uppercase"
                            placeholder="Buscar por ID, Nombre o Escanear QR..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <QrCode className="h-6 w-6 text-indigo-400" />
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-8 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl flex items-center shadow-sm">
                        <AlertCircle className="w-6 h-6 text-amber-500 mr-3 shrink-0" />
                        <p className="text-amber-800 font-bold">{error}</p>
                    </div>
                )}

                {/* Operator Details Card */}
                {operator ? (
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transform transition-all animate-fade-in-up">
                        <div className={`px-8 py-6 flex items-center justify-between ${operator.status === 'active' ? 'bg-indigo-900 text-white' : 'bg-red-800 text-white'}`}>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm">
                                    <User className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl uppercase tracking-wide leading-none">{operator.name}</h3>
                                    <p className="text-indigo-200 text-xs font-bold mt-1 uppercase">ID: {operator.id}</p>
                                </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${operator.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-white/20 text-red-200 underline'}`}>
                                {operator.status === 'active' ? 'ESTATUS: ACTIVO' : 'ESTATUS: VETADO'}
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div className="bg-gray-100 p-2 rounded-lg mr-4 text-gray-400">
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Línea Transportista</p>
                                            <p className="text-lg font-bold text-gray-800 uppercase leading-none">{operator.transport_line}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="bg-gray-100 p-2 rounded-lg mr-4 text-gray-400">
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Tipo de Unidad</p>
                                            <p className="text-lg font-bold text-gray-800 uppercase leading-none">{operator.unit_type}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative overflow-hidden group">
                                        <CreditCard className="w-12 h-12 text-indigo-50 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Placa Tracto</p>
                                        <p className="text-2xl font-black text-indigo-700 font-mono tracking-wider">{operator.tractor_plate}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative overflow-hidden group">
                                        <CreditCard className="w-12 h-12 text-indigo-50 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Placa Remolque</p>
                                        <p className="text-2xl font-black text-gray-700 font-mono tracking-wider">{operator.trailer_plate || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100">
                                {operator.status === 'active' ? (
                                    <button
                                        onClick={handleVeto}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xl shadow-xl shadow-red-200 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                                    >
                                        <ShieldAlert className="w-7 h-7 mr-3" />
                                        {loading ? 'PROCESANDO...' : 'VETAR OPERADOR'}
                                    </button>
                                ) : (
                                    <div className="bg-red-50 p-6 rounded-2xl flex items-center justify-center border-2 border-dashed border-red-200">
                                        <div className="text-center">
                                            <ShieldAlert className="w-10 h-10 text-red-600 mx-auto mb-3" />
                                            <p className="text-xl font-black text-red-900 uppercase italic">ESTE OPERADOR YA SE ENCUENTRA VETADO</p>
                                            <p className="text-red-600 text-sm mt-1 font-bold">ACCESO RESTRINGIDO POR ADMINISTRACIÓN</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : !searching && !error && search && (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">Esperando identificación...</h3>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
