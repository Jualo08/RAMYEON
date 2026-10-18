import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminModal from '@/Components/AdminModal';
import StatusBadge from '@/Components/StatusBadge';
import { FormEventHandler, ReactNode, useMemo, useState } from 'react';

type Cashier = {
    id: number;
    name: string;
    username: string;
    email: string | null;
    role: 'cashier';
    is_active: boolean;
    created_at: string;
};

type Props = {
    cashiers: Cashier[];
};

type ModalState = { mode: 'create' } | { mode: 'edit'; cashier: Cashier } | null;

type StatusFilter = 'all' | 'active' | 'inactive';

const inputClass =
    'block w-full rounded-lg border-stone-300 bg-white text-sm shadow-sm placeholder:text-stone-400 focus:border-red-500 focus:ring-red-500';

const secondaryButton =
    'rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:cursor-not-allowed disabled:opacity-50';

const primaryButton =
    'rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const initials = (name: string) =>
    name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

function Field({
    label,
    htmlFor,
    error,
    hint,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="block text-sm font-medium text-stone-800"
            >
                {label}
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

function PasswordField({
    id,
    label,
    value,
    onChange,
    placeholder,
    error,
    hint,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    error?: string;
    hint?: string;
}) {
    const [visible, setVisible] = useState(false);

    return (
        <Field label={label} htmlFor={id} error={error} hint={hint}>
            <div className="relative">
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${inputClass} pr-11`}
                    placeholder={placeholder}
                    autoComplete="new-password"
                />
                <button
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-stone-400 transition-colors hover:text-stone-600 focus:outline-none focus-visible:text-red-600"
                    aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                >
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
                        {visible ? (
                            <>
                                <path d="M3 3l18 18" />
                                <path d="M10.58 10.58a2 2 0 1 0 2.84 2.84" />
                                <path d="M9.88 4.24A10.9 10.9 0 0 1 12 4c5.52 0 9.5 8 9.5 8a18.2 18.2 0 0 1-3.04 4.04" />
                                <path d="M6.61 6.61A18.6 18.6 0 0 0 2.5 12S6.48 20 12 20c1.72 0 3.27-.66 4.64-1.48" />
                            </>
                        ) : (
                            <>
                                <path d="M2.5 12S6.48 4 12 4s9.5 8 9.5 8-3.98 8-9.5 8-9.5-8-9.5-8Z" />
                                <circle cx="12" cy="12" r="2.75" />
                            </>
                        )}
                    </svg>
                </button>
            </div>
        </Field>
    );
}

export default function Index({ cashiers }: Props) {
    const [modal, setModal] = useState<ModalState>(null);
    const [confirmTarget, setConfirmTarget] = useState<Cashier | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<StatusFilter>('all');

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            username: '',
            password: '',
            confirm_password: '',
        });

    const isEditing = modal?.mode === 'edit';

    /* ---------- Derived data ---------- */

    const counts = useMemo(
        () => ({
            all: cashiers.length,
            active: cashiers.filter((c) => c.is_active).length,
            inactive: cashiers.filter((c) => !c.is_active).length,
        }),
        [cashiers],
    );

    const visibleCashiers = useMemo(() => {
        const term = query.trim().toLowerCase();

        return cashiers.filter((cashier) => {
            if (filter === 'active' && !cashier.is_active) return false;
            if (filter === 'inactive' && cashier.is_active) return false;
            if (!term) return true;

            return (
                cashier.name.toLowerCase().includes(term) ||
                cashier.username.toLowerCase().includes(term)
            );
        });
    }, [cashiers, query, filter]);

    const passwordMismatch =
        data.confirm_password.length > 0 &&
        data.password !== data.confirm_password;

    /* ---------- Modal handlers ---------- */

    const openCreate = () => {
        reset();
        clearErrors();
        setModal({ mode: 'create' });
    };

    const openEdit = (cashier: Cashier) => {
        clearErrors();
        setData({
            name: cashier.name,
            username: cashier.username,
            password: '',
            confirm_password: '',
        });
        setModal({ mode: 'edit', cashier });
    };

    const closeModal = () => {
        if (processing) return;
        setModal(null);
        reset();
        clearErrors();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!modal) return;

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setModal(null);
            },
        };

        if (modal.mode === 'edit') {
            put(route('admin.cashiers.update', modal.cashier.id), options);
        } else {
            post(route('admin.cashiers.store'), options);
        }
    };

    /* ---------- Status toggle ---------- */

    const confirmToggle = () => {
        if (!confirmTarget) return;

        const target = confirmTarget;
        setTogglingId(target.id);

        router.patch(
            route('admin.cashiers.toggle-status', target.id),
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
            <Head title="Cashier Management" />

            <div className="min-h-screen bg-stone-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-6xl">
                    <AdminPageHeader
                        eyebrow="Account Management"
                        title="Cashiers"
                        description="Create and manage cashier accounts for Ramyeon Corner."
                        action={
                            <button
                                type="button"
                                onClick={openCreate}
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
                                Add cashier
                            </button>
                        }
                    />

                    <section className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                        {/* Toolbar */}
                        <div className="flex flex-col gap-3 border-b border-stone-200 bg-stone-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full sm:max-w-xs">
                                <label htmlFor="cashier-search" className="sr-only">
                                    Search cashiers
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
                                    id="cashier-search"
                                    type="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search by name or username"
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
                        {cashiers.length === 0 ? (
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
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M19 8v6" />
                                        <path d="M22 11h-6" />
                                    </svg>
                                </div>
                                <p className="mt-4 text-sm font-semibold text-stone-900">
                                    No cashiers yet
                                </p>
                                <p className="mt-1 text-sm text-stone-500">
                                    Add a cashier so your staff can log in to the POS.
                                </p>
                                <button
                                    type="button"
                                    onClick={openCreate}
                                    className={`${primaryButton} mt-5`}
                                >
                                    Add cashier
                                </button>
                            </div>
                        ) : visibleCashiers.length === 0 ? (
                            <div className="px-6 py-14 text-center">
                                <p className="text-sm font-semibold text-stone-900">
                                    No matching cashiers
                                </p>
                                <p className="mt-1 text-sm text-stone-500">
                                    Try a different name or clear the filter.
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
                                    className="hidden px-6 py-3 text-xs font-medium text-stone-500 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_8rem_13rem] md:gap-4"
                                >
                                    <span>Cashier</span>
                                    <span>Username</span>
                                    <span>Status</span>
                                    <span className="text-right">Actions</span>
                                </li>

                                {visibleCashiers.map((cashier) => {
                                    const added = formatDate(cashier.created_at);
                                    const busy = togglingId === cashier.id;

                                    return (
                                        <li
                                            key={cashier.id}
                                            className="grid items-center gap-x-4 gap-y-3 px-4 py-4 transition-colors hover:bg-stone-50/70 sm:px-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_8rem_13rem]"
                                        >
                                            {/* Cashier */}
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                                                        cashier.is_active
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-stone-100 text-stone-400'
                                                    }`}
                                                >
                                                    {initials(cashier.name)}
                                                </div>

                                                <div className="min-w-0">
                                                    <p
                                                        className={`truncate text-sm font-semibold ${
                                                            cashier.is_active
                                                                ? 'text-stone-900'
                                                                : 'text-stone-500'
                                                        }`}
                                                    >
                                                        {cashier.name}
                                                    </p>
                                                    <p className="truncate text-xs text-stone-500 md:hidden">
                                                        @{cashier.username}
                                                    </p>
                                                    {added && (
                                                        <p className="mt-0.5 hidden text-xs text-stone-400 md:block">
                                                            Added {added}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Username (desktop) */}
                                            <p className="hidden truncate text-sm text-stone-700 md:block">
                                                @{cashier.username}
                                            </p>

                                            {/* Status */}
                                            <div className="hidden md:block">
                                                <StatusBadge active={cashier.is_active} />
                                            </div>

                                            {/* Actions + mobile status */}
                                            <div className="flex items-center justify-between gap-2 md:justify-end">
                                                <div className="md:hidden">
                                                    <StatusBadge active={cashier.is_active} />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(cashier)}
                                                        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        onClick={() => setConfirmTarget(cashier)}
                                                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
                                                            cashier.is_active
                                                                ? 'text-red-700 hover:bg-red-50 focus-visible:ring-red-500'
                                                                : 'bg-green-50 text-green-700 hover:bg-green-100 focus-visible:ring-green-500'
                                                        }`}
                                                    >
                                                        {cashier.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </div>
            </div>

            {/* Add / edit modal */}
            {modal && (
                <AdminModal
                    title={isEditing ? 'Edit cashier' : 'Add cashier'}
                    description={
                        isEditing
                            ? `Update the account details for ${modal.cashier.name}.`
                            : 'Create an account that staff can use to log in.'
                    }
                    onClose={closeModal}
                    maxWidthClass="max-w-2xl"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={processing}
                                className={secondaryButton}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                form="cashier-form"
                                disabled={processing || (!isEditing && passwordMismatch)}
                                className={primaryButton}
                            >
                                {isEditing
                                    ? processing
                                        ? 'Saving...'
                                        : 'Save changes'
                                    : processing
                                      ? 'Creating...'
                                      : 'Create cashier'}
                            </button>
                        </>
                    }
                >
                    <form
                        id="cashier-form"
                        onSubmit={submit}
                        className="grid gap-5 px-6 py-6 sm:grid-cols-2"
                    >
                        <Field label="Full name" htmlFor="cashier_name" error={errors.name}>
                            <input
                                id="cashier_name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={inputClass}
                                placeholder="Juan Dela Cruz"
                                autoFocus
                            />
                        </Field>

                        <Field
                            label="Username"
                            htmlFor="cashier_username"
                            error={errors.username}
                        >
                            <input
                                id="cashier_username"
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                className={inputClass}
                                placeholder="juan123"
                                autoCapitalize="none"
                                autoComplete="off"
                            />
                        </Field>

                        {!isEditing && (
                            <>
                                <PasswordField
                                    id="cashier_password"
                                    label="Password"
                                    value={data.password}
                                    onChange={(value) => setData('password', value)}
                                    placeholder="At least 8 characters"
                                    error={errors.password}
                                />

                                <PasswordField
                                    id="cashier_confirm_password"
                                    label="Confirm password"
                                    value={data.confirm_password}
                                    onChange={(value) => setData('confirm_password', value)}
                                    placeholder="Re-enter password"
                                    error={
                                        errors.confirm_password ??
                                        (passwordMismatch
                                            ? 'Passwords do not match.'
                                            : undefined)
                                    }
                                />
                            </>
                        )}
                    </form>
                </AdminModal>
            )}

            {/* Activate / deactivate confirmation */}
            {confirmTarget && (
                <AdminModal
                    title={
                        confirmTarget.is_active
                            ? `Deactivate ${confirmTarget.name}?`
                            : `Activate ${confirmTarget.name}?`
                    }
                    description={
                        confirmTarget.is_active
                            ? 'They will no longer be able to log in.'
                            : 'They will be able to log in again.'
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
                        <span className="font-medium text-stone-900">
                            @{confirmTarget.username}
                        </span>{' '}
                        is currently{' '}
                        {confirmTarget.is_active ? 'active' : 'inactive'}.
                    </div>
                </AdminModal>
            )}
        </AdminLayout>
    );
}