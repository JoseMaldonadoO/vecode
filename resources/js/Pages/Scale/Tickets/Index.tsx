import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react'; // Ensure router is imported
import { Search, Calendar, Filter, Download, Edit, Trash2, Printer, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { debounce, pickBy } from 'lodash';
import Swal from 'sweetalert2';

export default function Index({ auth, tickets, filters }: { auth: any, tickets: any, filters: any }) {

    // Search State
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');

    // Debounced Search
    const onSearchChange = useCallback(
        debounce((query: string, dateVal: string) => {
            router.get(
                route('scale.tickets.index'),
                pickBy({ search: query, date: dateVal }),
                { preserveState: true, preserveScroll: true }
            );
        }, 300),
        []
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        onSearchChange(e.target.value, date);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
        onSearchChange(search, e.target.value);
    };

    const clearFilters = () => {
        setSearch('');
        setDate('');
        router.get(route('scale.tickets.index'));
    };

    const confirmDelete = (id: string, folio: string) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará el ticket asociado al Folio ${folio}. La orden volverá a estado "Autorizado". Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'rounded-xl px-6 py-3 font-bold',
                cancelButton: 'rounded-xl px-6 py-3 font-bold'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('scale.tickets.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: '¡Eliminado!',
                            text: 'El ticket ha sido eliminado correctamente.',
                            icon: 'success',
                            confirmButtonColor: '#3085d6',
                            timer: 2000
                        });
                    }
                });
            }
        });
    };

    return (
        <DashboardLayout user={auth.user} header="Historial de Tickets de Báscula">
            <Head title="Historial Tickets" />

            <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        {/* Search */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar folio, chofer, placas..."
                                value={search}
                                onChange={handleSearch}
                                className="pl-10 w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Date */}
                        <div className="relative w-full md:w-48">
                            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={handleDateChange}
                                className="pl-10 w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-gray-600"
                            />
                        </div>
                    </div>

                    {(search || date) && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center text-red-500 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 mr-2" /> Limpiar Filtros
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                    <th className="p-4 border-b">Folio / Ticket</th>
                                    <th className="p-4 border-b">Chofer / Unidad</th>
                                    <th className="p-4 border-b">Producto / Cliente</th>
                                    <th className="p-4 border-b text-right">Pesos (kg)</th>
                                    <th className="p-4 border-b text-center">Estatus</th>
                                    <th className="p-4 border-b text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {tickets.data.length > 0 ? (
                                    tickets.data.map((ticket: any) => (
                                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-900">Folio: {ticket.folio}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{ticket.ticket_number}</div>
                                                <div className="text-xs text-gray-400 mt-1">{ticket.exit_at ? new Date(ticket.exit_at).toLocaleDateString() : 'En proceso'}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-800">{ticket.driver}</div>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded border border-gray-200">{ticket.vehicle_plate}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-indigo-600 font-medium">{ticket.product}</div>
                                                <div className="text-gray-500 text-xs truncate max-w-[200px]" title={ticket.provider}>{ticket.provider}</div>
                                            </td>
                                            <td className="p-4 text-right font-mono">
                                                <div className="text-gray-900"><span className="text-gray-400 text-xs mr-1">Neto:</span>{ticket.net_weight?.toLocaleString()}</div>
                                                <div className="text-gray-500 text-xs"><span className="text-gray-300 mr-1">T:</span>{ticket.tare_weight?.toLocaleString()}</div>
                                                <div className="text-gray-500 text-xs"><span className="text-gray-300 mr-1">B:</span>{ticket.gross_weight?.toLocaleString()}</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                {ticket.status === 'completed' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                                        Completado
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                                        Pendiente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Reprint */}
                                                    <a
                                                        href={route('scale.ticket.print', ticket.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Reimprimir Ticket"
                                                    >
                                                        <Printer className="w-5 h-5" />
                                                    </a>

                                                    {/* Edit */}
                                                    <Link
                                                        href={route('scale.tickets.edit', ticket.id)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar Ticket"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </Link>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => confirmDelete(ticket.id, ticket.folio)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar Ticket"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-gray-400 italic">
                                            No se encontraron tickets con los filtros seleccionados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {tickets.links && tickets.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                            <span className="text-sm text-gray-500">
                                Mostrando {tickets.from} a {tickets.to} de {tickets.total} resultados
                            </span>
                            <div className="flex items-center gap-1">
                                {tickets.links.map((link: any, i: number) => {
                                    // Simple pagination rendering
                                    if (link.url === null) return <span key={i} className="px-3 py-1 text-gray-400 text-sm" dangerouslySetInnerHTML={{ __html: link.label }}></span>;
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${link.active
                                                    ? 'bg-indigo-600 text-white shadow-md'
                                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
