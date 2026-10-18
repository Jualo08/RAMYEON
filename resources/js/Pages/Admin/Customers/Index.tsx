import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminModal from '@/Components/AdminModal';
import StatusBadge from '@/Components/StatusBadge';
import FlashMessage from '@/Components/FlashMessage';
import { PageProps } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { type ReactNode, useMemo, useState } from 'react';

interface CustomerQrCode {
    id: number;
    qr_token: string;
    is_active: boolean;
    created_at: string;
    revoked_at: string | null;
}

interface Customer {
    id: number;
    customer_code: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string | null;
    points: number;
    is_active: boolean;
    qr_code: CustomerQrCode | null;
}

interface Props {
    customers: Customer[];
}

type StatusFilter = 'all' | 'active' | 'inactive';

const formatNumber = (value: number | string) =>
    Number(value).toLocaleString('en-PH');

/* ------------------------------------------------------------------ */
/* Small icons                                                         */
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

const QrIcon = () => (
    <svg {...iconProps}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
    </svg>
);

const EditIcon = () => (
    <svg {...iconProps}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
);

const SearchIcon = () => (
    <svg {...iconProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
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

const statIconProps = {
    className: 'h-5 w-5',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
};

const StatUsersIcon = () => (
    <svg {...statIconProps}>
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
);

const StatUserCheckIcon = () => (
    <svg {...statIconProps}>
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M16 11l2 2 4-4" />
    </svg>
);

const StatStarIcon = () => (
    <svg {...statIconProps}>
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />
    </svg>
);

const StatCard = ({
    label,
    value,
    icon,
    footer,
}: {
    label: string;
    value: string;
    icon: ReactNode;
    footer: ReactNode;
}) => (
    <div className="rounded-2xl border border-t-2 border-gray-100 border-t-red-600 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                    {value}
                </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                {icon}
            </div>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-3 text-sm text-gray-500">
            {footer}
        </div>
    </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Index({ customers }: Props) {
    const [selectedCustomer, setSelectedCustomer] =
        useState<Customer | null>(null);
    const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const { flash } = usePage<PageProps>().props;

    const activeCustomerCount = customers.filter(
        (customer) => customer.is_active,
    ).length;
    const inactiveCustomerCount = customers.length - activeCustomerCount;

    const totalCustomerPoints = customers.reduce(
        (total, customer) => total + Number(customer.points),
        0,
    );

    const filteredCustomers = useMemo(() => {
        const term = search.trim().toLowerCase();

        return customers.filter((customer) => {
            if (statusFilter === 'active' && !customer.is_active) return false;
            if (statusFilter === 'inactive' && customer.is_active) return false;

            if (!term) return true;

            return [
                `${customer.first_name} ${customer.last_name}`,
                customer.customer_code,
                customer.phone_number,
                customer.email ?? '',
            ].some((value) => value.toLowerCase().includes(term));
        });
    }, [customers, search, statusFilter]);

    const hasActiveFilters = search.trim() !== '' || statusFilter !== 'all';

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('all');
    };

    const { data, setData, put, processing, errors, reset, clearErrors } =
        useForm({
            first_name: '',
            last_name: '',
            phone_number: '',
            email: '',
        });

    const openEditModal = (customer: Customer) => {
        setEditCustomer(customer);

        setData({
            first_name: customer.first_name,
            last_name: customer.last_name,
            phone_number: customer.phone_number,
            email: customer.email ?? '',
        });

        clearErrors();
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        if (processing) {
            return;
        }

        reset();
        clearErrors();
        setShowEditModal(false);
        setEditCustomer(null);
    };

    const closeQrModal = () => {
        setSelectedCustomer(null);
    };

    const toggleCustomerStatus = (customer: Customer) => {
        const action = customer.is_active ? 'deactivate' : 'activate';

        if (!confirm(`Are you sure you want to ${action} this customer?`)) {
            return;
        }

        router.patch(`/admin/customers/${customer.id}/status`);
    };

    const canViewQr = (customer: Customer) =>
        Boolean(customer.qr_code && customer.qr_code.is_active);

    /* Shared row actions (table + mobile cards) */
    const renderActions = (customer: Customer) => (
        <div className="flex items-center justify-end gap-2">
            <button
                type="button"
                onClick={() => setSelectedCustomer(customer)}
                disabled={!canViewQr(customer)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
            >
                <QrIcon />
                View QR
            </button>

            <button
                type="button"
                onClick={() => openEditModal(customer)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
                <EditIcon />
                Edit
            </button>

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
        </div>
    );

    const renderAvatar = (customer: Customer) => (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600 ring-1 ring-red-100">
            {customer.first_name.charAt(0).toUpperCase()}
            {customer.last_name.charAt(0).toUpperCase()}
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Customer Management" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="Customer Management"
                        title="Customers"
                        description="View and manage registered loyalty customers and their account status."
                        action={
                            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                    Records
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                    {customers.length.toLocaleString('en-PH')}
                                </p>
                            </div>
                        }
                    />

                    <FlashMessage
                        success={flash.success}
                        error={flash.error}
                    />

                    {/* Summary */}
                    <section
                        aria-label="Customer summary"
                        className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        <StatCard
                            label="Total Customers"
                            value={formatNumber(customers.length)}
                            icon={<StatUsersIcon />}
                            footer="Registered loyalty accounts"
                        />

                        <StatCard
                            label="Active Customers"
                            value={formatNumber(activeCustomerCount)}
                            icon={<StatUserCheckIcon />}
                            footer={
                                <>
                                    <span className="font-semibold text-gray-900">
                                        {formatNumber(inactiveCustomerCount)}
                                    </span>{' '}
                                    inactive
                                </>
                            }
                        />

                        <StatCard
                            label="Total Points"
                            value={formatNumber(totalCustomerPoints)}
                            icon={<StatStarIcon />}
                            footer="Current points across all customers"
                        />
                    </section>

                    {/* Customer records */}
                    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        {/* Toolbar */}
                        <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                    Customer records
                                </h2>
                                <p className="mt-0.5 text-sm text-gray-500">
                                    Showing {formatNumber(filteredCustomers.length)} of{' '}
                                    {formatNumber(customers.length)} customer
                                    {customers.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                {/* Status filter */}
                                <div
                                    role="tablist"
                                    aria-label="Filter by status"
                                    className="inline-flex rounded-lg bg-gray-100 p-1"
                                >
                                    {(
                                        [
                                            ['all', 'All', customers.length],
                                            ['active', 'Active', activeCustomerCount],
                                            [
                                                'inactive',
                                                'Inactive',
                                                inactiveCustomerCount,
                                            ],
                                        ] as [StatusFilter, string, number][]
                                    ).map(([value, label, count]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            role="tab"
                                            aria-selected={statusFilter === value}
                                            onClick={() => setStatusFilter(value)}
                                            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                                                statusFilter === value
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-800'
                                            }`}
                                        >
                                            {label}
                                            <span className="ml-1.5 text-gray-400">
                                                {formatNumber(count)}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Search */}
                                <div className="relative sm:w-72">
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                                        <SearchIcon />
                                    </span>
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search name, code, phone, email"
                                        aria-label="Search customers"
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {filteredCustomers.length > 0 ? (
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
                                            {filteredCustomers.map((customer) => (
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
                                                                    {customer.email ||
                                                                        'No email'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                                                            {customer.customer_code}
                                                        </span>
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
                                    {filteredCustomers.map((customer) => (
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
                                                        {customer.email || 'No email'}
                                                    </p>
                                                </div>
                                            </div>

                                            <dl className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-3 text-xs">
                                                <div>
                                                    <dt className="text-gray-500">Code</dt>
                                                    <dd className="mt-0.5 truncate font-medium text-gray-800">
                                                        {customer.customer_code}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-gray-500">Phone</dt>
                                                    <dd className="mt-0.5 font-medium tabular-nums text-gray-800">
                                                        {customer.phone_number}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-gray-500">Points</dt>
                                                    <dd className="mt-0.5 font-semibold tabular-nums text-gray-900">
                                                        {formatNumber(customer.points)}
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
                                    {hasActiveFilters
                                        ? 'No customers match your filters'
                                        : 'No customers found'}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    {hasActiveFilters
                                        ? 'Try a different search term or status.'
                                        : 'No registered customers are currently available.'}
                                </p>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Edit Customer Modal */}
            {showEditModal && (
                <AdminModal
                    title="Edit Customer"
                    description="Update the customer's account information."
                    onClose={closeEditModal}
                    maxWidthClass="max-w-lg"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={closeEditModal}
                                disabled={processing}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                form="edit-customer-form"
                                disabled={processing}
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save changes'}
                            </button>
                        </>
                    }
                >
                    <form
                        id="edit-customer-form"
                        onSubmit={(event) => {
                            event.preventDefault();

                            if (!editCustomer) {
                                return;
                            }

                            put(`/admin/customers/${editCustomer.id}`, {
                                onSuccess: () => {
                                    reset();
                                    clearErrors();
                                    setShowEditModal(false);
                                    setEditCustomer(null);
                                },
                            });
                        }}
                        className="space-y-5 p-6"
                    >
                        {/* Identity summary */}
                        {editCustomer && (
                            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                                {renderAvatar(editCustomer)}
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-gray-900">
                                        {editCustomer.customer_code}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatNumber(editCustomer.points)} points
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Name */}
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="edit_first_name"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    First name
                                </label>

                                <input
                                    id="edit_first_name"
                                    type="text"
                                    value={data.first_name}
                                    onChange={(event) =>
                                        setData('first_name', event.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    placeholder="Enter first name"
                                />

                                {errors.first_name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.first_name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="edit_last_name"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Last name
                                </label>

                                <input
                                    id="edit_last_name"
                                    type="text"
                                    value={data.last_name}
                                    onChange={(event) =>
                                        setData('last_name', event.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    placeholder="Enter last name"
                                />

                                {errors.last_name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.last_name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label
                                htmlFor="edit_phone_number"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Phone number
                            </label>

                            <input
                                id="edit_phone_number"
                                type="text"
                                inputMode="numeric"
                                maxLength={11}
                                value={data.phone_number}
                                onChange={(event) =>
                                    setData(
                                        'phone_number',
                                        event.target.value.replace(/\D/g, ''),
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                placeholder="09XXXXXXXXX"
                            />

                            <p className="mt-1 text-xs text-gray-500">
                                Must contain 11 digits and start with 09.
                            </p>

                            {errors.phone_number && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.phone_number}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="edit_email"
                                className="mb-1.5 block text-sm font-medium text-gray-700"
                            >
                                Email{' '}
                                <span className="font-normal text-gray-400">
                                    (optional)
                                </span>
                            </label>

                            <input
                                id="edit_email"
                                type="email"
                                value={data.email}
                                onChange={(event) =>
                                    setData('email', event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                placeholder="example@email.com"
                            />

                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                    </form>
                </AdminModal>
            )}

            {/* QR Code Modal */}
            {selectedCustomer && selectedCustomer.qr_code && (
                <AdminModal
                    title="Customer QR Code"
                    description="Scan this QR code during a transaction."
                    onClose={closeQrModal}
                    maxWidthClass="max-w-sm"
                    footer={
                        <button
                            type="button"
                            onClick={closeQrModal}
                            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                        >
                            Close
                        </button>
                    }
                >
                    <div className="flex flex-col items-center px-6 py-6">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <QRCodeSVG
                                value={selectedCustomer.qr_code.qr_token}
                                size={240}
                                level="H"
                            />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-gray-900">
                            {selectedCustomer.first_name}{' '}
                            {selectedCustomer.last_name}
                        </h3>

                        <span className="mt-2 inline-flex rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
                            {selectedCustomer.customer_code}
                        </span>

                        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-700">
                            Keep this QR code private. It identifies the
                            customer's loyalty account.
                        </p>
                    </div>
                </AdminModal>
            )}
        </AdminLayout>
    );
}