
import LogoutButton from '@/Components/LogoutButton';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useState } from 'react';

export default function CashierLayout({
    children,
}: PropsWithChildren) {
    const { auth } = usePage().props;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return (
            window.localStorage.getItem('cashier-sidebar-collapsed') === 'true'
        );
    });

    useEffect(() => {
        localStorage.setItem(
            'cashier-sidebar-collapsed',
            String(isSidebarCollapsed),
        );
    }, [isSidebarCollapsed]);

    const navLinkClass = (active: boolean) =>
        `group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium
        transition-colors duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-white
        motion-reduce:transition-none ${
            active
                ? 'bg-white text-red-700 shadow-sm'
                : 'text-white hover:bg-white/10'
        }`;

    const labelClass = `whitespace-nowrap transition-opacity duration-200 ease-out ${
        isSidebarCollapsed
            ? 'ml-3 w-auto opacity-100 md:ml-0 md:w-0 md:overflow-hidden md:opacity-0'
            : 'ml-3 w-auto opacity-100'
    }`;

    return (
        <div className="min-h-screen bg-white">

            {/* Mobile Menu Button */}
            <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="fixed left-4 top-4 z-30 inline-flex items-center justify-center rounded-lg border border-red-700 bg-red-700 p-2.5 text-white shadow-md transition-colors duration-200 ease-out hover:border-red-800 hover:bg-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 motion-reduce:transition-none md:hidden"
                aria-label="Open navigation menu"
                aria-expanded={isSidebarOpen}
            >
                <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/20 bg-red-700 shadow-xl transition-[width,transform] duration-200 ease-out motion-reduce:transition-none md:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } ${
                    isSidebarCollapsed ? 'md:w-20' : 'md:w-64'
                }`}
            >
                {/* Mobile Close Button */}
                <div className="flex justify-end px-4 pt-4 md:hidden">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(false)}
                        className="rounded-lg p-2 text-white transition-colors duration-200 ease-out hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
                        aria-label="Close navigation menu"
                    >
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 6l12 12M18 6L6 18"
                            />
                        </svg>
                    </button>
                </div>

                {/* Brand */}
                <div
                    className={`flex items-center border-b border-white/20 px-6 py-5 transition-[gap] duration-200 ease-out ${
                        isSidebarCollapsed
                            ? 'md:justify-center'
                            : 'gap-3'
                    }`}
                >
                    <img
                        src="/images/ramyeon-logo-clear.png"
                        alt="Ramyeon Corner Logo"
                        className="h-10 w-10 shrink-0 rounded-full bg-white object-contain p-0.5 ring-2 ring-white/40"
                    />

                    <div
                        className={`min-w-0 overflow-hidden transition-opacity duration-200 ease-out ${
                            isSidebarCollapsed
                                ? 'w-auto opacity-100 md:w-0 md:opacity-0'
                                : 'w-auto opacity-100'
                        }`}
                    >
                        <h1 className="truncate text-lg font-bold text-white">
                            Ramyeon Corner
                        </h1>

                        <p className="mt-0.5 text-sm text-white">
                            Cashier
                        </p>
                    </div>
                </div>

                {/* Desktop Sidebar Toggle */}
                <div className="hidden border-b border-white/20 px-4 py-3 md:flex md:justify-end">
                    <button
                        type="button"
                        onClick={() =>
                            setIsSidebarCollapsed((current) => !current)
                        }
                        className="inline-flex items-center justify-center rounded-lg p-2 text-white transition-colors duration-200 ease-out hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
                        aria-label={
                            isSidebarCollapsed
                                ? 'Expand navigation sidebar'
                                : 'Collapse navigation sidebar'
                        }
                        title={
                            isSidebarCollapsed
                                ? 'Expand sidebar'
                                : 'Collapse sidebar'
                        }
                    >
                        <span
                            className="material-symbols-outlined text-[20px]"
                            aria-hidden="true"
                        >
                            {isSidebarCollapsed
                                ? 'left_panel_open'
                                : 'left_panel_close'}
                        </span>
                    </button>
                </div>

                {/* Navigation */}
                <nav
                    className="flex-1 space-y-1 px-4 py-5"
                    aria-label="Cashier navigation"
                >
                    {/* Dashboard */}
                    <Link
                        href={route('cashier.dashboard')}
                        onClick={() => setIsSidebarOpen(false)}
                        className={navLinkClass(
                            route().current('cashier.dashboard'),
                        )}
                        aria-current={
                            route().current('cashier.dashboard')
                                ? 'page'
                                : undefined
                        }
                        title={isSidebarCollapsed ? 'Dashboard' : undefined}
                    >
                        <span
                            className="material-symbols-outlined shrink-0 text-[20px]"
                            aria-hidden="true"
                        >
                            dashboard
                        </span>

                        <span className={labelClass}>
                            Dashboard
                        </span>
                    </Link>

                    {/* Customers */}
                    <Link
                        href={route('cashier.customers.index')}
                        onClick={() => setIsSidebarOpen(false)}
                        className={navLinkClass(
                            route().current('cashier.customers.*'),
                        )}
                        aria-current={
                            route().current('cashier.customers.*')
                                ? 'page'
                                : undefined
                        }
                        title={isSidebarCollapsed ? 'Customers' : undefined}
                    >
                        <span
                            className="material-symbols-outlined shrink-0 text-[20px]"
                            aria-hidden="true"
                        >
                            group
                        </span>

                        <span className={labelClass}>
                            Customers
                        </span>
                    </Link>

                    {/* QR Scanner */}
                    <Link
                        href={route('cashier.qr-scanner')}
                        onClick={() => setIsSidebarOpen(false)}
                        className={navLinkClass(
                            route().current('cashier.qr-scanner'),
                        )}
                        aria-current={
                            route().current('cashier.qr-scanner')
                                ? 'page'
                                : undefined
                        }
                        title={isSidebarCollapsed ? 'QR Scanner' : undefined}
                    >
                        <span
                            className="material-symbols-outlined shrink-0 text-[20px]"
                            aria-hidden="true"
                        >
                            qr_code_scanner
                        </span>

                        <span className={labelClass}>
                            QR Scanner
                        </span>
                    </Link>

                    {/* Registration QR */}
                    <Link
                        href={route('cashier.register-qr')}
                        onClick={() => setIsSidebarOpen(false)}
                        className={navLinkClass(
                            route().current('cashier.register-qr'),
                        )}
                        aria-current={
                            route().current('cashier.register-qr')
                                ? 'page'
                                : undefined
                        }
                        title={
                            isSidebarCollapsed
                                ? 'Registration QR'
                                : undefined
                        }
                    >
                        <span
                            className="material-symbols-outlined shrink-0 text-[20px]"
                            aria-hidden="true"
                        >
                            how_to_reg
                        </span>

                        <span className={labelClass}>
                            Registration QR
                        </span>
                    </Link>

                    {/* Transactions */}
                    <Link
                        href={route('cashier.transactions.index')}
                        onClick={() => setIsSidebarOpen(false)}
                        className={navLinkClass(
                            route().current('cashier.transactions.*'),
                        )}
                        aria-current={
                            route().current('cashier.transactions.*')
                                ? 'page'
                                : undefined
                        }
                        title={
                            isSidebarCollapsed
                                ? 'Transactions'
                                : undefined
                        }
                    >
                        <span
                            className="material-symbols-outlined shrink-0 text-[20px]"
                            aria-hidden="true"
                        >
                            receipt_long
                        </span>

                        <span className={labelClass}>
                            Transactions
                        </span>
                    </Link>

                    {/* Reward Redemptions */}
                    <Link
                        href={route('cashier.reward-redemptions.index')}
                        onClick={() => setIsSidebarOpen(false)}
                        className={navLinkClass(
                            route().current('cashier.reward-redemptions.*'),
                        )}
                        aria-current={
                            route().current('cashier.reward-redemptions.*')
                                ? 'page'
                                : undefined
                        }
                        title={
                            isSidebarCollapsed
                                ? 'Reward Redemptions'
                                : undefined
                        }
                    >
                        <span
                            className="material-symbols-outlined shrink-0 text-[20px]"
                            aria-hidden="true"
                        >
                            local_offer
                        </span>

                        <span className={labelClass}>
                            Reward Redemptions
                        </span>
                    </Link>
                </nav>

                {/* Account */}
                <div
                    className={`border-t border-white/20 p-4 transition-[padding] duration-200 ease-out ${
                        isSidebarCollapsed
                            ? 'md:flex md:justify-center'
                            : ''
                    }`}
                >
                    <div
                        className={`min-w-0 overflow-hidden transition-opacity duration-200 ease-out ${
                            isSidebarCollapsed
                                ? 'w-auto opacity-100 md:w-0 md:opacity-0'
                                : 'w-auto opacity-100'
                        }`}
                    >
                        <p className="truncate px-1 text-sm font-medium text-white">
                            {auth.user.name}
                        </p>

                        <p className="mt-0.5 truncate px-1 text-xs text-white">
                            Cashier
                        </p>
                    </div>

                    <div
                        className={`transition-[margin] duration-200 ease-out ${
                            isSidebarCollapsed ? 'mt-0' : 'mt-3'
                        }`}
                    >
                        <LogoutButton collapsed={isSidebarCollapsed} />
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-red-700/40 transition-opacity duration-200 ease-out motion-reduce:transition-none md:hidden"
                    aria-label="Close navigation menu"
                />
            )}

            {/* Main Content */}
            <main
                className={`min-h-screen bg-white transition-[margin] duration-200 ease-out motion-reduce:transition-none ${
                    isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
                }`}
            >
                {children}
            </main>
        </div>
    );
}
