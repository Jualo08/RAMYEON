import { Head } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';

type Reward = {
    id: number;
    reward_name: string;
    reward_type: 'discount' | 'free_item';
    points_required: number;
    reward_value: string | number | null;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    redemption_limit: number | null;
    times_redeemed: number;
    is_maxed: boolean;
};

type RewardsProps = {
    rewards: Reward[];
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

function IconChip({ name, tone }: { name: string; tone: Tone }) {
    return (
        <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${chipTones[tone]}`}
        >
            <MaterialIcon name={name} className="text-[24px]" />
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

export default function Rewards({ rewards }: RewardsProps) {
    const formatDate = (date: string) => {
        return new Date(`${date}T00:00:00`).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const validityText = (reward: Reward) => {
        if (reward.start_date && reward.end_date) {
            return `${formatDate(reward.start_date)} – ${formatDate(reward.end_date)}`;
        }

        if (reward.start_date) {
            return `Available from ${formatDate(reward.start_date)}`;
        }

        return `Available until ${formatDate(reward.end_date!)}`;
    };

    const availableRewards = rewards.filter((reward) => !reward.is_maxed);
    const lowestCost =
        availableRewards.length > 0
            ? Math.min(...availableRewards.map((r) => r.points_required))
            : null;

    return (
        <CustomerLayout>
            <Head title="Available Rewards" />

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
                                Available Rewards
                            </h1>

                            <p className="mt-3 max-w-xl text-base text-red-50/90">
                                View the rewards currently available in the
                                Ramyeon Corner loyalty program.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-700 text-white">
                                <MaterialIcon
                                    name="redeem"
                                    className="text-[26px]"
                                />
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-700">
                                    Available now
                                </p>
                                <p className="mt-0.5 text-lg font-semibold text-gray-900">
                                    {availableRewards.length}{' '}
                                    {availableRewards.length === 1
                                        ? 'reward'
                                        : 'rewards'}
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* Overview */}
                    <section>
                        <div className="mb-4 flex items-baseline justify-between gap-4">
                            <h2 className="text-base font-semibold text-gray-900">
                                Rewards overview
                            </h2>
                            <p className="text-sm text-gray-400">
                                Live application data
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <StatCard
                                label="Total Rewards"
                                value={rewards.length.toLocaleString()}
                                icon="redeem"
                                tone="red"
                                footer="Listed in the loyalty program"
                            />

                            <StatCard
                                label="Available Now"
                                value={availableRewards.length.toLocaleString()}
                                icon="check_circle"
                                tone="amber"
                                footer="Ready to redeem at the cashier"
                            />

                            <StatCard
                                label="Lowest Cost"
                                value={
                                    lowestCost === null
                                        ? '—'
                                        : `${lowestCost.toLocaleString()} pts`
                                }
                                icon="stars"
                                tone="slate"
                                footer="Cheapest available reward"
                            />
                        </div>
                    </section>

                    {/* How to redeem */}
                    <section className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:items-center sm:p-6">
                        <IconChip name="storefront" tone="red" />

                        <div className="min-w-0">
                            <h2 className="text-base font-semibold text-gray-900">
                                How to redeem
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Visit the cashier to redeem an available reward
                                using your loyalty points.
                            </p>
                        </div>
                    </section>

                    {/* Rewards */}
                    <section>
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-gray-900">
                                All rewards
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Choose a reward and ask the cashier to redeem
                                it.
                            </p>
                        </div>

                        {rewards.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {rewards.map((reward) => {
                                    const isDiscount =
                                        reward.reward_type === 'discount' &&
                                        reward.reward_value !== null;

                                    return (
                                        <article
                                            key={reward.id}
                                            className={`flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 ${
                                                reward.is_maxed
                                                    ? 'opacity-75'
                                                    : 'hover:border-red-200 hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <p className="text-sm text-gray-500">
                                                        {reward.reward_type ===
                                                        'discount'
                                                            ? 'Discount reward'
                                                            : 'Free item reward'}
                                                    </p>

                                                    <p
                                                        className={`mt-3 text-3xl font-semibold tracking-tight tabular-nums ${
                                                            reward.is_maxed
                                                                ? 'text-gray-500'
                                                                : 'text-gray-900'
                                                        }`}
                                                    >
                                                        {isDiscount ? (
                                                            <>
                                                                ₱
                                                                {Number(
                                                                    reward.reward_value,
                                                                ).toLocaleString(
                                                                    'en-PH',
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    },
                                                                )}{' '}
                                                                <span className="text-lg font-medium text-gray-400">
                                                                    off
                                                                </span>
                                                            </>
                                                        ) : (
                                                            'Free item'
                                                        )}
                                                    </p>
                                                </div>

                                                <IconChip
                                                    name={
                                                        reward.reward_type ===
                                                        'discount'
                                                            ? 'local_offer'
                                                            : 'card_giftcard'
                                                    }
                                                    tone={
                                                        reward.is_maxed
                                                            ? 'slate'
                                                            : reward.reward_type ===
                                                                'discount'
                                                              ? 'red'
                                                              : 'amber'
                                                    }
                                                />
                                            </div>

                                            <div className="mt-5">
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    {reward.reward_name}
                                                </h3>

                                                {reward.description && (
                                                    <p className="mt-1.5 text-sm leading-6 text-gray-500">
                                                        {reward.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-auto pt-5">
                                                <div className="space-y-2.5 border-t border-gray-100 pt-4">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums ${
                                                                reward.is_maxed
                                                                    ? 'text-gray-500'
                                                                    : 'text-red-700'
                                                            }`}
                                                        >
                                                            <MaterialIcon
                                                                name="stars"
                                                                className="text-[18px]"
                                                            />
                                                            {reward.points_required.toLocaleString()}{' '}
                                                            pts
                                                        </span>

                                                        {reward.is_maxed && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                                                                <MaterialIcon
                                                                    name="check_circle"
                                                                    className="text-[15px]"
                                                                />
                                                                Claimed{' '}
                                                                {
                                                                    reward.times_redeemed
                                                                }
                                                                {reward.redemption_limit
                                                                    ? `/${reward.redemption_limit}`
                                                                    : ''}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {(reward.start_date ||
                                                        reward.end_date) && (
                                                        <p className="flex items-center gap-2 text-xs text-gray-400">
                                                            <MaterialIcon
                                                                name="event"
                                                                className="text-[16px]"
                                                            />
                                                            {validityText(
                                                                reward,
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                    <MaterialIcon
                                        name="redeem"
                                        className="text-[24px]"
                                    />
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-gray-900">
                                    No rewards available
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                                    There are currently no rewards available.
                                    Check back again later for new loyalty
                                    rewards.
                                </p>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </CustomerLayout>
    );
}