import { Head, Link } from '@inertiajs/react';

import CustomerLayout from '@/Layouts/CustomerLayout';

type PointTransaction = {
    id: number;
    type: 'earned' | 'redeemed' | 'refunded' | 'adjusted';
    points: number;
    balance_after: number;
    description: string;
    created_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PointHistoryProps = {
    pointTransactions: {
        data: PointTransaction[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        links: PaginationLink[];
    };
};

type Tone = 'red' | 'amber' | 'emerald' | 'slate';

const chipTones: Record<Tone, string> = {
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
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

export default function PointHistory({ pointTransactions }: PointHistoryProps) {
    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const formatPoints = (points: number) => {
        return Math.abs(points).toLocaleString('en-PH');
    };

    const getTypeLabel = (type: PointTransaction['type']) => {
        switch (type) {
            case 'earned':
                return 'Points Earned';
            case 'redeemed':
                return 'Reward Redeemed';
            case 'refunded':
                return 'Points Refunded';
            case 'adjusted':
                return 'Points Adjusted';
            default:
                return 'Point Activity';
        }
    };

    const getTypeIcon = (type: PointTransaction['type']) => {
        switch (type) {
            case 'earned':
                return 'add_circle';
            case 'redeemed':
                return 'redeem';
            case 'refunded':
                return 'undo';
            case 'adjusted':
                return 'tune';
            default:
                return 'stars';
        }
    };

    const getTypeTone = (type: PointTransaction['type']): Tone => {
        switch (type) {
            case 'earned':
                return 'emerald';
            case 'redeemed':
                return 'red';
            case 'refunded':
                return 'amber';
            default:
                return 'slate';
        }
    };

    const getPointsPillClass = (points: number) => {
        if (points > 0) {
            return 'bg-emerald-50 text-emerald-700';
        }

        if (points < 0) {
            return 'bg-red-50 text-red-700';
        }

        return 'bg-gray-100 text-gray-500';
    };

    const formatPointsChange = (points: number) => {
        if (points > 0) {
            return `+${formatPoints(points)}`;
        }

        if (points < 0) {
            return `-${formatPoints(points)}`;
        }

        return '0';
    };

    // The list is paginated, so these two totals cover the current page only.
    const pageGained = pointTransactions.data.reduce(
        (sum, entry) => (entry.points > 0 ? sum + entry.points : sum),
        0,
    );
    const pageUsed = pointTransactions.data.reduce(
        (sum, entry) => (entry.points < 0 ? sum + Math.abs(entry.points) : sum),
        0,
    );

    return (
        <CustomerLayout>
            <Head title="Point History" />

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
                                Point History
                            </h1>

                            <p className="mt-3 max-w-xl text-base text-red-50/90">
                                Review how your loyalty points were earned,
                                redeemed, refunded, or adjusted.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-700 text-white">
                                <MaterialIcon
                                    name="history"
                                    className="text-[26px]"
                                />
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-700">
                                    Point activity
                                </p>
                                <p className="mt-0.5 text-lg font-semibold text-gray-900">
                                    {pointTransactions.total.toLocaleString(
                                        'en-PH',
                                    )}{' '}
                                    {pointTransactions.total === 1
                                        ? 'entry'
                                        : 'entries'}
                                </p>
                            </div>
                        </div>
                    </header>

                    {pointTransactions.data.length > 0 ? (
                        <>
                            {/* Overview */}
                            <section>
                                <div className="mb-4 flex items-baseline justify-between gap-4">
                                    <h2 className="text-base font-semibold text-gray-900">
                                        Points overview
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        Live application data
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <StatCard
                                        label="Total Entries"
                                        value={pointTransactions.total.toLocaleString(
                                            'en-PH',
                                        )}
                                        icon="history"
                                        tone="red"
                                        footer="All recorded point activity"
                                    />

                                    <StatCard
                                        label="Gained on This Page"
                                        value={`+${pageGained.toLocaleString('en-PH')}`}
                                        icon="add_circle"
                                        tone="emerald"
                                        footer="Earned or refunded in the list below"
                                    />

                                    <StatCard
                                        label="Used on This Page"
                                        value={`-${pageUsed.toLocaleString('en-PH')}`}
                                        icon="redeem"
                                        tone="amber"
                                        footer="Redeemed or deducted in the list below"
                                    />
                                </div>
                            </section>

                            {/* Activity */}
                            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900">
                                            Your Point Activity
                                        </h2>

                                        <p className="mt-0.5 text-sm text-gray-500">
                                            Every change to your points balance.
                                        </p>
                                    </div>

                                    {pointTransactions.from !== null &&
                                        pointTransactions.to !== null && (
                                            <p className="text-sm text-gray-400">
                                                Showing {pointTransactions.from}–
                                                {pointTransactions.to} of{' '}
                                                {pointTransactions.total.toLocaleString(
                                                    'en-PH',
                                                )}
                                            </p>
                                        )}
                                </div>

                                {/* Mobile */}
                                <div className="divide-y divide-gray-100 md:hidden">
                                    {pointTransactions.data.map(
                                        (pointTransaction) => (
                                            <article
                                                key={pointTransaction.id}
                                                className="px-5 py-5"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <IconChip
                                                        name={getTypeIcon(
                                                            pointTransaction.type,
                                                        )}
                                                        tone={getTypeTone(
                                                            pointTransaction.type,
                                                        )}
                                                        size="md"
                                                    />

                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {getTypeLabel(
                                                                pointTransaction.type,
                                                            )}
                                                        </p>

                                                        <p className="mt-1 break-words text-sm leading-5 text-gray-500">
                                                            {
                                                                pointTransaction.description
                                                            }
                                                        </p>

                                                        <p className="mt-2 text-xs text-gray-400">
                                                            {formatDateTime(
                                                                pointTransaction.created_at,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${getPointsPillClass(
                                                            pointTransaction.points,
                                                        )}`}
                                                    >
                                                        {formatPointsChange(
                                                            pointTransaction.points,
                                                        )}{' '}
                                                        pts
                                                    </span>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-3">
                                                    <span className="text-xs font-medium text-gray-500">
                                                        Balance after
                                                    </span>

                                                    <span className="text-sm font-semibold tabular-nums text-gray-900">
                                                        {pointTransaction.balance_after.toLocaleString(
                                                            'en-PH',
                                                        )}{' '}
                                                        pts
                                                    </span>
                                                </div>
                                            </article>
                                        ),
                                    )}
                                </div>

                                {/* Desktop */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[760px] text-left">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Date
                                                </th>

                                                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Activity
                                                </th>

                                                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Points
                                                </th>

                                                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Balance After
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {pointTransactions.data.map(
                                                (pointTransaction) => (
                                                    <tr
                                                        key={pointTransaction.id}
                                                        className="transition hover:bg-red-50/40"
                                                    >
                                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                            {formatDateTime(
                                                                pointTransaction.created_at,
                                                            )}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <IconChip
                                                                    name={getTypeIcon(
                                                                        pointTransaction.type,
                                                                    )}
                                                                    tone={getTypeTone(
                                                                        pointTransaction.type,
                                                                    )}
                                                                    size="md"
                                                                />

                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {getTypeLabel(
                                                                            pointTransaction.type,
                                                                        )}
                                                                    </p>

                                                                    <p className="mt-0.5 max-w-md truncate text-xs text-gray-500">
                                                                        {
                                                                            pointTransaction.description
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${getPointsPillClass(
                                                                    pointTransaction.points,
                                                                )}`}
                                                            >
                                                                {formatPointsChange(
                                                                    pointTransaction.points,
                                                                )}{' '}
                                                                pts
                                                            </span>
                                                        </td>

                                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold tabular-nums text-gray-900">
                                                            {pointTransaction.balance_after.toLocaleString(
                                                                'en-PH',
                                                            )}{' '}
                                                            pts
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {pointTransactions.last_page > 1 && (
                                    <nav
                                        className="flex flex-wrap items-center justify-center gap-1 border-t border-gray-100 px-5 py-4 sm:justify-end sm:px-6"
                                        aria-label="Point history pagination"
                                    >
                                        {pointTransactions.links.map(
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
                                    name="stars"
                                    className="text-[24px]"
                                />
                            </div>

                            <h2 className="mt-4 text-base font-semibold text-gray-900">
                                No point activity yet
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                                Your point history will appear here after you
                                earn or use loyalty points.
                            </p>
                        </section>
                    )}
                </main>
            </div>
        </CustomerLayout>
    );
}