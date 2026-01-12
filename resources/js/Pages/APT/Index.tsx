import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, QrCode } from 'lucide-react';

export default function Index({ auth }: { auth: any }) {
    return (
        <DashboardLayout user={auth.user} header="APT">
            <Head title="APT" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
                                {/* 1. Registro de Operadores */}
                                <Link
                                    href={route('apt.operator.create')}
                                    className="group bg-white rounded-xl shadow-lg border border-transparent p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:shadow-indigo-100 transition-all duration-300"
                                >
                                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                                        <Users className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Registro de Operadores</h3>
                                    <p className="text-sm text-gray-500">
                                        Alta de operadores para el barco activo.
                                    </p>
                                </Link>

                                {/* 2. Impresión de QR */}
                                <Link
                                    href={route('apt.qr')}
                                    className="group bg-white rounded-xl shadow-lg border border-transparent p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:shadow-indigo-100 transition-all duration-300"
                                >
                                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                                        <QrCode className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Impresión de QR</h3>
                                    <p className="text-sm text-gray-500">
                                        Buscar operador e imprimir tarjeta con código QR.
                                    </p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </DashboardLayout >
    );
}
