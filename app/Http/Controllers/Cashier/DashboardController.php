<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\RewardRedemption;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{

    public function index(): Response
    {
        $cashier = Auth::user();
        $today = now()->toDateString();

        $todayTransactionsQuery = Transaction::query()
            ->where('cashier_id', $cashier->id)
            ->whereDate('created_at', $today);

        $todayTransactions = (clone $todayTransactionsQuery)
            ->count();

        $todaySales = (float) (clone $todayTransactionsQuery)
            ->sum('amount_paid');

        $todayPointsEarned = (int) (clone $todayTransactionsQuery)
            ->sum('points_earned');

        $todayRewardsRedeemed = RewardRedemption::query()
            ->where('cashier_id', $cashier->id)
            ->where('status', 'completed')
            ->whereDate('redeemed_at', $today)
            ->count();

        $totalCustomers = Customer::count();

        $totalTransactions = Transaction::count();

        $topLoyalCustomers = Customer::query()
            ->select([
                'id',
                'first_name',
                'last_name',
                'customer_code',
                'points',
            ])
            ->orderByDesc('points')
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->limit(3)
            ->get()
            ->map(fn (Customer $customer) => [
                'id' => $customer->id,
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'customer_code' => $customer->customer_code,
                'points' => (int) $customer->points,
            ])
            ->values();

        $recentTransactions = Transaction::query()
            ->with('customer')
            ->where('cashier_id', $cashier->id)
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Transaction $transaction) => [
                'id' => $transaction->id,
                'receipt_number' => $transaction->receipt_number,
                'purchase_amount' => (float) $transaction->purchase_amount,
                'amount_paid' => (float) $transaction->amount_paid,
                'points_earned' => (int) $transaction->points_earned,
                'created_at' => $transaction->created_at
                    ?->toIso8601String(),
                'customer' => $transaction->customer ? [
                    'first_name' => $transaction->customer->first_name,
                    'last_name' => $transaction->customer->last_name,
                    'customer_code' => $transaction->customer->customer_code,
                ] : null,
            ])
            ->values();

        return Inertia::render('Cashier/Dashboard', [
            'stats' => [
                'totalCustomers' => $totalCustomers,
                'totalTransactions' => $totalTransactions,
                'todayTransactions' => $todayTransactions,
                'todaySales' => $todaySales,
                'todayPointsEarned' => $todayPointsEarned,
                'todayRewardsRedeemed' => $todayRewardsRedeemed,
            ],

            'topLoyalCustomers' => $topLoyalCustomers,

            'recentTransactions' => $recentTransactions,
        ]);
    }
}
