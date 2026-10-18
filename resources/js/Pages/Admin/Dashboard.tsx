import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Stats {
    totalCustomers: number;
    activeCustomers: number;
    totalCashiers: number;
    totalPurchaseAmount: string;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    totalRedemptions: number;
    activeRewards: number;
}

interface Customer {
    first_name: string;
    last_name: string;
    customer_code: string;
}

interface Cashier {
    name: string;
}

interface Transaction {
    id: number;
    purchase_amount: string;
    points_earned: number;
    created_at: string;
    customer: Customer;
    cashier: Cashier;
}

interface Reward {
    reward_name: string;
}

interface Redemption {
    id: number;
    points_used: number;
    redeemed_at: string;
    customer: Customer;
    reward: Reward;
    cashier: Cashier;
}

interface MonthlyTransaction {
    month: number;
    total_amount: string;
    total_points: string;
    transaction_count: number;
}

interface MonthlyCustomer {
    month: number;
    customer_count: number;
}

interface Props {
    stats: Stats;
    recentTransactions: Transaction[];
    recentRedemptions: Redemption[];
    monthlyTransactions: MonthlyTransaction[];
    monthlyCustomers: MonthlyCustomer[];
}

/* ───────── Constants & helpers ───────── */

const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const chartMonths = monthNames.map((name, index) => ({
    month: name,
    monthNumber: index + 1,
}));

const COLORS = {
    primary: '#DC2626',
    dark: '#B91C1C',
    soft: '#F87171',
};

const axisTick = { fontSize: 12, fill: '#6b7280' };

const tooltipStyle = {
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    padding: '10px 12px',
};

const formatCurrency = (value: string | number) =>
    `₱${Number(value).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatNumber = (value: string | number) =>
    Number(value).toLocaleString('en-PH');

const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

/* ───────── Icons ───────── */

const icons = {
    users: (
        <>
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </>
    ),
    cart: (
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 2h12M10 19a1 1 0 11-2 0m9 0a1 1 0 11-2 0" />
    ),
    gift: (
        <path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7M2 7h20v5H2zM12 7v14M12 7H8.5a2.5 2.5 0 115-1c0 1.5-1.5 1-1.5 1zM12 7h3.5a2.5 2.5 0 10-5-1c0 1.5 1 1 1.5 1z" />
    ),
    cashier: (
        <>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 9h18M7 14h4" />
        </>
    ),
};

function Icon({ name }: { name: keyof typeof icons }) {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {icons[name]}
        </svg>
    );
}

/* ───────── Reusable pieces ───────── */

function Card({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ${className}`}
        >
            {children}
        </section>
    );
}

function CardHeader({
    title,
    description,
    badge,
}: {
    title: string;
    description: string;
    badge?: ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
            <div className="min-w-0">
                <h2 className="text-base font-bold tracking-tight text-gray-900">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>

            {badge && (
                <div className="hidden shrink-0 items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 sm:flex">
                    {badge}
                </div>
            )}
        </div>
    );
}

function StatCard({
    label,
    value,
    icon,
    footer,
}: {
    label: string;
    value: string;
    icon: keyof typeof icons;
    footer: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-gray-200/80 border-t-2 border-t-red-600 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">
                        {label}
                    </p>
                    <p className="mt-3 truncate text-3xl font-bold tracking-tight text-gray-900">
                        {value}
                    </p>
                </div>

                <div className="shrink-0 rounded-xl bg-red-50 p-3 text-red-600">
                    <Icon name={icon} />
                </div>
            </div>

            <p className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-500">
                {footer}
            </p>
        </div>
    );
}

function EmptyState({
    icon,
    title,
    text,
}: {
    icon: keyof typeof icons;
    title: string;
    text: string;
}) {
    return (
        <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Icon name={icon} />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-800">{title}</p>
            <p className="mt-1 text-xs text-gray-500">{text}</p>
        </div>
    );
}

/* ───────── Page ───────── */

