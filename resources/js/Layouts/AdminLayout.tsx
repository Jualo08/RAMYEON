
import LogoutButton from '@/Components/LogoutButton';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useState } from 'react';

export default function AdminLayout({
    children,
}: PropsWithChildren) {
    const { auth } = usePage().props;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return (
            window.localStorage.getItem('admin-sidebar-collapsed') === 'true'
        );
    });

    useEffect(() => {
        localStorage.setItem(
            'admin-sidebar-collapsed',
            String(isSidebarCollapsed),
        );
    }, [isSidebarCollapsed]);

    const navLinkClass = (active: boolean) =>
        `group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium
        transition-colors duration-200 ease-in-out
        ${
            active
                ? 'bg-white text-red-700 shadow-sm'
                : 'text-white/90 hover:bg-white/10 hover:text-white'
        }`;

    const labelClass = `ml-3 whitespace-nowrap transition-all duration-200 ${
        isSidebarCollapsed
            ? 'w-auto opacity-100 md:ml-0 md:w-0 md:overflow-hidden md:opacity-0'
            : 'w-auto opacity-100'
    }`;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Menu Button */}
            <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="fixed left-4 top-4 z-30 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 md:hidden"
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
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col
                bg-red-700 text-white shadow-lg
                transition-all duration-300 ease-in-out md:translate-x-0 ${
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
                        className="rounded-lg p-2 text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white"
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
                    className={`flex items-center gap-3 border-b border-white/15 px-6 py-5 transition-all duration-300 ${
                        isSidebarCollapsed ? 'md:justify-center' : ''
                    }`}
                >
                    <img
                        src="/images/ramyeon-logo-clear.png"
                        alt="Ramyeon Corner Logo"
                        className="h-10 w-10 shrink-0 object-contain"
                    />

                    <div
                        className={`min-w-0 overflow-hidden transition-all duration-200 ${
                            isSidebarCollapsed
                                ? 'w-auto opacity-100 md:w-0 md:opacity-0'
                                : 'w-auto opacity-100'
                        }`}
                    >
                        <h1 className="truncate text-lg font-bold text-white">
                            Ramyeon Corner
                        </h1>

                        <p className="mt-0.5 text-sm text-white/70">
                            Admin
                        </p>
                    </div>
                </div>

                {/* Desktop Sidebar Toggle */}
                <div className="hidden justify-end border-b border-white/15 px-4 py-3 md:flex">
                    <button
                        type="button"
                        onClick={() =>
                            setIsSidebarCollapsed((current) => !current)
                        }
                        className="inline-flex items-center justify-center rounded-lg p-2 text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
                    aria-label="Admin navigation"
                >
                    <Link
                        href={route('admin.dashboard')}
                        onClick={() => setIsSidebarOpen(false)}
                        className={navLinkClass(
                            route().current('admin.dashboard'),
                        )}
                        aria-current={
                            route().current('admin.dashboard')
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

                        <span className={labelClass}>Dashboard</span>
                    </Link>

                    <Link
                        href={route('admin.customers.index')}
                        onClick={() => setIsSidebarOpen(false)}
                        className={navLinkClass(
                            route().current('admin.customers.*'),
                        )}
                        aria-current={
                            route().current('admin.customers.*')
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

                        <span className={labelClass}>Customers</span>
                    </Link>

                    <Link
                        href={route('admin.cashiers.index')}
                        onClick={() => setIsSidebarOpen(false)}
                        className={navLinkClass(
                            route().current('admin.cashiers.*'),
                        )}
                        aria-current={
                            route().current('admin.cashiers.*')
                                ? 'page'
                                : undefined
                        }
                        title={isSidebarCollapsed ? 'Cashiers' : undefined}
                    >
                        <span
                            className="material-symbols-outlined shrink-0 text-[20px]"
                            aria-hidden="true"
                        >
                            badge
                        </span>

                        <span className={labelClass}>Cashiers</span>
                    </Link>

                    <Link
                        href={route('admin.rewards.index')}
                        onClick={() => setIsSidebarOpen(false)}
                        className={navLinkClass(
                            route().current('admin.rewards.*'),
                        )}
                        aria-current={
                            route().current('admin.rewards.*')
                                ? 'page'
                                : undefined
                        }
                        title={isSidebarCollapsed ? 'Rewards' : undefined}
                    >
                        <span
                            className="material-symbols-outlined shrink-0 text-[20px]"
                            aria-hidden="true"
                        >
                            local_offer
                        </span>

                        <span className={labelClass}>Rewards</span>
                    </Link>
                </nav>

                {/* Account */}
                <div
                    className={`border-t border-white/15 p-4 transition-all duration-300 ${
                        isSidebarCollapsed
                            ? 'md:flex md:justify-center'
                            : ''
                    }`}
                >
                    <div
                        className={`min-w-0 overflow-hidden transition-all duration-200 ${
                            isSidebarCollapsed
                                ? 'w-auto opacity-100 md:w-0 md:opacity-0'
                                : 'w-auto opacity-100'
                        }`}
                    >
                        <p className="truncate px-1 text-sm font-semibold text-white">
                            {auth.user.name}
                        </p>

                        <p className="mt-0.5 truncate px-1 text-xs text-white/70">
                            Administrator
                        </p>
                    </div>

                    <div
                        className={`transition-all duration-200 ${
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
                    className="fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 md:hidden"
                    aria-label="Close navigation menu"
                />
            )}

            {/* Main Content */}
            <main
                className={`min-h-screen transition-all duration-300 ${
                    isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
                }`}
            >
                {children}
            </main>
        </div>
    );
}
