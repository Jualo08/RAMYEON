import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import StatusBadge from '@/Components/StatusBadge';
import FlashMessage from '@/Components/FlashMessage';
import { PageProps } from '@/types';

interface Customer {
    id: number;
    customer_code: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string | null;
    points: number;
    is_active: boolean;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

const formatNumber = (value: number | string) =>
    Number(value).toLocaleString('en-PH');

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const iconProps = {
    className: 'h-4 w-4',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
};

const SearchIcon = () => (
    <svg {...iconProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
    </svg>
);

const EyeIcon = () => (
    <svg {...iconProps}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const TrashIcon = () => (
    <svg {...iconProps}>
        <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" />
    </svg>
);

const CopyIcon = () => (
    <svg {...iconProps} strokeWidth={2}>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
);

const CheckIcon = () => (
    <svg {...iconProps} strokeWidth={2} className="h-4 w-4 text-green-600">
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const UsersIcon = () => (
    <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
        />
        <circle cx="9" cy="7" r="4" />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        />
    </svg>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Index({
    customers,
    filters,
}: {
    customers: Paginated<Customer>;
    filters: { search: string };
}) {
    const { flash } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters.search ?? '');

    const [copiedCustomerId, setCopiedCustomerId] =
        useState<number | null>(null);

    /**
     * Search customers
     */
    const submitSearch = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            route('cashier.customers.index'),
            { search },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    /**
     * Clear search
     */
    const clearSearch = () => {
        setSearch('');

        router.get(
            route('cashier.customers.index'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    /**
     * Copy customer code
     */
    const handleCopyCustomerCode = async (
        customerId: number,
        customerCode: string,
    ) => {
        try {
            await navigator.clipboard.writeText(customerCode);

            setCopiedCustomerId(customerId);

            window.setTimeout(() => {
                setCopiedCustomerId((current) =>
                    current === customerId ? null : current,
                );
            }, 2000);
        } catch {
            setCopiedCustomerId(null);
        }
    };

    /**
     * Activate / Deactivate customer
     */
    const toggleCustomerStatus = (customer: Customer) => {
        const action = customer.is_active ? 'deactivate' : 'activate';

        if (
            !window.confirm(`Are you sure you want to ${action} this customer?`)
        ) {
            return;
        }

        router.patch(route('cashier.customers.toggle-status', customer.id));
    };

    /**
     * Delete customer
     */
    const deleteCustomer = (customer: Customer) => {
        if (
            !window.confirm(
                `Are you sure you want to permanently delete ${customer.first_name} ${customer.last_name}?`,
            )
        ) {
            return;
        }

        router.delete(route('cashier.customers.destroy', customer.id));
    };

    /* ---------------------------- Shared pieces --------------------------- */

    const renderAvatar = (customer: Customer) => (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600 ring-1 ring-red-100">
            {customer.first_name.charAt(0).toUpperCase()}
            {customer.last_name.charAt(0).toUpperCase()}
        </div>
    );

    const renderCode = (customer: Customer) => {
        const copied = copiedCustomerId === customer.id;

        return (
            <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                    {customer.customer_code}
                </span>

                <button
                    type="button"
                    onClick={() =>
                        void handleCopyCustomerCode(
                            customer.id,
                            customer.customer_code,
                        )
                    }
                    aria-label={
                        copied ? 'Customer code copied' : 'Copy customer code'
                    }
                    title={copied ? 'Copied' : 'Copy customer code'}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
            </span>
        );
    };

    const renderActions = (customer: Customer) => (
        <div className="flex items-center justify-end gap-2">
            <Link
                href={route('cashier.customers.show', customer.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
                <EyeIcon />
                View
            </Link>

            <button
                type="button"
                onClick={() => toggleCustomerStatus(customer)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                    customer.is_active
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                }`}
            >
                {customer.is_active ? 'Deactivate' : 'Activate'}
            </button>

            <button
                type="button"
                onClick={() => deleteCustomer(customer)}
                aria-label={`Delete ${customer.first_name} ${customer.last_name}`}
                title="Delete customer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
                <TrashIcon />
            </button>
        </div>
    );

    const renderPaginationLabel = (label: string) => (
        <span dangerouslySetInnerHTML={{ __html: label }} />
    );

    return (
        <CashierLayout>
            <Head title="Customer Records" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="Customer Management"
                        title="Customer Records"
                        description="Search and view customer loyalty information."
                        action={
                            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                    Records
                                </p>

                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                    {formatNumber(customers.total)}
                                </p>
                            </div>
                        }
                    />

                    <FlashMessage
                        success={flash.success}
                        error={flash.error}
                    />

                    {/* Customer records */}
                    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        {/* Toolbar */}
                        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                    Customer records
                                </h2>

                                <p className="mt-0.5 text-sm text-gray-500">
                                    {filters.search ? (
                                        <>
                                            {formatNumber(customers.total)}{' '}
                                            result
                                            {customers.total !== 1 ? 's' : ''}{' '}
                                            for{' '}
                                            <span className="font-medium text-gray-700">
                                                “{filters.search}”
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            {formatNumber(customers.total)}{' '}
                                            registered customer
                                            {customers.total !== 1 ? 's' : ''}
                                        </>
                                    )}
                                </p>
                            </div>

                            <form
                                onSubmit={submitSearch}
                                role="search"
                                className="flex w-full items-center gap-2 lg:w-auto"
                            >
                                <div className="relative flex-1 lg:w-80 lg:flex-none">
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                                        <SearchIcon />
                                    </span>

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search by name, code, or phone…"
                                        aria-label="Search customers"
                                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
                                >
                                    Search
                                </button>

                                {(search || filters.search) && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                                    >
                                        Clear
                                    </button>
                                )}
                            </form>
                        </div>

                        {customers.data.length > 0 ? (
                            <>
                                {/* Desktop table */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[860px] text-left text-sm">
                                        <thead className="border-b border-gray-100 bg-gray-50/70">
                                            <tr>
                                                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Customer
                                                </th>
                                                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Code
                                                </th>
                                                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Phone
                                                </th>
                                                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Points
                                                </th>
                                                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {customers.data.map((customer) => (
                                                <tr
                                                    key={customer.id}
                                                    className={`transition-colors hover:bg-gray-50/70 ${
                                                        customer.is_active
                                                            ? ''
                                                            : 'bg-gray-50/40'
                                                    }`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div
                                                            className={`flex items-center gap-3 ${
                                                                customer.is_active
                                                                    ? ''
                                                                    : 'opacity-70'
                                                            }`}
                                                        >
                                                            {renderAvatar(customer)}

                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-gray-900">
                                                                    {customer.first_name}{' '}
                                                                    {customer.last_name}
                                                                </p>

                                                                <p className="mt-0.5 max-w-[220px] truncate text-xs text-gray-500">
                                                                    {customer.email ??
                                                                        'No email address'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {renderCode(customer)}
                                                    </td>

                                                    <td className="px-6 py-4 tabular-nums text-gray-600">
                                                        {customer.phone_number}
                                                    </td>

                                                    <td className="px-6 py-4 text-right">
                                                        <span className="font-semibold tabular-nums text-gray-900">
                                                            {formatNumber(customer.points)}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <StatusBadge
                                                            active={customer.is_active}
                                                        />
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {renderActions(customer)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile list */}
                                <ul className="divide-y divide-gray-100 md:hidden">
                                    {customers.data.map((customer) => (
                                        <li key={customer.id} className="p-5">
                                            <div className="flex items-start gap-3">
                                                {renderAvatar(customer)}

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="truncate font-semibold text-gray-900">
                                                            {customer.first_name}{' '}
                                                            {customer.last_name}
                                                        </p>

                                                        <StatusBadge
                                                            active={customer.is_active}
                                                        />
                                                    </div>

                                                    <p className="mt-0.5 truncate text-xs text-gray-500">
                                                        {customer.email ??
                                                            'No email address'}
                                                    </p>
                                                </div>
                                            </div>

                                            <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3 text-xs">
                                                <div>
                                                    <dt className="text-gray-500">
                                                        Code
                                                    </dt>
                                                    <dd className="mt-1">
                                                        {renderCode(customer)}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-gray-500">
                                                        Points
                                                    </dt>
                                                    <dd className="mt-1 text-sm font-semibold tabular-nums text-gray-900">
                                                        {formatNumber(customer.points)}
                                                    </dd>
                                                </div>

                                                <div className="col-span-2">
                                                    <dt className="text-gray-500">
                                                        Phone
                                                    </dt>
                                                    <dd className="mt-0.5 text-sm font-medium tabular-nums text-gray-800">
                                                        {customer.phone_number}
                                                    </dd>
                                                </div>
                                            </dl>

                                            <div className="mt-4">
                                                {renderActions(customer)}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                    <UsersIcon />
                                </div>

                                <p className="mt-4 font-semibold text-gray-800">
                                    {filters.search
                                        ? 'No customers match your search'
                                        : 'No customers found'}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    {filters.search
                                        ? 'Try a different name, code, or phone number.'
                                        : 'No registered customers are currently available.'}
                                </p>

                                {filters.search && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {customers.data.length > 0 && customers.last_page > 1 && (
                            <nav
                                aria-label="Pagination"
                                className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:px-6 md:flex-row md:items-center md:justify-between"
                            >
                                <p className="text-sm text-gray-500">
                                    Showing{' '}
                                    <span className="font-medium text-gray-700">
                                        {customers.from}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium text-gray-700">
                                        {customers.to}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-gray-700">
                                        {formatNumber(customers.total)}
                                    </span>{' '}
                                    customers
                                </p>

                                <div className="flex flex-wrap items-center gap-1">
                                    {customers.links.map((link, index) => {
                                        if (link.url === null) {
                                            return (
                                                <span
                                                    key={index}
                                                    className="rounded-md px-3 py-1.5 text-sm text-gray-300"
                                                >
                                                    {renderPaginationLabel(link.label)}
                                                </span>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                preserveScroll
                                                aria-current={
                                                    link.active ? 'page' : undefined
                                                }
                                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                                                    link.active
                                                        ? 'bg-red-600 text-white'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                {renderPaginationLabel(link.label)}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </nav>
                        )}
                    </section>
                </div>
            </div>
        </CashierLayout>
    );
}