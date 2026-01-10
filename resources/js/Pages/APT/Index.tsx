import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';

export default function Index({ auth }: { auth: any }) {
    return (
        <DashboardLayout user={auth.user} header="APT">
            <Head title="APT" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            MODULO EN DESARROLLO
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
