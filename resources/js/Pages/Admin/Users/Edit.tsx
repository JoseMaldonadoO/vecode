import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import {
    Pencil,
    ArrowLeft,
    Save,
    User,
    Mail,
    Shield,
    Lock,
    Key,
    IdCard,
    AlertCircle
} from "lucide-react";
import { FormEventHandler } from "react";

export default function Edit({
    auth,
    user,
    roles,
}: {
    auth: any;
    user: any;
    roles: any[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role || "",
        password: "",
        password_confirmation: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route("admin.users.update", user.id));
    };

    return (
        <DashboardLayout user={auth.user} header="Administración de Usuarios">
            <Head title={`Editar Usuario: ${user.name}`} />

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href={route("admin.users.index")}
                        className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver al listado
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-800 to-indigo-900 px-8 py-6 flex items-center">
                        <div className="p-2 bg-blue-700/50 rounded-lg mr-4 shadow-inner">
                            <Pencil className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-xl uppercase tracking-wider">
                                Editar Usuario: <span className="text-blue-200">{user.name}</span>
                            </h3>
                            <p className="text-blue-100/70 text-sm">
                                Modifique la información necesaria o actualice los permisos del usuario.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                            {/* SECTION: Información Personal */}
                            <div className="md:col-span-2">
                                <h4 className="text-gray-900 font-bold mb-2 flex items-center text-lg border-b pb-2">
                                    <IdCard className="w-5 h-5 mr-2 text-blue-600" />
                                    Información Personal
                                </h4>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Nombre Completo
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10"
                                        required
                                    />
                                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                </div>
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10"
                                        required
                                    />
                                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                </div>
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            {/* SECTION: Credenciales de Acceso */}
                            <div className="md:col-span-2 mt-4">
                                <h4 className="text-gray-900 font-bold mb-2 flex items-center text-lg border-b pb-2">
                                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                                    Acceso y Seguridad
                                </h4>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Nombre de Usuario (Solo Lectura)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={user.username}
                                        disabled
                                        className="w-full rounded-lg border-gray-200 bg-gray-50 text-gray-500 py-2.5 pl-10 cursor-not-allowed font-medium"
                                    />
                                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 italic">El nombre de usuario no es editable por motivos de integridad.</p>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Asignar Rol
                                </label>
                                <div className="relative">
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData("role", e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-10 bg-white"
                                        required
                                    >
                                        <option value="">Seleccione un Rol...</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.name}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                    <Shield className="w-5 h-5 text-blue-400 absolute left-3 top-2.5" />
                                </div>
                                <InputError message={errors.role} className="mt-1" />
                            </div>

                            {/* SECTION: Contraseña */}
                            <div className="md:col-span-2 mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
                                    <div>
                                        <h5 className="text-amber-900 font-bold text-sm uppercase tracking-wide">Actualizar Contraseña</h5>
                                        <p className="text-amber-700 text-xs mt-1">
                                            Deje estos campos en blanco si no desea modificar la contraseña actual del usuario.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-amber-800 mb-1 tracking-wider uppercase">
                                            Nueva Contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData("password", e.target.value)}
                                                className="w-full rounded-lg border-amber-200 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 pl-10 text-sm"
                                                placeholder="••••••••"
                                            />
                                            <Key className="w-5 h-5 text-amber-300 absolute left-3 top-2.5" />
                                        </div>
                                        <InputError message={errors.password} className="mt-1" />
                                    </div>

                                    <div className="relative">
                                        <label className="block text-xs font-bold text-amber-800 mb-1 tracking-wider uppercase">
                                            Confirmar Contraseña
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                                className="w-full rounded-lg border-amber-200 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500 py-2.5 pl-10 text-sm"
                                                placeholder="••••••••"
                                            />
                                            <Key className="w-5 h-5 text-amber-300 absolute left-3 top-2.5" />
                                        </div>
                                        <InputError message={errors.password_confirmation} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end gap-3">
                            <Link
                                href={route("admin.users.index")}
                                className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all uppercase tracking-widest"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-bold rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all transform hover:-translate-y-0.5 uppercase tracking-widest"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {processing ? "Guardando..." : "Actualizar Usuario"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
