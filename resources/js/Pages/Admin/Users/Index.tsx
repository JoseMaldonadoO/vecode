import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, UserPlus, Search } from 'lucide-react';
import Pagination from '@/Components/Pagination';
import { useState, useEffect } from 'react';

// Simple Debounce Hook
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function Index({ auth, users, filters }: { auth: any, users: any, filters: any }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const debouncedSearch = useDebounce(searchTerm, 300);

    // Trigger search when debounced value changes
    useEffect(() => {
        if (debouncedSearch !== filters.search) {
            router.get(
                route('admin.users.index'),
                { search: debouncedSearch },
                { preserveState: true, replace: true }
            );
        }
    }, [debouncedSearch]);


    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            router.delete(route('admin.users.destroy', id));
        }
    };

    return (
        <DashboardLayout user={auth.user} header="Administración de Usuarios">
            <Head title="Usuarios" />

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">

                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-lg font-semibold text-gray-800">Listado de Usuarios</h3>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-4 h-4 text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
                                    placeholder="Buscar usuarios..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <Link
                                href={route('admin.users.create')}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 whitespace-nowrap"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Nuevo Usuario
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.data.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {Array.isArray(user.roles) && user.roles.map((role: string) => (
                                                <span key={role} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                                                    {role}
                                                </span>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.created_at}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={route('admin.users.edit', user.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <Pagination links={users.links} />
                </div>
            </div>
        </DashboardLayout>
    );
}
