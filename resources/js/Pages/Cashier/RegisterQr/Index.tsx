import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import { Head } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

interface Props {
    registerUrl: string;
}

const steps = [
    {
        title: 'Open the camera',
        description: 'Ask the customer to open the camera app on their phone.',
    },
    {
        title: 'Scan the code',
        description: 'Have them point the camera at the QR code and tap the link that appears.',
    },
    {
        title: 'Complete the form',
        description: 'They fill in their details and finish signing up on their own.',
    },
];

export default function Index({ registerUrl }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(registerUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <CashierLayout>
            <Head title="Registration QR" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-5xl">
                    <AdminPageHeader
                        eyebrow="Customer Management"
                        title="Registration QR"
                        description="Show this QR code to the customer so they can create their own loyalty account."
                    />

                    <div className="grid gap-6 lg:grid-cols-5">
                        {/* QR card */}
                        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-3">
                            <header className="border-b border-gray-100 px-6 py-5">
                                <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                    Scan to Register
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Hold the screen steady so the customer can scan comfortably.
                                </p>
                            </header>

                            <div className="flex flex-col items-center px-6 py-10">
                                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-gray-100">
                                    <QRCodeSVG
                                        value={registerUrl}
                                        size={260}
                                        level="M"
                                        includeMargin={false}
                                        aria-label="Customer registration QR code"
                                        className="h-auto w-full max-w-[260px]"
                                    />
                                </div>

                                <p className="mt-6 text-center text-xs font-medium uppercase tracking-wider text-gray-400">
                                    Point your camera here
                                </p>
                            </div>

                            <footer className="border-t border-gray-100 bg-gray-50/60 px-6 py-4">
                                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                    Can&apos;t scan? Share the link
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                    <p className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 text-xs text-gray-500 ring-1 ring-gray-200">
                                        {registerUrl}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                                    >
                                        {copied ? 'Copied' : 'Copy link'}
                                    </button>
                                </div>
                            </footer>
                        </section>

                        {/* Instructions card */}
                        <aside className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                            <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                How it works
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Customers sign up on their own phone, no cashier input needed.
                            </p>

                            <ol className="mt-6 space-y-6">
                                {steps.map((step, index) => (
                                    <li key={step.title} className="flex gap-4">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                                            {index + 1}
                                        </span>

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                {step.title}
                                            </h3>
                                            <p className="mt-0.5 text-sm leading-6 text-gray-500">
                                                {step.description}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </aside>
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}