export default function Dashboard({
    stats,
    recentTransactions,
    recentRedemptions,
    monthlyTransactions,
    monthlyCustomers,
}: Props) {
    const transactionChartData = chartMonths.map((item) => {
        const transaction = monthlyTransactions.find(
            (data) => Number(data.month) === item.monthNumber,
        );

        return {
            month: item.month,
            amount: Number(transaction?.total_amount ?? 0),
            transactions: Number(transaction?.transaction_count ?? 0),
        };
    });

    const customerChartData = chartMonths.map((item) => {
        const customer = monthlyCustomers.find(
            (data) => Number(data.month) === item.monthNumber,
        );

        return {
            month: item.month,
            customers: Number(customer?.customer_count ?? 0),
        };
    });

    const loyaltyData = [
        {
            name: 'Points Earned',
            value: Number(stats.totalPointsEarned),
        },
        {
            name: 'Points Redeemed',
            value: Number(stats.totalPointsRedeemed),
        },
    ];

    const loyaltyColors = ['#dc2626', '#facc15'];

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="Overview"
                        title="Admin Dashboard"
                        description="Monitor customer activity, purchases, and loyalty performance from one place."
                        action={
                            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                    Today
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                    {new Date().toLocaleDateString('en-PH', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        }
                    />

                    {/* KPI cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label="Total Customers"
                            value={formatNumber(stats.totalCustomers)}
                            icon="users"
                            footer={
                                <>
                                    <span className="font-semibold text-gray-900">
                                        {formatNumber(stats.activeCustomers)}
                                    </span>{' '}
                                    active customers
                                </>
                            }
                        />

                        <StatCard
                            label="Total Purchases"
                            value={formatCurrency(stats.totalPurchaseAmount)}
                            icon="cart"
                            footer="Across all recorded transactions"
                        />

                        <StatCard
                            label="Reward Redemptions"
                            value={formatNumber(stats.totalRedemptions)}
                            icon="gift"
                            footer={
                                <>
                                    <span className="font-semibold text-gray-900">
                                        {formatNumber(stats.activeRewards)}
                                    </span>{' '}
                                    active rewards
                                </>
                            }
                        />

                        <StatCard
                            label="Cashier Accounts"
                            value={formatNumber(stats.totalCashiers)}
                            icon="cashier"
                            footer="Registered in the system"
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader
                                title="Purchase Activity"
                                description={`Monthly purchase amount for ${new Date().getFullYear()}.`}
                                badge={
                                    <>
                                        <span className="h-2 w-2 rounded-full bg-red-600" />
                                        Purchases
                                    </>
                                }
                            />

                            <div className="px-4 pb-5 pt-6 sm:px-6">
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={transactionChartData}
                                            margin={{ top: 8, right: 8, left: 8, bottom: 4 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#f1f5f9"
                                            />
                                            <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={axisTick}
                                                dy={8}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tick={axisTick}
                                                tickFormatter={(value) =>
                                                    `₱${Number(value).toLocaleString('en-PH')}`
                                                }
                                                width={58}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#fef2f2' }}
                                                contentStyle={tooltipStyle}
                                                labelStyle={{
                                                    color: '#111827',
                                                    fontWeight: 600,
                                                    marginBottom: '4px',
                                                }}
                                                itemStyle={{
                                                    color: COLORS.primary,
                                                    fontSize: '13px',
                                                }}
                                                formatter={(value) => [
                                                    formatCurrency(Number(value)),
                                                    'Purchase Amount',
                                                ]}
                                            />
                                            <Bar
                                                dataKey="amount"
                                                fill={COLORS.primary}
                                                radius={[6, 6, 0, 0]}
                                                maxBarSize={36}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <CardHeader
                                title="Customer Growth"
                                description="New loyalty customers registered each month."
                                badge={
                                    <>
                                        <span className="h-2 w-2 rounded-full bg-red-400" />
                                        Customers
                                    </>
                                }
                            />

                            <div className="px-4 pb-5 pt-6 sm:px-6">
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={customerChartData}
                                            margin={{ top: 8, right: 8, left: 8, bottom: 4 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#f1f5f9"
                                            />
                                            <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={axisTick}
                                                dy={8}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={axisTick}
                                                width={32}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#fef2f2' }}
                                                contentStyle={tooltipStyle}
                                                labelStyle={{
                                                    color: '#111827',
                                                    fontWeight: 600,
                                                    marginBottom: '4px',
                                                }}
                                                itemStyle={{
                                                    color: COLORS.dark,
                                                    fontSize: '13px',
                                                }}
                                                formatter={(value) => [
                                                    formatNumber(Number(value)),
                                                    'New Customers',
                                                ]}
                                            />
                                            <Bar
                                                dataKey="customers"
                                                fill={COLORS.soft}
                                                radius={[6, 6, 0, 0]}
                                                maxBarSize={36}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Loyalty Points + Points Activity (redesigned) */}
{(() => {
    const earned = Number(stats.totalPointsEarned) || 0;
    const redeemed = Number(stats.totalPointsRedeemed) || 0;
    const redemptions = Number(stats.totalRedemptions) || 0;
    const purchases = Number(stats.totalPurchaseAmount) || 0;

    const available = Math.max(0, earned - redeemed);
    const usedPct = earned > 0 ? Math.min(100, (redeemed / earned) * 100) : 0;
    const availablePct = earned > 0 ? 100 - usedPct : 0;

    const avgPerRedemption =
        redemptions > 0 ? Math.round(redeemed / redemptions) : null;
    const earnRate = purchases > 0 ? (earned / purchases) * 100 : null;

    const pct = (value: number) =>
        `${value.toLocaleString('en-PH', { maximumFractionDigits: 1 })}%`;

    // dark red = redeemed, pale red = still available
    const redeemedColor = '#DC2626';
    const availableColor = '#FECACA';
    const emptyColor = '#F3F4F6';

    const donutData =
        earned > 0
            ? [
                  {
                      name: 'Redeemed',
                      value: Math.min(redeemed, earned),
                      color: redeemedColor,
                  },
                  { name: 'Available', value: available, color: availableColor },
              ]
            : [{ name: 'No points yet', value: 1, color: emptyColor }];

    const metrics = [
        {
            label: 'Points earned',
            value: formatNumber(earned),
            hint: 'From all purchases',
        },
        {
            label: 'Points redeemed',
            value: formatNumber(redeemed),
            hint: 'Spent on rewards',
        },
        {
            label: 'Per redemption',
            value:
                avgPerRedemption === null ? '—' : formatNumber(avgPerRedemption),
            hint: 'Average points used',
        },
        {
            label: 'Earn rate',
            value:
                earnRate === null
                    ? '—'
                    : earnRate.toLocaleString('en-PH', {
                          maximumFractionDigits: 1,
                      }),
            hint: 'Points per ₱100 spent',
        },
    ];

    const legend = [
        {
            label: 'Redeemed',
            value: redeemed,
            share: usedPct,
            color: redeemedColor,
        },
        {
            label: 'Available',
            value: available,
            share: availablePct,
            color: availableColor,
        },
    ];

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Loyalty Points */}
            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm lg:col-span-2">
                <div className="border-b border-gray-100 px-6 py-5">
                    <h2 className="text-base font-bold tracking-tight text-gray-900">
                        Loyalty Points
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Points customers have earned from purchases and how many
                        are still unspent.
                    </p>
                </div>

                <div className="p-6">
                    <p className="text-sm font-medium text-gray-500">
                        Available to redeem
                    </p>
                    <p className="mt-2 text-5xl font-bold tracking-tight tabular-nums text-gray-900">
                        {formatNumber(available)}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        out of {formatNumber(earned)} points earned
                    </p>

                    {/* Earned points split into redeemed vs available */}
                    <div
                        className="mt-6 flex h-3 overflow-hidden rounded-full"
                        style={{ backgroundColor: emptyColor }}
                        role="img"
                        aria-label={`${pct(usedPct)} of earned points redeemed, ${pct(availablePct)} available`}
                    >
                        <div
                            className="h-full transition-all"
                            style={{
                                width: `${usedPct}%`,
                                backgroundColor: redeemedColor,
                            }}
                        />
                        <div
                            className="h-full transition-all"
                            style={{
                                width: `${availablePct}%`,
                                backgroundColor: availableColor,
                            }}
                        />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-sm"
                                style={{ backgroundColor: redeemedColor }}
                            />
                            {formatNumber(redeemed)} redeemed
                        </span>
                        <span className="flex items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 rounded-sm"
                                style={{ backgroundColor: availableColor }}
                            />
                            {formatNumber(available)} available
                        </span>
                    </div>

                    {/* Supporting numbers */}
                    <div className="mt-6 grid grid-cols-2 gap-x-4 border-t border-gray-100 sm:grid-cols-4 sm:gap-x-0 sm:divide-x sm:divide-gray-100">
                        {metrics.map((metric) => (
                            <div
                                key={metric.label}
                                className="py-4 sm:px-5 sm:first:pl-0 sm:last:pr-0"
                            >
                                <p className="text-xs font-medium text-gray-500">
                                    {metric.label}
                                </p>
                                <p className="mt-1.5 text-xl font-bold tracking-tight tabular-nums text-gray-900">
                                    {metric.value}
                                </p>
                                <p className="mt-0.5 text-xs text-gray-400">
                                    {metric.hint}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Points Activity */}
            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5">
                    <h2 className="text-base font-bold tracking-tight text-gray-900">
                        Points Activity
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        How much of the earned points have been redeemed.
                    </p>
                </div>

                <div className="p-6">
                    <div className="relative mx-auto h-52 w-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={66}
                                    outerRadius={92}
                                    startAngle={90}
                                    endAngle={-270}
                                    paddingAngle={
                                        earned > 0 && available > 0 && redeemed > 0
                                            ? 2
                                            : 0
                                    }
                                    cornerRadius={4}
                                    stroke="none"
                                >
                                    {donutData.map((slice) => (
                                        <Cell key={slice.name} fill={slice.color} />
                                    ))}
                                </Pie>

                                {earned > 0 && (
                                    <Tooltip
                                        contentStyle={tooltipStyle}
                                        labelStyle={{
                                            color: '#111827',
                                            fontWeight: 600,
                                        }}
                                        formatter={(value, name) => [
                                            `${formatNumber(Number(value))} pts`,
                                            String(name),
                                        ]}
                                    />
                                )}
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Centre label */}
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-3xl font-bold tracking-tight tabular-nums text-gray-900">
                                {Math.round(usedPct)}%
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                                redeemed
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 divide-y divide-gray-100 border-t border-gray-100">
                        {legend.map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center justify-between gap-3 py-3"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span
                                        className="h-3 w-3 shrink-0 rounded-sm"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="truncate text-sm text-gray-600">
                                        {item.label}
                                    </span>
                                </div>
                                <div className="shrink-0 text-right">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatNumber(item.value)}
                                    </span>
                                    <span className="ml-2 text-xs tabular-nums text-gray-400">
                                        {pct(item.share)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
})()}

                    {/* Recent activity */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Recent transactions */}
                        <Card>
                            <CardHeader
                                title="Recent Transactions"
                                description="Latest recorded customer purchases."
                                badge={<>{recentTransactions.length} latest</>}
                            />

                            <div className="divide-y divide-gray-100">
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-red-50/40"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                                                {transaction.customer.first_name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                                {transaction.customer.last_name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-900">
                                                    {transaction.customer.first_name}{' '}
                                                    {transaction.customer.last_name}
                                                </p>
                                                <p className="mt-0.5 truncate text-xs text-gray-500">
                                                    {transaction.customer.customer_code}
                                                    {' · '}
                                                    {formatDate(transaction.created_at)}
                                                </p>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {formatCurrency(transaction.purchase_amount)}
                                                </p>
                                                <span className="mt-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                                                    +{transaction.points_earned} pts
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState
                                        icon="cart"
                                        title="No transactions yet."
                                        text="Transaction activity will appear here."
                                    />
                                )}
                            </div>
                        </Card>

                        {/* Recent redemptions */}
                        <Card>
                            <CardHeader
                                title="Recent Redemptions"
                                description="Latest completed reward redemptions."
                                badge={<>{recentRedemptions.length} latest</>}
                            />

                            <div className="divide-y divide-gray-100">
                                {recentRedemptions.length > 0 ? (
                                    recentRedemptions.map((redemption) => (
                                        <div
                                            key={redemption.id}
                                            className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-red-50/40"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                                                <Icon name="gift" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-900">
                                                    {redemption.customer.first_name}{' '}
                                                    {redemption.customer.last_name}
                                                </p>
                                                <p className="mt-0.5 truncate text-xs text-gray-500">
                                                    {redemption.reward.reward_name}
                                                    {' · '}
                                                    {formatDate(redemption.redeemed_at)}
                                                </p>
                                            </div>

                                            <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                                −{redemption.points_used} pts
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState
                                        icon="gift"
                                        title="No redemptions yet."
                                        text="Reward activity will appear here."
                                    />
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}