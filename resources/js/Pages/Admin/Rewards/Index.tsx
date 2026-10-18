import AdminModal from '@/Components/AdminModal';
import AdminPageHeader from '@/Components/AdminPageHeader';
import FlashMessage from '@/Components/FlashMessage';
import StatusBadge from '@/Components/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';

interface Reward {
    id: number;
    reward_name: string;
    reward_type: 'discount' | 'free_item';
    points_required: number;
    reward_value: string | null;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
    redemption_limit: number | null;
}

interface Props {
    rewards: Reward[];
}

type ModalState = { mode: 'create' } | { mode: 'edit'; reward: Reward } | null;

type StatusFilter = 'all' | 'active' | 'inactive';

const inputClass =
    'block w-full rounded-lg border-stone-300 bg-white text-sm shadow-sm placeholder:text-stone-400 focus:border-red-500 focus:ring-red-500';

const secondaryButton =
    'rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:cursor-not-allowed disabled:opacity-50';

const primaryButton =
    'rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const GRID =
    'md:grid-cols-[minmax(0,2.4fr)_5.5rem_minmax(0,1.2fr)_minmax(0,1fr)_7.5rem_11rem]';

const peso = (value: string | number) =>
    Number(value).toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

/** Parse "YYYY-MM-DD" as a local date to avoid timezone shifts. */
const parseDate = (value: string | null) => {
    if (!value) return null;
    const [y, m, d] = value.slice(0, 10).split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
};

const shortDate = (date: Date, withYear = true) =>
    date.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        ...(withYear ? { year: 'numeric' } : {}),
    });

const startOfToday = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/** Human-readable validity window plus a tone for emphasis. */
function schedule(reward: Reward): { text: string; tone: 'muted' | 'warn' } {
    const start = parseDate(reward.start_date);
    const end = parseDate(reward.end_date);
    const today = startOfToday();

    if (end && end < today) {
        return { text: `Ended ${shortDate(end)}`, tone: 'warn' };
    }
    if (start && start > today) {
        return {
            text: end
                ? `Starts ${shortDate(start, false)}, ends ${shortDate(end)}`
                : `Starts ${shortDate(start)}`,
            tone: 'muted',
        };
    }
    if (end) return { text: `Until ${shortDate(end)}`, tone: 'muted' };
    if (start) return { text: `Since ${shortDate(start)}`, tone: 'muted' };

    return { text: 'No end date', tone: 'muted' };
}

function Field({
    label,
    htmlFor,
    error,
    hint,
    optional,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    hint?: string;
    optional?: boolean;
    children: ReactNode;
}) {
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="flex items-baseline justify-between text-sm font-medium text-stone-800"
            >
                {label}
                {optional && (
                    <span className="text-xs font-normal text-stone-400">
                        Optional
                    </span>
                )}
            </label>
            <div className="mt-1.5">{children}</div>
            {error ? (
                <p className="mt-1.5 text-sm text-red-600">{error}</p>
            ) : hint ? (
                <p className="mt-1.5 text-sm text-stone-500">{hint}</p>
            ) : null}
        </div>
    );
}

function FormSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <fieldset className="border-t border-stone-200 pt-5 first:border-t-0 first:pt-0">
            <legend className="mb-4 text-sm font-semibold text-stone-900">
                {title}
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">{children}</div>
        </fieldset>
    );
}

