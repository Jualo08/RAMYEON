import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';

type Transaction = {
    id: number;
    receipt_number: string | null;
    purchase_amount: string | number;
    points_earned: number;
    created_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type TransactionsProps = {
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        links: PaginationLink[];
    };
};

type Tone = 'red' | 'amber' | 'slate';

const chipTones: Record<Tone, string> = {
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-500',
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

function IconChip({
    name,
    tone,
    size = 'lg',
}: {
    name: string;
    tone: Tone;
    size?: 'md' | 'lg';
}) {
    return (
        <div
            className={`flex shrink-0 items-center justify-center rounded-xl ${chipTones[tone]} ${
                size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
            }`}
        >
            <MaterialIcon
                name={name}
                className={size === 'lg' ? 'text-[24px]' : 'text-[20px]'}
            />
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
    tone,
    footer,
}: {
    label: string;
    value: string;
    icon: string;
    tone: Tone;
    footer: string;
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="mt-3 truncate text-3xl font-semibold tracking-tight tabular-nums text-gray-900">
                        {value}
                    </p>
                </div>

                <IconChip name={icon} tone={tone} />
            </div>

            <p className="mt-5 border-t border-gray-100 pt-4 text-sm text-gray-400">
                {footer}
            </p>
        </div>
    );
}

export default function Transactions({ transactions }: TransactionsProps) {
    const formatAmount = (amount: string | number) => {
        return Number(amount).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    // The list is paginated, so these two totals cover the current page only.
    const pagePurchases = transactions.data.reduce(
        (sum, transaction) => sum + Number(transaction.purchase_amount),
        0,
    );
    const pagePoints = transactions.data.reduce(
        (sum, transaction) => sum + Number(transaction.points_earned),
        0,
    );

    return (
        <CustomerLayout>
            <Head title="Transaction History" />

            <div className="min-h-screen bg-[#fcf8f8]">
                <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {/* Banner */}
                    <header className="flex flex-col gap-6 rounded-2xl bg-red-700 px-6 py-7 text-white shadow-sm sm:px-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em]">
                                <span className="h-2 w-2 rounded-full bg-white" />
                                Ramyeon Corner Loyalty
                            </p>

                            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Transaction History
                            </h1>

                            <p className="mt-3 max-w-xl text-base text-red-50/90">
                                View your purchases and the loyalty points you
                                earned from each transaction.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-700 text-white">
                                <MaterialIcon
                                    name="receipt_long"
                                    className="text-[26px]"
                                />
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-700">
                                    Total purchases
                                </p>
                                <p className="mt-0.5 text-lg font-semibold text-gray-900">
                                    {transactions.total.toLocaleString('en-PH')}{' '}
                                    {transactions.total === 1
                                        ? 'transaction'
                                        : 'transactions'}
                                </p>
                            </div>
                        </div>
                    </header>

                    {transactions.data.length > 0 ? (
                        <>
                            {/* Overview */}
                            <section>
                                <div className="mb-4 flex items-baseline justify-between gap-4">
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Purchase overview
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        Live application data
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <StatCard
                                        label="Total Transactions"
                                        value={transactions.total.toLocaleString(
                                            'en-PH',
                                        )}
                                        icon="receipt_long"
                                        tone="red"
                                        footer="All recorded purchases"
                                    />

                                    <StatCard
                                        label="Purchases on This Page"
                                        value={`₱${formatAmount(pagePurchases)}`}
                                        icon="payments"
                                        tone="slate"
                                        footer="Amount paid in the list below"
                                    />

                                    <StatCard
                                        label="Points on This Page"
                                        value={`+${pagePoints.toLocaleString('en-PH')}`}
                                        icon="stars"
                                        tone="amber"
                                        footer="Points earned in the list below"
                                    />
                                </div>
                            </section>

                            {/* Transactions */}
                            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900">
                                            Your Transactions
                                        </h2>

                                        <p className="mt-0.5 text-sm text-gray-500">
                                            Receipts and the points each one
                                            earned.
                                        </p>
                                    </div>

                                    {transactions.from !== null &&
                                        transactions.to !== null && (
                                            <p className="text-sm text-gray-400">
                                                Showing {transactions.from}–
                                                {transactions.to} of{' '}
                                                {transactions.total.toLocaleString(
                                                    'en-PH',
                                                )}
                                            </p>
                                        )}
                                </div>

                                {/* Mobile list */}
                                <div className="divide-y divide-gray-100 md:hidden">
                                    {transactions.data.map((transaction) => (
                                        <article
                                            key={transaction.id}
                                            className="px-5 py-5"
                                        >
                                            <div className="flex items-start gap-3">
                                                <IconChip
                                                    name="receipt_long"
                                                    tone="red"
                                                    size="md"
                                                />

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                        {transaction.receipt_number ||
                                                            'No receipt number'}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-gray-500">
                                                        {formatDateTime(
                                                            transaction.created_at,
                                                        )}
                                                    </p>
                                                </div>

                                                <p className="shrink-0 text-sm font-semibold tabular-nums text-gray-900">
                                                    ₱
                                                    {formatAmount(
                                                        transaction.purchase_amount,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-3">
                                                <span className="text-xs font-medium text-gray-500">
                                                    Points earned
                                                </span>

                                                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-red-700">
                                                    +
                                                    {transaction.points_earned.toLocaleString(
                                                        'en-PH',
                                                    )}{' '}
                                                    pts
                                                </span>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                {/* Desktop table */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[640px] text-left">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Date
                                                </th>

                                                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Receipt
                                                </th>

                                                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Purchase
                                                </th>

                                                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Points Earned
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {transactions.data.map(
                                                (transaction) => (
                                                    <tr
                                                        key={transaction.id}
                                                        className="transition hover:bg-red-50/40"
                                                    >
                                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                            {formatDateTime(
                                                                transaction.created_at,
                                                            )}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <IconChip
                                                                    name="receipt_long"
                                                                    tone="red"
                                                                    size="md"
                                                                />
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {transaction.receipt_number ||
                                                                        'No receipt number'}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold tabular-nums text-gray-900">
                                                            ₱
                                                            {formatAmount(
                                                                transaction.purchase_amount,
                                                            )}
                                                        </td>

                                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                                            <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-red-700">
                                                                +
                                                                {transaction.points_earned.toLocaleString(
                                                                    'en-PH',
                                                                )}{' '}
                                                                pts
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {transactions.last_page > 1 && (
                                    <nav
                                        className="flex flex-wrap items-center justify-center gap-1 border-t border-gray-100 px-5 py-4 sm:justify-end sm:px-6"
                                        aria-label="Transaction history pagination"
                                    >
                                        {transactions.links.map(
                                            (link, index) => (
                                                <Link
                                                    key={`${link.label}-${index}`}
                                                    href={link.url || '#'}
                                                    preserveScroll
                                                    className={[
                                                        'flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition',
                                                        link.active
                                                            ? 'bg-red-700 text-white'
                                                            : link.url
                                                              ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                              : 'cursor-not-allowed text-gray-300',
                                                    ].join(' ')}
                                                    aria-current={
                                                        link.active
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                    aria-disabled={
                                                        !link.url
                                                            ? 'true'
                                                            : undefined
                                                    }
                                                >
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                </Link>
                                            ),
                                        )}
                                    </nav>
                                )}
                            </section>
                        </>
                    ) : (
                        <section className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                <MaterialIcon
                                    name="receipt_long"
                                    className="text-[24px]"
                                />
                            </div>

                            <h2 className="mt-4 text-base font-semibold text-gray-900">
                                No transactions yet
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                                Your purchase history will appear here after
                                you make a purchase and earn loyalty points.
                            </p>
                        </section>
                    )}
                </main>
            </div>
        </CustomerLayout>
    );
}