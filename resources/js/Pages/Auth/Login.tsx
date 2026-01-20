import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex items-center justify-center p-4 min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/Fondo.jpg')" }}>
            <Head title="Log in" />

            <div className="w-full max-w-md glass-panel rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.01]" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>

                {/* Header / Logo */}
                <div className="bg-white p-6 flex justify-center border-b border-gray-100">
                    <img src="/img/Logo_vde.png" alt="Logo" className="h-16 object-contain" />
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <img src="/img/Proagro2.png" alt="Proagro" className="h-20 mx-auto mb-4 object-contain" />
                        <h2 className="text-2xl font-bold text-gray-800">Bienvenido al Sistema VECODE</h2>
                        <p className="text-gray-500 text-sm">Ingrese sus credenciales para continuar</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6" autoComplete="off">

                        {/* Usuario */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-user text-gray-400"></i>
                                </div>
                                <TextInput
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={data.username}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-gray-50 bg-opacity-50 placeholder-gray-400 text-gray-900"
                                    placeholder="Ingrese su usuario"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('username', e.target.value)}
                                />
                            </div>
                            <InputError message={errors.username} className="mt-2" />
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-lock text-gray-400"></i>
                                </div>
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors bg-gray-50 bg-opacity-50 placeholder-gray-400 text-gray-900"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-gray-400 hover:text-gray-600 transition-colors`}></i>
                                </div>
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {status && (
                            <div className="text-red-500 text-xs mt-1">
                                {status}
                            </div>
                        )}

                        {/* Botón */}
                        <button type="submit" disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-0.5">
                            Entrar <i className="fas fa-arrow-right ml-2 mt-0.5"></i>
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}
