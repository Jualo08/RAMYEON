import { Head } from '@inertiajs/react';

import { useRef, useState } from 'react';

import { QRCodeSVG } from 'qrcode.react';

import CustomerLayout from '@/Layouts/CustomerLayout';

import CustomerPageHeader from '@/Components/CustomerPageHeader';

type Customer = {
    id: number;
    customer_code: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string | null;
    points: number;
    qr_token: string | null;
};

type DashboardProps = {
    customer: Customer;
};

function MaterialIcon({
    name,
    className = '',
}: {
    name: string;
    className?: string;
}) {
    return (
        <span
            className={`material-symbols-outlined ${className}`}
            aria-hidden="true"
        >
            {name}
        </span>
    );
}

export default function Dashboard({ customer }: DashboardProps) {
    const qrContainerRef = useRef<HTMLDivElement>(null);
    const [savingQr, setSavingQr] = useState(false);
    const [qrSaveError, setQrSaveError] = useState<string | null>(null);

    const handleSaveQr = async () => {
        const svg = qrContainerRef.current?.querySelector('svg');
        if (!svg) {
            return;
        }

        setSavingQr(true);
        setQrSaveError(null);

        let objectUrl: string | null = null;

        try {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svg);
            const svgBlob = new Blob([svgString], {
                type: 'image/svg+xml;charset=utf-8',
            });
            objectUrl = URL.createObjectURL(svgBlob);

            const image = new Image();

            await new Promise<void>((resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = () =>
                    reject(new Error('Failed to load QR image'));
                image.src = objectUrl as string;
            });

            const scale = 2;
            const size = 200;
            const padding = 32;
            const totalSize = size + padding * 2;

            const canvas = document.createElement('canvas');
            canvas.width = totalSize * scale;
            canvas.height = totalSize * scale;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Canvas not supported');
            }

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
                image,
                padding * scale,
                padding * scale,
                size * scale,
                size * scale,
            );

            URL.revokeObjectURL(objectUrl);
            objectUrl = null;

            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, 'image/png'),
            );

            if (!blob) {
                throw new Error('Failed to generate PNG');
            }

            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `Ramyeon-Loyalty-QR-${customer.customer_code}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
        } catch {
            setQrSaveError('Could not save the QR code. Please try again.');
        } finally {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
            setSavingQr(false);
        }
    };

    const details = [
        {
            icon: 'person',
            label: 'Name',
            value: `${customer.first_name} ${customer.last_name}`,
        },
        {
            icon: 'call',
            label: 'Phone Number',
            value: customer.phone_number,
        },
        {
            icon: 'mail',
            label: 'Email',
            value: customer.email ?? 'Not provided',
            muted: !customer.email,
        },
        {
            icon: 'badge',
            label: 'Customer Code',
            value: customer.customer_code,
        },
    ];

    return (
        <CustomerLayout>
            <Head title="My Loyalty Dashboard" />

            <div className="min-h-screen bg-slate-50">
                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {/* Welcome */}
                    <CustomerPageHeader
                        eyebrow="Ramyeon Corner Loyalty"
                        title={`Welcome, ${customer.first_name}`}
                        description="Keep track of your loyalty points and use them when you're ready to redeem a reward."
                    />

                    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                        {/* Loyalty card */}
                        <section
                            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-700 to-red-900 p-6 text-white shadow-lg shadow-red-900/20 sm:p-8 lg:col-start-1"
                            aria-label="Loyalty card"
                        >
                            {/* Decorative rings */}
                            <div
                                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border-[28px] border-white/5"
                                aria-hidden="true"
                            />
                            <div
                                className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-black/10"
                                aria-hidden="true"
                            />

                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-100">
                                        Ramyeon Corner
                                    </p>
                                    <p className="mt-0.5 text-sm font-medium text-white/80">
                                        Loyalty Member
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                                    <MaterialIcon
                                        name="stars"
                                        className="text-[24px] text-white"
                                    />
                                </div>
                            </div>

                            <div className="relative mt-10">
                                <p className="text-sm font-medium text-red-100">
                                    Available balance
                                </p>

                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
                                        {customer.points.toLocaleString()}
                                    </span>
                                    <span className="text-base font-medium text-red-100">
                                        points
                                    </span>
                                </div>

                                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/15">
                                    <MaterialIcon
                                        name="payments"
                                        className="text-[16px]"
                                    />
                                    ₱{customer.points.toLocaleString()}{' '}
                                    equivalent value
                                </p>
                            </div>

                            <div className="relative mt-10 flex items-end justify-between gap-4 border-t border-white/15 pt-5">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-200">
                                        Member
                                    </p>
                                    <p className="mt-1 truncate text-base font-semibold">
                                        {customer.first_name}{' '}
                                        {customer.last_name}
                                    </p>
                                </div>

                                <div className="shrink-0 text-right">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-200">
                                        Customer code
                                    </p>
                                    <p className="mt-1 font-mono text-sm font-medium tracking-wider">
                                        {customer.customer_code}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* QR code (sits beside the card on desktop, right after it on mobile) */}
                        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-start-2 lg:row-span-2 lg:row-start-1">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
                                    My QR Code
                                </p>
                                <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900">
                                    Scan for Loyalty
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Show this QR code to the cashier when
                                    making a purchase.
                                </p>
                            </div>

                            <div className="flex flex-1 items-center justify-center py-8">
                                {customer.qr_token ? (
                                    <div className="relative rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
                                        {/* Scanner corner marks */}
                                        <span
                                            className="absolute left-3 top-3 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-red-600"
                                            aria-hidden="true"
                                        />
                                        <span
                                            className="absolute right-3 top-3 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-red-600"
                                            aria-hidden="true"
                                        />
                                        <span
                                            className="absolute bottom-3 left-3 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-red-600"
                                            aria-hidden="true"
                                        />
                                        <span
                                            className="absolute bottom-3 right-3 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-red-600"
                                            aria-hidden="true"
                                        />

                                        <div
                                            ref={qrContainerRef}
                                            className="inline-flex rounded-xl bg-white p-4 shadow-sm"
                                        >
                                            <QRCodeSVG
                                                value={customer.qr_token}
                                                size={200}
                                                level="H"
                                                bgColor="#ffffff"
                                                fgColor="#000000"
                                                className="block h-auto max-w-full"
                                                aria-label="Customer loyalty QR code"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex min-h-[260px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                                        <div>
                                            <MaterialIcon
                                                name="qr_code_2"
                                                className="text-[36px] text-slate-400"
                                            />

                                            <p className="mt-2 text-sm font-medium text-slate-700">
                                                QR code unavailable
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                Please contact the staff for
                                                assistance.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {customer.qr_token && (
                                <div className="pb-5">
                                    <button
                                        type="button"
                                        onClick={handleSaveQr}
                                        disabled={savingQr}
                                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <MaterialIcon
                                            name={
                                                savingQr
                                                    ? 'progress_activity'
                                                    : 'download'
                                            }
                                            className={`text-[20px] ${
                                                savingQr ? 'animate-spin' : ''
                                            }`}
                                        />

                                        <span>
                                            {savingQr
                                                ? 'Saving…'
                                                : 'Save QR Code'}
                                        </span>
                                    </button>

                                    {qrSaveError && (
                                        <p
                                            role="alert"
                                            className="mt-2 text-xs text-red-700"
                                        >
                                            {qrSaveError}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3">
                                <MaterialIcon
                                    name="info"
                                    className="mt-0.5 text-[18px] text-red-700"
                                />
                                <p className="text-sm leading-6 text-red-900/80">
                                    Keep your QR code ready when visiting
                                    Ramyeon Corner to earn loyalty points.
                                </p>
                            </div>
                        </section>

                        {/* My information */}
                        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:col-start-1">
                            <div className="px-6 py-5 sm:px-8">
                                <h2 className="text-base font-semibold text-slate-900">
                                    My Information
                                </h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Your registered information.
                                </p>
                            </div>

                            <dl className="divide-y divide-slate-100 border-t border-slate-100">
                                {details.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-center gap-4 px-6 py-4 sm:px-8"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
                                            <MaterialIcon
                                                name={item.icon}
                                                className="text-[20px]"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                                {item.label}
                                            </dt>
                                            <dd
                                                className={`mt-1 break-all text-sm font-medium ${
                                                    item.muted
                                                        ? 'text-slate-400'
                                                        : 'text-slate-900'
                                                }`}
                                            >
                                                {item.value}
                                            </dd>
                                        </div>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    </div>
                </main>
            </div>
        </CustomerLayout>
    );
}