export default function Index({ rewards }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            reward_name: '',
            reward_type: 'discount' as 'discount' | 'free_item',
            points_required: '',
            reward_value: '',
            description: '',
            start_date: '',
            end_date: '',
            is_active: true,
            redemption_limit: '',
        });

    const { flash } = usePage<PageProps>().props;

    const [modal, setModal] = useState<ModalState>(null);
    const [confirmTarget, setConfirmTarget] = useState<Reward | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<StatusFilter>('all');

    const isEditing = modal?.mode === 'edit';
    const isDiscount = data.reward_type === 'discount';

    const datesInvalid =
        !!data.start_date && !!data.end_date && data.end_date < data.start_date;

    /* ---------- Derived data ---------- */

    const counts = useMemo(
        () => ({
            all: rewards.length,
            active: rewards.filter((r) => r.is_active).length,
            inactive: rewards.filter((r) => !r.is_active).length,
        }),
        [rewards],
    );

    const visibleRewards = useMemo(() => {
        const term = query.trim().toLowerCase();

        return rewards.filter((reward) => {
            if (filter === 'active' && !reward.is_active) return false;
            if (filter === 'inactive' && reward.is_active) return false;
            if (!term) return true;

            return (
                reward.reward_name.toLowerCase().includes(term) ||
                (reward.description ?? '').toLowerCase().includes(term)
            );
        });
    }, [rewards, query, filter]);

    /* ---------- Modal handlers ---------- */

    const openCreateForm = () => {
        reset();
        clearErrors();
        setModal({ mode: 'create' });
    };

    const openEditForm = (reward: Reward) => {
        clearErrors();
        setData({
            reward_name: reward.reward_name,
            reward_type: reward.reward_type,
            points_required: String(reward.points_required),
            reward_value: reward.reward_value ?? '',
            description: reward.description ?? '',
            start_date: reward.start_date ?? '',
            end_date: reward.end_date ?? '',
            is_active: reward.is_active,
            redemption_limit: reward.redemption_limit
                ? String(reward.redemption_limit)
                : '',
        });
        setModal({ mode: 'edit', reward });
    };

    const closeForm = () => {
        if (processing) return;
        setModal(null);
        reset();
        clearErrors();
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!modal || datesInvalid) return;

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setModal(null);
            },
        };

        if (modal.mode === 'edit') {
            put(`/admin/rewards/${modal.reward.id}`, options);
        } else {
            post('/admin/rewards', options);
        }
    };

    /* ---------- Status toggle ---------- */

    const confirmToggle = () => {
        if (!confirmTarget) return;

        const target = confirmTarget;
        setTogglingId(target.id);

        router.patch(
            `/admin/rewards/${target.id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setTogglingId(null);
                    setConfirmTarget(null);
                },
            },
        );
    };

    /* ---------- Render ---------- */

    const filters: { key: StatusFilter; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'active', label: 'Active' },
        { key: 'inactive', label: 'Inactive' },
    ];

    return (
        <AdminLayout>
            <Head title="Rewards" />

            <div className="min-h-screen bg-stone-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-6xl">
                    <AdminPageHeader
                        eyebrow="Reward Management"
                        title="Rewards"
                        description="Create and manage loyalty rewards for Ramyeon Corner customers."
                        action={
                            <button
                                type="button"
                                onClick={openCreateForm}
                                className={`${primaryButton} inline-flex shrink-0 items-center justify-center gap-2 shadow-sm`}
                            >
                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M12 5v14" />
                                    <path d="M5 12h14" />
                                </svg>
                                Create reward
                            </button>
                        }
                    />

                    <FlashMessage success={flash.success} error={flash.error} />

                    <section className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                        {/* Toolbar */}
                        <div className="flex flex-col gap-3 border-b border-stone-200 bg-stone-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full sm:max-w-xs">
                                <label htmlFor="reward-search" className="sr-only">
                                    Search rewards
                                </label>
                                <svg
                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m20 20-3.5-3.5" />
                                </svg>
                                <input
                                    id="reward-search"
                                    type="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search rewards"
                                    className={`${inputClass} pl-9`}
                                />
                            </div>

                            <div
                                role="group"
                                aria-label="Filter by status"
                                className="inline-flex self-start rounded-lg bg-stone-200/60 p-1 sm:self-auto"
                            >
                                {filters.map(({ key, label }) => {
                                    const selected = filter === key;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() => setFilter(key)}
                                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                                                selected
                                                    ? 'bg-white text-stone-900 shadow-sm'
                                                    : 'text-stone-600 hover:text-stone-900'
                                            }`}
                                        >
                                            {label}
                                            <span
                                                className={`ml-1.5 tabular-nums ${
                                                    selected ? 'text-red-600' : 'text-stone-400'
                                                }`}
                                            >
                                                {counts[key]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Empty states */}
                        {rewards.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                                    <svg
                                        className="h-6 w-6"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <rect x="3" y="8" width="18" height="4" rx="1" />
                                        <path d="M12 8v13" />
                                        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                                        <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
                                    </svg>
                                </div>
                                <p className="mt-4 text-sm font-semibold text-stone-900">
                                    No rewards yet
                                </p>
                                <p className="mt-1 text-sm text-stone-500">
                                    Create a reward that customers can redeem with their points.
                                </p>
                                <button
                                    type="button"
                                    onClick={openCreateForm}
                                    className={`${primaryButton} mt-5`}
                                >
                                    Create reward
                                </button>
                            </div>
                        ) : visibleRewards.length === 0 ? (
                            <div className="px-6 py-14 text-center">
                                <p className="text-sm font-semibold text-stone-900">
                                    No matching rewards
                                </p>
                                <p className="mt-1 text-sm text-stone-500">
                                    Try a different search or clear the filter.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery('');
                                        setFilter('all');
                                    }}
                                    className="mt-4 text-sm font-semibold text-red-600 hover:text-red-700 focus:outline-none focus-visible:underline"
                                >
                                    Clear search and filter
                                </button>
                            </div>
                        ) : (
                            <ul className="divide-y divide-stone-100">
                                {/* Column labels (desktop) */}
                                <li
                                    aria-hidden="true"
                                    className={`hidden px-6 py-3 text-xs font-medium text-stone-500 md:grid md:gap-4 ${GRID}`}
                                >
                                    <span>Reward</span>
                                    <span>Cost</span>
                                    <span>Type</span>
                                    <span>Limit</span>
                                    <span>Status</span>
                                    <span className="text-right">Actions</span>
                                </li>

                                {visibleRewards.map((reward) => {
                                    const when = schedule(reward);
                                    const busy = togglingId === reward.id;
                                    const isDiscountReward =
                                        reward.reward_type === 'discount';

                                    return (
                                        <li
                                            key={reward.id}
                                            className={`grid items-center gap-x-4 gap-y-3 px-4 py-4 transition-colors hover:bg-stone-50/70 sm:px-6 ${GRID}`}
                                        >
                                            {/* Reward */}
                                            <div className="min-w-0">
                                                <p
                                                    className={`text-sm font-semibold ${
                                                        reward.is_active
                                                            ? 'text-stone-900'
                                                            : 'text-stone-500'
                                                    }`}
                                                >
                                                    {reward.reward_name}
                                                </p>
                                                {reward.description && (
                                                    <p className="mt-0.5 line-clamp-2 max-w-md text-sm text-stone-500">
                                                        {reward.description}
                                                    </p>
                                                )}
                                                <p
                                                    className={`mt-1 text-xs ${
                                                        when.tone === 'warn'
                                                            ? 'font-medium text-amber-700'
                                                            : 'text-stone-400'
                                                    }`}
                                                >
                                                    {when.text}
                                                </p>
                                            </div>

                                            {/* Cost */}
                                            <p className="text-sm font-semibold tabular-nums text-stone-900">
                                                {reward.points_required.toLocaleString('en-PH')}
                                                <span className="ml-1 font-normal text-stone-500">
                                                    pts
                                                </span>
                                            </p>

                                            {/* Type + value */}
                                            <div className="text-sm">
                                                <p className="text-stone-800">
                                                    {isDiscountReward ? 'Discount' : 'Free item'}
                                                </p>
                                                {reward.reward_value && (
                                                    <p className="text-xs text-stone-500">
                                                        {isDiscountReward
                                                            ? `${peso(reward.reward_value)} off`
                                                            : `${peso(reward.reward_value)} value`}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Limit */}
                                            <p className="text-sm text-stone-600">
                                                {reward.redemption_limit
                                                    ? `${reward.redemption_limit}× per customer`
                                                    : 'Unlimited'}
                                            </p>

                                            {/* Status */}
                                            <div>
                                                <StatusBadge active={reward.is_active} />
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 md:justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditForm(reward)}
                                                    className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={busy}
                                                    onClick={() => setConfirmTarget(reward)}
                                                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
                                                        reward.is_active
                                                            ? 'text-red-700 hover:bg-red-50 focus-visible:ring-red-500'
                                                            : 'bg-green-50 text-green-700 hover:bg-green-100 focus-visible:ring-green-500'
                                                    }`}
                                                >
                                                    {reward.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </div>
            </div>

            {/* Create / edit modal */}
            {modal && (
                <AdminModal
                    title={isEditing ? 'Edit reward' : 'Create reward'}
                    description={
                        isEditing
                            ? 'Update the details of this loyalty reward.'
                            : 'Add a new reward for customers to redeem with points.'
                    }
                    onClose={closeForm}
                    maxWidthClass="max-w-2xl"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={processing}
                                className={secondaryButton}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                form="reward-form"
                                disabled={processing || datesInvalid}
                                className={primaryButton}
                            >
                                {isEditing
                                    ? processing
                                        ? 'Saving...'
                                        : 'Save changes'
                                    : processing
                                      ? 'Creating...'
                                      : 'Create reward'}
                            </button>
                        </>
                    }
                >
                    <form id="reward-form" onSubmit={submit}>
                        <div className="space-y-5 px-6 py-6">
                            <FormSection title="Reward details">
                                <div className="sm:col-span-2">
                                    <Field
                                        label="Name"
                                        htmlFor="reward_name"
                                        error={errors.reward_name}
                                    >
                                        <input
                                            id="reward_name"
                                            type="text"
                                            value={data.reward_name}
                                            onChange={(e) => setData('reward_name', e.target.value)}
                                            placeholder="₱50 off coupon"
                                            className={inputClass}
                                            autoFocus
                                        />
                                    </Field>
                                </div>

                                <div className="sm:col-span-2">
                                    <Field
                                        label="Description"
                                        htmlFor="description"
                                        error={errors.description}
                                        optional
                                    >
                                        <textarea
                                            id="description"
                                            rows={2}
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="What does the customer get?"
                                            className={`${inputClass} resize-none`}
                                        />
                                    </Field>
                                </div>
                            </FormSection>

                            <FormSection title="Cost and value">
                                <Field
                                    label="Reward type"
                                    htmlFor="reward_type"
                                    error={errors.reward_type}
                                >
                                    <select
                                        id="reward_type"
                                        value={data.reward_type}
                                        onChange={(e) =>
                                            setData(
                                                'reward_type',
                                                e.target.value as 'discount' | 'free_item',
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="discount">Discount</option>
                                        <option value="free_item">Free item</option>
                                    </select>
                                </Field>

                                <Field
                                    label="Points required"
                                    htmlFor="points_required"
                                    error={errors.points_required}
                                >
                                    <input
                                        id="points_required"
                                        type="number"
                                        inputMode="numeric"
                                        min="1"
                                        value={data.points_required}
                                        onChange={(e) => setData('points_required', e.target.value)}
                                        placeholder="200"
                                        className={inputClass}
                                    />
                                </Field>

                                <Field
                                    label={isDiscount ? 'Discount amount' : 'Item value'}
                                    htmlFor="reward_value"
                                    error={errors.reward_value}
                                    hint={
                                        isDiscount
                                            ? 'Amount taken off the customer’s order.'
                                            : 'Retail value of the free item, if you want to track it.'
                                    }
                                    optional={!isDiscount}
                                >
                                    <div className="relative">
                                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-stone-500">
                                            ₱
                                        </span>
                                        <input
                                            id="reward_value"
                                            type="number"
                                            inputMode="decimal"
                                            min="0"
                                            step="0.01"
                                            value={data.reward_value}
                                            onChange={(e) => setData('reward_value', e.target.value)}
                                            placeholder="50.00"
                                            className={`${inputClass} pl-8`}
                                        />
                                    </div>
                                </Field>

                                <Field
                                    label="Redemption limit"
                                    htmlFor="redemption_limit"
                                    error={errors.redemption_limit}
                                    hint="Times each customer can redeem this. Leave blank for unlimited."
                                    optional
                                >
                                    <input
                                        id="redemption_limit"
                                        type="number"
                                        inputMode="numeric"
                                        min="1"
                                        max="1000"
                                        value={data.redemption_limit}
                                        onChange={(e) => setData('redemption_limit', e.target.value)}
                                        placeholder="Unlimited"
                                        className={inputClass}
                                    />
                                </Field>
                            </FormSection>

                            <FormSection title="Availability">
                                <Field
                                    label="Start date"
                                    htmlFor="start_date"
                                    error={errors.start_date}
                                    optional
                                >
                                    <input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>

                                <Field
                                    label="End date"
                                    htmlFor="end_date"
                                    error={
                                        errors.end_date ??
                                        (datesInvalid
                                            ? 'End date must be on or after the start date.'
                                            : undefined)
                                    }
                                    optional
                                >
                                    <input
                                        id="end_date"
                                        type="date"
                                        min={data.start_date || undefined}
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>

                                <div className="sm:col-span-2">
                                    <div className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
                                        <div id="is_active_label">
                                            <p className="text-sm font-medium text-stone-800">
                                                Available for redemption
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                Turn off to hide this reward from customers.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={data.is_active}
                                            aria-labelledby="is_active_label"
                                            onClick={() => setData('is_active', !data.is_active)}
                                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
                                                data.is_active ? 'bg-red-600' : 'bg-stone-300'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                                    data.is_active ? 'translate-x-5' : 'translate-x-0.5'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {errors.is_active && (
                                        <p className="mt-1.5 text-sm text-red-600">
                                            {errors.is_active}
                                        </p>
                                    )}
                                </div>
                            </FormSection>
                        </div>
                    </form>
                </AdminModal>
            )}

            {/* Activate / deactivate confirmation */}
            {confirmTarget && (
                <AdminModal
                    title={
                        confirmTarget.is_active
                            ? `Deactivate “${confirmTarget.reward_name}”?`
                            : `Activate “${confirmTarget.reward_name}”?`
                    }
                    description={
                        confirmTarget.is_active
                            ? 'Customers will no longer be able to redeem it.'
                            : 'Customers will be able to redeem it again.'
                    }
                    onClose={() => {
                        if (togglingId === null) setConfirmTarget(null);
                    }}
                    maxWidthClass="max-w-md"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setConfirmTarget(null)}
                                disabled={togglingId !== null}
                                className={secondaryButton}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmToggle}
                                disabled={togglingId !== null}
                                className={
                                    confirmTarget.is_active
                                        ? primaryButton
                                        : 'rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                }
                            >
                                {confirmTarget.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                        </>
                    }
                >
                    <div className="px-6 py-5 text-sm text-stone-600">
                        Costs{' '}
                        <span className="font-medium text-stone-900">
                            {confirmTarget.points_required.toLocaleString('en-PH')} pts
                        </span>
                        . It is currently{' '}
                        {confirmTarget.is_active ? 'active' : 'inactive'}.
                    </div>
                </AdminModal>
            )}
        </AdminLayout>
    );
}