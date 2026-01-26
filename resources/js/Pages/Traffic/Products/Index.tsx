import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Box, Plus, ArrowLeft, Search } from 'lucide-react';
import { useState } from 'react';
// @ts-ignore
import { pickBy } from 'lodash';

interface Product {
    id: number;
    code: string;
    name: string;
    default_packaging: string;
}

interface PageProps {
    products: Product[];
    auth: any;
}

export default function Index({ auth, products }: PageProps) {
    const [search, setSearch] = useState('');

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout user={auth.user} header="Lista de Productos">
            <Head title="Productos" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="md:flex md:items-center md:justify-between mb-6">
                    <div className="flex-1 min-w-0">
                        <div className="mb-4">
                            <Link href={route('traffic.index')} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors">
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Volver a Tráfico
                            </Link>
                        </div>
                        <h2 className="text-2xl font-bold leading-7 text-indigo-900 sm:text-3xl sm:truncate flex items-center uppercase tracking-wider">
                            <Box className="mr-3 h-8 w-8 text-indigo-600" />
                            Productos
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        <Link
                            href={route('traffic.products.create')}
                            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
                        >
                            <Plus className="-ml-1 mr-2 h-5 w-5" />
                            Agregar Producto
                        </Link>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
                            placeholder="Buscar por código o nombre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-indigo-800 to-indigo-900">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Código</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Producto</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Presentación</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-indigo-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-700 uppercase tracking-tighter">
                                                {product.code}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                        {product.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium italic">
                                                {product.default_packaging}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                            <Box className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">No se encontraron productos</p>
                                            <p className="text-sm">Intenta ajustar los filtros de búsqueda.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
