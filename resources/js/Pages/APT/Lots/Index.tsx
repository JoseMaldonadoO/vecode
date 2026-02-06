import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Lock,
    Unlock,
    Database,
    Calendar,
    ArrowLeft,
    CheckCircle,
} from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import Swal from "sweetalert2";

export default function Index({ auth, lots, filters }: any) {
    const [search, setSearch] = useState(filters.search || "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLot, setEditingLot] = useState<any>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        folio: "",
        warehouse: "Almacen 1",
        cubicle: "",
        plant_origin: "UREA 1",
        created_at: "", // For editing date
    });

    const handleSearch = (e: any) => {
        if (e.key === "Enter") {
            router.get(
                route("apt.lots.index"),
                { search: search },
                { preserveState: true }
            );
        }
    };

    const openModal = (lot: any = null) => {
        setEditingLot(lot);
        if (lot) {
            setData({
                folio: lot.folio,
                warehouse: lot.warehouse,
                cubicle: lot.cubicle || "",
                plant_origin: lot.plant_origin,
                created_at: lot.created_at ? lot.created_at.substring(0, 16) : "", // Format for datetime-local
            });
        } else {
            reset();
            setData("created_at", new Date().toISOString().substring(0, 16)); // Default current time
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingLot(null);
        reset();
    };

    const submit = (e: any) => {
        e.preventDefault();
        if (editingLot) {
            put(route("apt.lots.update", editingLot.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route("apt.lots.store"), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const toggleStatus = (lot: any) => {
        Swal.fire({
            title: `¿${lot.status === "open" ? "Cerrar" : "Abrir"} lote?`,
            text: `El lote cambiará de estatus.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, cambiar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route("apt.lots.toggle", lot.id));
            }
        });
    };

    const deleteLot = (lot: any) => {
        Swal.fire({
            title: "¿Eliminar lote?",
            text: "Esta acción no se puede deshacer.",
            icon: "error",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("apt.lots.destroy", lot.id));
            }
        });
    };

    return (
        <DashboardLayout user={auth.user} header="Gestión de Lotes (APT)">
            <Head title="Lotes" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link
                            href={route("apt.index")}
                            className="bg-white p-2 rounded-full shadow-sm hover:shadow text-gray-500 hover:text-gray-700 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Buscar Lote..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    <PrimaryButton
                        onClick={() => openModal()}
                        className="bg-teal-600 hover:bg-teal-700"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Crear Lote
                    </PrimaryButton>
                </div>

                {/* Lots Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Folio / Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ubicación
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Planta
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Creado Por
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha Creación
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estatus
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {lots.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center text-gray-400"
                                    >
                                        <Database className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        No hay lotes registrados
                                    </td>
                                </tr>
                            ) : (
                                lots.data.map((lot: any) => (
                                    <tr key={lot.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                {lot.folio}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {lot.warehouse}
                                            </div>
                                            {lot.cubicle && (
                                                <div className="text-xs text-gray-500">
                                                    Cubículo: {lot.cubicle}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lot.plant_origin ===
                                                        "UREA 1"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-purple-100 text-purple-800"
                                                    }`}
                                            >
                                                {lot.plant_origin}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {lot.user?.name || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {new Date(
                                                lot.created_at
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase cursor-pointer select-none transition-colors ${lot.status === "open"
                                                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                        : "bg-red-100 text-red-800 hover:bg-red-200"
                                                    }`}
                                                onClick={() =>
                                                    toggleStatus(lot)
                                                }
                                                title="Clic para cambiar estatus"
                                            >
                                                {lot.status === "open"
                                                    ? "Abierto"
                                                    : "Cerrado"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        openModal(lot)
                                                    }
                                                    className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        toggleStatus(lot)
                                                    }
                                                    className={`p-1 rounded hover:bg-gray-100 ${lot.status === "open"
                                                            ? "text-red-500 hover:text-red-700"
                                                            : "text-green-500 hover:text-green-700"
                                                        }`}
                                                    title={
                                                        lot.status === "open"
                                                            ? "Cerrar"
                                                            : "Abrir"
                                                    }
                                                >
                                                    {lot.status === "open" ? (
                                                        <Lock className="w-4 h-4" />
                                                    ) : (
                                                        <Unlock className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        deleteLot(lot)
                                                    }
                                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {lots.links && lots.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex gap-1">
                            {lots.links.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`px-4 py-2 rounded-lg border ${link.active
                                            ? "bg-teal-600 text-white border-teal-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        } ${!link.url &&
                                        "opacity-50 pointer-events-none"
                                        }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal show={isModalOpen} onClose={closeModal} maxWidth="md">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                        {editingLot ? "Editar Lote" : "Nuevo Lote"}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Nombre del Lote / Folio" />
                            <TextInput
                                value={data.folio}
                                onChange={(e) =>
                                    setData("folio", e.target.value)
                                }
                                className="w-full mt-1"
                                placeholder="Ej: LOTE-2026-001"
                                autoFocus
                            />
                            <InputError
                                message={errors.folio}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Planta Origen" />
                                <select
                                    value={data.plant_origin}
                                    onChange={(e) =>
                                        setData("plant_origin", e.target.value)
                                    }
                                    className="w-full mt-1 border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                >
                                    <option value="UREA 1">UREA 1</option>
                                    <option value="UREA 2">UREA 2</option>
                                </select>
                                <InputError
                                    message={errors.plant_origin}
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <InputLabel value="Almacén" />
                                <select
                                    value={data.warehouse}
                                    onChange={(e) =>
                                        setData("warehouse", e.target.value)
                                    }
                                    className="w-full mt-1 border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                >
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <option
                                            key={n}
                                            value={`Almacen ${n}`}
                                        >{`Almacén ${n}`}</option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.warehouse}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        {/* Cubicle Logic: Only for Warehouse 4 & 5 */}
                        {(data.warehouse === "Almacen 4" ||
                            data.warehouse === "Almacen 5") && (
                                <div className="animate-fade-in-down">
                                    <InputLabel value="Cubículo Asignado" />
                                    <select
                                        value={data.cubicle}
                                        onChange={(e) =>
                                            setData("cubicle", e.target.value)
                                        }
                                        className="w-full mt-1 border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                    >
                                        <option value="">Seleccione...</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                            <option key={n} value={`${n}`}>{`Cubículo ${n}`}</option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={errors.cubicle}
                                        className="mt-2"
                                    />
                                </div>
                            )}

                        <div>
                            <InputLabel value="Fecha de Creación" />
                            <input
                                type="datetime-local"
                                value={data.created_at}
                                onChange={(e) =>
                                    setData("created_at", e.target.value)
                                }
                                className="w-full mt-1 border-gray-300 rounded-lg shadow-sm focus:border-teal-500 focus:ring-teal-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Puede ajustar la fecha si es un registro pasado.
                            </p>
                            <InputError
                                message={errors.created_at}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                            Cancelar
                        </button>
                        <PrimaryButton
                            disabled={processing}
                            className="bg-teal-600 hover:bg-teal-700"
                        >
                            {editingLot ? "Guardar Cambios" : "Crear Lote"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
