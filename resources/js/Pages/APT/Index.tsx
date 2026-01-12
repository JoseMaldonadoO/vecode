import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, QrCode } from 'lucide-react';

export default function Index({ auth }: { auth: any }) {
    return (
        <DashboardLayout user={auth.user} header="Administración Portuaria">
            <Head title="APT" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Operator Registration */}
                        <Link href={route('apt.operators.create')} className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-64">
                            <div className="bg-green-100 p-4 rounded-full mb-4">
                                <Users className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Registro de Operadores</h3>
                            <p className="text-gray-500">Alta de operadores para el barco activo.</p>
                        </Link>

                        {/* QR Printing */}
                        <Link href={route('apt.qr')} className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-64">
                            <div className="bg-green-100 p-4 rounded-full mb-4">
                                <QrCode className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Impresión de QR</h3>
                            <p className="text-gray-500">Buscar operador e imprimir tarjeta con código QR.</p>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout >
    );
}
