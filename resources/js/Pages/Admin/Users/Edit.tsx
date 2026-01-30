import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import TextInput from "@/Components/TextInput";

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
        // username: user.username, // Username update logic can be tricky, kept possibly read only or editable
        email: user.email,
        role: user.role || "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("admin.users.update", user.id));
    };

    return (
        <DashboardLayout
            user={auth.user}
            header={`Editar Usuario: ${user.name}`}
        >
            <Head title="Editar Usuario" />

            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Nombre Completo
                        </label>
                        <TextInput
                            id="name"
                            type="text"
                            value={data.name}
                            className="mt-1 block w-full"
                            onChange={(e) => setData("name", e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Usuario (Solo Lectura)
                        </label>
                        <TextInput
                            id="username"
                            type="text"
                            value={user.username}
                            className="mt-1 block w-full bg-gray-100"
                            disabled
                        />
                        <p className="text-xs text-gray-500">
                            El nombre de usuario no se puede cambiar.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <TextInput
                            id="email"
                            type="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            onChange={(e) => setData("email", e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Rol
                        </label>
                        <select
                            value={data.role}
                            onChange={(e) => setData("role", e.target.value)}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            required
                        >
                            <option value="">Seleccione un Rol</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.name}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.role} className="mt-2" />
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">
                            Cambiar Contraseña (Opcional)
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nueva Contraseña
                                </label>
                                <TextInput
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    placeholder="Dejar en blanco para mantener la actual"
                                />
                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Confirmar Nueva Contraseña
                                </label>
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full"
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link
                            href={route("admin.users.index")}
                            className="text-sm text-gray-600 hover:text-gray-900 mr-4"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            Actualizar Usuario
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
