import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
const menuItems = [
    { name: 'Nueva Orden de Embarque', icon: FileText, href: route('documentation.create'), description: 'Crear una nueva orden de embarque.', color: 'bg-indigo-50 text-indigo-600', hover: 'hover:border-indigo-500' },
    { name: 'Muelle', icon: Anchor, href: route('documentation.dock'), description: 'Gestión de operadores y códigos QR.', color: 'bg-amber-50 text-amber-600', hover: 'hover:border-amber-500' },
];

return (
    <DashboardLayout user={auth.user} header="Documentación y Embarques">
        <Head title="Documentación" />

        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center h-64 group border border-gray-100 hover:border-indigo-100"
                        >
                            <div className={`p-4 rounded-full mb-4 ${item.color.split(' ')[0]}`}>
                                <item.icon className={`h-8 w-8 ${item.color.split(' ')[1]}`} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                            <p className="text-gray-500">{item.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    </DashboardLayout>
);
}
