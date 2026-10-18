import CashierLayout from '@/Layouts/CashierLayout';
import { Head, Link } from '@inertiajs/react';

interface CustomerSummary {
    first_name: string;
    last_name: string;
    customer_code: string;
}

interface RecentTransaction {
    id: number;
    receipt_number: string | null;
    purchase_amount: number;
    amount_paid: number;
    points_earned: number;
    created_at: string | null;
    customer: CustomerSummary | null;
}

interface TopLoyalCustomer {
    id: number;
    first_name: string;
    last_name: string;
    customer_code: string;
    points: number;
}

interface Stats {
    totalCustomers: number;
    totalTransactions: number;
    todayTransactions: number;
    todaySales: number;
    todayPointsEarned: number;
    todayRewardsRedeemed: number;
}

interface Props {
    stats: Stats;
    topLoyalCustomers: TopLoyalCustomer[];
    recentTransactions: RecentTransaction[];
}

const formatCurrency = (value: string | number) =>
    `₱${Number(value ?? 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatNumber = (value: string | number) =>
    Number(value ?? 0).toLocaleString('en-PH');

const formatDate = (value: string | null) => {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const todayLabel = () =>
    new Date().toLocaleDateString('en-PH', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

const statCards = (stats: Stats) => [
    {
        label: 'Total Customers',
        value: formatNumber(stats.totalCustomers),
        detail: 'Registered loyalty members',
        symbol: 'group',
        accent: 'red',
    },
    {
        label: 'Total Transactions',
        value: formatNumber(stats.totalTransactions),
        detail: 'All recorded purchases',
        symbol: 'receipt_long',
        accent: 'gray',
    },
    {
        label: "Today's Transactions",
        value: formatNumber(stats.todayTransactions),
        detail: 'Processed by you today',
        symbol: 'trending_up',
        accent: 'red',
    },
    {
        label: "Today's Sales",
        value: formatCurrency(stats.todaySales),
        detail: 'Amount paid today',
        symbol: 'payments',
        accent: 'red',
    },
    {
        label: 'Points Earned Today',
        value: formatNumber(stats.todayPointsEarned),
        detail: 'Points issued by your sales',
        symbol: 'stars',
        accent: 'yellow',
    },
    {
        label: 'Rewards Redeemed',
        value: formatNumber(stats.todayRewardsRedeemed),
        detail: 'Completed redemptions today',
        symbol: 'redeem',
        accent: 'yellow',
    },
];

const accentStyles: Record<string, string> = {
    red: 'bg-red-100 text-[#DC2626]',
    gray: 'bg-gray-100 text-gray-600',
    yellow: 'bg-yellow-50 text-yellow-700',
};

const rankStyles = [
    {
        label: '1st',
        badge: 'bg-yellow-100 text-yellow-800',
        avatar: 'bg-[#DC2626] text-white',
    },
    {
        label: '2nd',
        badge: 'bg-gray-100 text-gray-700',
        avatar: 'bg-red-100 text-[#B91C1C]',
    },
    {
        label: '3rd',
        badge: 'bg-orange-50 text-orange-800',
        avatar: 'bg-orange-50 text-orange-700',
    },
];

export default function Dashboard({
    stats,
    topLoyalCustomers = [],
    recentTransactions = [],
}: Props) {
    const cards = statCards(stats);

    return (
        <CashierLayout>
            <Head title="Cashier Dashboard">
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,1,0"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-[#FCF8F8] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Page heading */}
                   <header className="flex flex-col gap-4 rounded-xl bg-[#B91C1C] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
    <div>
        <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white">
                Ramyeon Corner
            </p>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Cashier Dashboard
        </h1>

        <p className="mt-2 text-sm text-white/85">
            Your daily activity and customer loyalty at a glance.
        </p>
    </div>

    <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B91C1C] text-white">
            <span
                className="material-symbols-rounded text-2xl"
                aria-hidden="true"
            >
                calendar_month
            </span>
        </div>

        <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#B91C1C]">
                Today
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
                {todayLabel()}
            </p>
        </div>
    </div>
</header>
                    {/* Statistics */}
                    <section aria-label="Dashboard statistics">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-800">
                                Business overview
                            </h2>
                            <span className="text-xs text-gray-400">
                                Live application data
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {cards.map((card) => (
                                <article
                                    key={card.label}
                                    className="group rounded-xl border border-gray-200/80 bg-white p-5 transition duration-200 hover:border-red-300 hover:shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-500">
                                                {card.label}
                                            </p>

                                            <p className="mt-3 break-words text-2xl font-bold tracking-tight text-[#18181B] sm:text-3xl">
                                                {card.value}
                                            </p>
                                        </div>

                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentStyles[card.accent]}`}
                                        >
                                            <span
                                                className="material-symbols-rounded text-2xl"
                                                aria-hidden="true"
                                            >
                                                {card.symbol}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 border-t border-gray-100 pt-3">
                                        <p className="text-xs text-gray-400">
                                            {card.detail}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* Quick actions */}
                    <section>
                        <div className="mb-3">
                            <h2 className="text-sm font-bold text-gray-800">
                                Quick actions
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                Get straight to your daily cashier tasks.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Link
                                href={route('cashier.qr-scanner')}
                                className="group flex items-center gap-4 rounded-xl border border-red-200 bg-white p-5 transition hover:border-red-400 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#DC2626] text-white transition group-hover:bg-[#B91C1C]">
                                    <span
                                        className="material-symbols-rounded text-3xl"
                                        aria-hidden="true"
                                    >
                                        qr_code_scanner
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-gray-900">
                                        Scan Customer QR
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                        Find a loyalty member and start a transaction.
                                    </p>
                                </div>

                                <span className="material-symbols-rounded text-xl text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#DC2626]" aria-hidden="true">
                                    arrow_forward
                                </span>
                            </Link>

                            <Link
                                href={route('cashier.transactions.index')}
                                className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-red-300 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-[#DC2626] transition group-hover:bg-[#DC2626] group-hover:text-white">
                                    <span
                                        className="material-symbols-rounded text-3xl"
                                        aria-hidden="true"
                                    >
                                        receipt_long
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-gray-900">
                                        View Transactions
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                        Browse your recorded transaction history.
                                    </p>
                                </div>

                                <span className="material-symbols-rounded text-xl text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#DC2626]" aria-hidden="true">
                                    arrow_forward
                                </span>
                            </Link>
                        </div>
                    </section>

                    {/* Leaderboard and recent activity */}
                    <div className="grid items-stretch gap-5 lg:grid-cols-[0.9fr_1.1fr]">

                        {/* Top 3 loyal customers */}
                        <section className="flex flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white">
                            <div className="flex min-h-[6.5rem] flex-col justify-center border-b border-gray-100 px-5 py-5 sm:px-6">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
                                                <span
                                                    className="material-symbols-rounded text-xl"
                                                    aria-hidden="true"
                                                >
                                                    emoji_events
                                                </span>
                                            </span>

                                            <h2 className="text-base font-bold text-gray-900">
                                                Top Loyal Customers
                                            </h2>
                                        </div>

                                        <p className="mt-2 text-xs text-gray-500">
                                            Your top 3 members by accumulated points.
                                        </p>
                                    </div>

                                    <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-[#B91C1C]">
                                        TOP 3
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3 p-4 sm:p-5">
                                {topLoyalCustomers.length > 0 ? (
                                    topLoyalCustomers.map((customer, index) => {
                                        const rank = rankStyles[index] ?? rankStyles[2];

                                        const initials =
                                            `${customer.first_name.charAt(0)}${customer.last_name.charAt(0)}`.toUpperCase();

                                        return (
                                            <div
                                                key={customer.id}
                                                className={`flex items-center gap-3 rounded-xl border p-3 sm:p-4 ${
                                                    index === 0
                                                        ? 'border-red-200 bg-[#FCF8F8]'
                                                        : 'border-gray-100 bg-white'
                                                }`}
                                            >
                                                <span
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${rank.badge}`}
                                                >
                                                    {rank.label}
                                                </span>

                                                <div
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${rank.avatar}`}
                                                >
                                                    {initials}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-bold text-gray-900">
                                                        {customer.first_name}{' '}
                                                        {customer.last_name}
                                                    </p>

                                                    <p className="mt-1 truncate text-xs text-gray-500">
                                                        {customer.customer_code}
                                                    </p>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <p className="text-base font-bold text-gray-900">
                                                        {formatNumber(customer.points)}
                                                    </p>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                                        Points
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-10 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-[#DC2626]">
                                            <span
                                                className="material-symbols-rounded text-2xl"
                                                aria-hidden="true"
                                            >
                                                stars
                                            </span>
                                        </div>

                                        <p className="mt-3 text-sm font-semibold text-gray-700">
                                            No loyal customers yet
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Customer rankings will appear here when members are registered.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-3">
                                <p className="text-xs leading-5 text-gray-500">
                                    Rankings are based on each customer's current points balance.
                                </p>
                            </div>
                        </section>

                        {/* Recent transactions */}
                        <section className="flex flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white">
                            <div className="flex min-h-[6.5rem] items-center justify-between gap-3 border-b border-gray-100 px-5 py-5 sm:px-6">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">
                                        Recent Transactions
                                    </h2>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Your five latest recorded purchases.
                                    </p>
                                </div>

                                <Link
                                    href={route('cashier.transactions.index')}
                                    className="shrink-0 text-xs font-bold text-[#DC2626] transition hover:text-[#B91C1C] focus:outline-none focus-visible:underline"
                                >
                                    View all →
                                </Link>
                            </div>

                            <div className="flex-1 divide-y divide-gray-100">
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((transaction) => {
                                        const customerName = transaction.customer
                                            ? `${transaction.customer.first_name} ${transaction.customer.last_name}`
                                            : 'Walk-in customer';

                                        const initials = transaction.customer
                                            ? `${transaction.customer.first_name.charAt(0)}${transaction.customer.last_name.charAt(0)}`.toUpperCase()
                                            : '?';

                                        return (
                                            <div
                                                key={transaction.id}
                                                className="flex items-center gap-3 px-5 py-4 transition hover:bg-gray-50/80 sm:px-6"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-[#B91C1C]">
                                                    {initials}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-gray-900">
                                                        {customerName}
                                                    </p>

                                                    <p className="mt-1 truncate text-xs text-gray-500">
                                                        {transaction.receipt_number ||
                                                            transaction.customer?.customer_code ||
                                                            `Transaction #${transaction.id}`}
                                                    </p>

                                                    <p className="mt-1 text-[11px] text-gray-400">
                                                        {formatDate(transaction.created_at)}
                                                    </p>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {formatCurrency(transaction.amount_paid)}
                                                    </p>

                                                    <span className="mt-1 inline-flex rounded-md bg-yellow-50 px-2 py-1 text-[10px] font-bold text-yellow-800">
                                                        +{formatNumber(transaction.points_earned)} pts
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-5 py-12 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-[#DC2626]">
                                            <span
                                                className="material-symbols-rounded text-2xl"
                                                aria-hidden="true"
                                            >
                                                shopping_cart
                                            </span>
                                        </div>

                                        <p className="mt-3 text-sm font-semibold text-gray-700">
                                            No transactions yet
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Your latest purchases will appear here.
                                        </p>

                                        <Link
                                            href={route('cashier.qr-scanner')}
                                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                                        >
                                            <span className="material-symbols-rounded text-lg" aria-hidden="true">
                                                qr_code_scanner
                                            </span>
                                            Start a transaction
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {recentTransactions.length > 0 && (
                                <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-3">
                                    <p className="text-xs text-gray-500">
                                        Showing {recentTransactions.length} latest transactions.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>

                </div>
            </div>
        </CashierLayout>
    );
}