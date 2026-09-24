export interface LaravelFile {
  name: string;
  path: string;
  language: string;
  descriptionSwahili: string;
  code: string;
}

export const LARAVEL_FILES: LaravelFile[] = [
  {
    name: 'SalesController.php',
    path: 'app/Http/Controllers/SalesController.php',
    language: 'php',
    descriptionSwahili: 'Controller ya mauzo: Piga bei automatic, utenganishaji wa madeni ya Bee Products & Vybu Gin, na malipo ya deni',
    code: `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use App\\Models\\Sale;
use App\\Models\\Product;
use App\\Models\\CustomerDebt;
use App\\Models\\StockInventory;
use Illuminate\\Support\\Facades\\Auth;
use Carbon\\Carbon;

class SalesController extends Controller
{
    /**
     * Orodha ya mauzo kwa kipindi (Leo, Wiki Hii, Mwezi Huu)
     */
    public function index(Request $request)
    {
        $period = $request->get('period', 'leo');
        $query = Sale::with(['items', 'customer', 'salesperson']);

        // Kama ni muuzaji wa kawaida, aone mauzo yake pekee
        if (Auth::user()->role === 'muuzaji') {
            $query->where('user_id', Auth::id());
        }

        if ($period === 'leo') {
            $query->whereDate('created_at', Carbon::today());
        } elseif ($period === 'wiki') {
            $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
        } elseif ($period === 'mwezi') {
            $query->whereMonth('created_at', Carbon::now()->month);
        }

        $sales = $query->latest()->paginate(25);

        // Jumla ya leo
        $todayTotal = Sale::when(Auth::user()->role === 'muuzaji', fn($q) => $q->where('user_id', Auth::id()))
            ->whereDate('created_at', Carbon::today())
            ->sum('total_amount');

        return view('sales.index', compact('sales', 'period', 'todayTotal'));
    }

    /**
     * Piga Bei Automatic & Hifadhi Mauzo (Tarehe Moja kwa Moja)
     */
    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'category' => 'required|in:vybu_gin,bee_product',
            'is_credit' => 'boolean',
            'deposit_paid' => 'nullable|numeric|min:0',
        ]);

        $product = Product::findOrFail($request->product_id);
        
        // Piga Bei Automatic
        $unitPrice = $product->price;
        $totalKiasi = $unitPrice * $request->quantity;

        // Kokotoa Malipo na Deni
        $isCredit = $request->boolean('is_credit');
        $depositPaid = $isCredit ? ($request->deposit_paid ?? 0) : $totalKiasi;
        $balanceDue = max(0, $totalKiasi - $depositPaid);
        $status = $balanceDue == 0 ? 'IMELIPWA' : 'INADAIWA';

        // Nambari ya Risiti Automatic
        $receiptNumber = 'RCT-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

        $sale = Sale::create([
            'receipt_number' => $receiptNumber,
            'user_id' => Auth::id(),
            'customer_name' => $request->customer_name,
            'customer_phone' => $request->customer_phone,
            'category' => $request->category,
            'product_id' => $product->id,
            'quantity' => $request->quantity,
            'unit_price' => $unitPrice,
            'total_amount' => $totalKiasi,
            'amount_paid' => $depositPaid,
            'balance_due' => $balanceDue,
            'status' => $status,
            'sale_date' => Carbon::now(), // Tarehe ya Moja kwa Moja
        ]);

        // Sheria: Madeni ya Bee Products hayaingiliani kamwe na Vybu Gin
        if ($balanceDue > 0) {
            CustomerDebt::create([
                'sale_id' => $sale->id,
                'user_id' => Auth::id(),
                'category' => $request->category, // 'vybu_gin' au 'bee_product'
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'amount_owed' => $balanceDue,
                'due_date' => Carbon::now()->addDays(14),
            ]);
        }

        // Punguza Mzigo wa Sokoni kama ni Vybu Gin Box
        if ($request->category === 'vybu_gin') {
            StockInventory::decrementMarketStock($request->quantity);
        }

        return redirect()->back()->with('success', 'Mauzo yamehifadhiwa kikamilifu!');
    }

    /**
     * Kupunguza au Kulipa Deni la Mteja
     */
    public function payDebt(Request $request, $id)
    {
        $request->validate(['amount' => 'required|numeric|min:1']);
        
        $sale = Sale::findOrFail($id);
        $amountToPay = min($request->amount, $sale->balance_due);

        $sale->amount_paid += $amountToPay;
        $sale->balance_due = max(0, $sale->total_amount - $sale->amount_paid);
        $sale->status = $sale->balance_due == 0 ? 'IMELIPWA' : 'INADAIWA';
        $sale->save();

        return redirect()->back()->with('success', 'Malipo ya deni yamethibitishwa!');
    }
}
`
  },
  {
    name: 'StockController.php',
    path: 'app/Http/Controllers/StockController.php',
    language: 'php',
    descriptionSwahili: 'Sheria ya Stoo Kuu: Utoaji wa maboksi (200 - 100 = 100) na urejeshaji wa maboksi yaliyorudi kuongezwa stoo',
    code: `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use App\\Models\\StockInventory;
use App\\Models\\StockOrder;
use Illuminate\\Support\\Facades\\Auth;
use Carbon\\Carbon;

class StockController extends Controller
{
    public function index()
    {
        $stock = StockInventory::firstOrCreate([], [
            'warehouse_boxes' => 200,
            'market_boxes' => 100,
            'total_dispatched' => 0,
            'total_returned' => 0,
        ]);

        $pendingOrders = StockOrder::where('status', 'PENDING')->latest()->get();
        $dispatchedOrders = StockOrder::where('status', 'DISPATCHED')->latest()->take(20)->get();

        return view('stock.index', compact('stock', 'pendingOrders', 'dispatchedOrders'));
    }

    /**
     * Muuzaji Kuweka Oda ya Maboksi
     */
    public function requestOrder(Request $request)
    {
        $request->validate([
            'boxes_requested' => 'required|integer|min:1',
        ]);

        StockOrder::create([
            'order_number' => 'ORD-' . date('Ymd') . '-' . rand(100, 999),
            'user_id' => Auth::id(),
            'salesperson_name' => Auth::user()->name,
            'boxes_requested' => $request->boxes_requested,
            'status' => 'PENDING',
        ]);

        return redirect()->back()->with('success', 'Oda ya maboksi imetumwa kwa Mtu wa Stock!');
    }

    /**
     * Mtu wa Stock Kutoa Mzigo Kwenda Sokoni
     * SHERIA: Mzigo stoo ukiwa 200 na oda ni 100 -> stoo inabaki 100, sokoni inakwenda 100
     */
    public function dispatchOrder($orderId)
    {
        $order = StockOrder::findOrFail($orderId);
        $stock = StockInventory::first();

        if ($stock->warehouse_boxes < $order->boxes_requested) {
            return redirect()->back()->with('error', 'Stoo haina maboksi ya kutosha!');
        }

        // Tekeleza sheria ya stoo
        $stock->warehouse_boxes -= $order->boxes_requested;
        $stock->market_boxes += $order->boxes_requested;
        $stock->total_dispatched += $order->boxes_requested;
        $stock->save();

        $order->status = 'DISPATCHED';
        $order->dispatched_by = Auth::user()->name;
        $order->dispatched_at = Carbon::now();
        $order->save();

        return redirect()->back()->with('success', "Mzigo wa maboksi {$order->boxes_requested} umetolewa sokoni!");
    }

    /**
     * Urejeshaji wa Maboksi Yaliyorudi Kutoka kwa Wauzaji
     * SHERIA: Maboksi yaliyobaki/yaliyorudi yanajirudisha moja kwa moja kwenye stoo kuu
     */
    public function returnBoxes(Request $request)
    {
        $request->validate([
            'boxes_count' => 'required|integer|min:1',
            'salesperson_name' => 'required|string',
            'reason' => 'required|string',
        ]);

        $stock = StockInventory::first();

        // Ongeza moja kwa moja kwenye salio lililobaki stoo kuu
        $stock->warehouse_boxes += $request->boxes_count;
        $stock->market_boxes = max(0, $stock->market_boxes - $request->boxes_count);
        $stock->total_returned += $request->boxes_count;
        $stock->save();

        // Hifadhi logi ya urejeshaji
        StockOrder::create([
            'order_number' => 'RET-' . date('Ymd') . '-' . rand(100, 999),
            'user_id' => Auth::id(),
            'salesperson_name' => $request->salesperson_name . ' (Imerejeshwa: ' . $request->reason . ')',
            'boxes_requested' => $request->boxes_count,
            'status' => 'DISPATCHED',
            'dispatched_by' => 'Stoo Kuu',
            'dispatched_at' => Carbon::now(),
        ]);

        return redirect()->back()->with('success', "Maboksi {$request->boxes_count} yamerudishwa na kuongezwa stoo kuu!");
    }
}
`
  },
  {
    name: 'ExpenseController.php',
    path: 'app/Http/Controllers/ExpenseController.php',
    language: 'php',
    descriptionSwahili: 'Controller ya Mhasibu: Kuingiza matumizi kwa tarehe, jina la aliyechukua fedha, maelezo, kiasi na saini',
    code: `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use App\\Models\\Expense;
use Illuminate\\Support\\Facades\\Auth;

class ExpenseController extends Controller
{
    public function index()
    {
        $expenses = Expense::latest()->paginate(20);
        $totalExpenses = Expense::sum('amount');

        return view('expenses.index', compact('expenses', 'totalExpenses'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'expense_date' => 'required|date',
            'recipient_name' => 'required|string|max:255',
            'category' => 'required|string',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'signature' => 'required|string|max:255',
        ]);

        Expense::create([
            'voucher_number' => 'VOU-' . date('Ymd') . '-' . rand(1000, 9999),
            'user_id' => Auth::id(),
            'accountant_name' => Auth::user()->name,
            'recipient_name' => $request->recipient_name,
            'expense_date' => $request->expense_date,
            'category' => $request->category,
            'description' => $request->description,
            'amount' => $request->amount,
            'signature' => $request->signature,
        ]);

        return redirect()->back()->with('success', 'Matumizi yamehifadhiwa na voucher imetengenezwa!');
    }
}
`
  },
  {
    name: 'AdminController.php',
    path: 'app/Http/Controllers/AdminController.php',
    language: 'php',
    descriptionSwahili: 'Controller ya System Admin: Kuzuia (Block) na kufungua (Unblock) paneli ya mtu yeyote',
    code: `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use App\\Models\\User;

class AdminController extends Controller
{
    public function users()
    {
        $users = User::all();
        return view('admin.users', compact('users'));
    }

    /**
     * Zuia (Block) au Fungua (Unblock) Paneli ya Mtumiaji
     */
    public function toggleBlock($id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'system_admin') {
            return redirect()->back()->with('error', 'Huwezi kuzuia System Admin!');
        }

        $user->is_blocked = !$user->is_blocked;
        $user->save();

        $action = $user->is_blocked ? 'Imezuiwa' : 'Imefunguliwa';
        return redirect()->back()->with('success', "Paneli ya {$user->name} {$action}!");
    }
}
`
  },
  {
    name: 'web.php',
    path: 'routes/web.php',
    language: 'php',
    descriptionSwahili: 'Njia zote za mfumo (Routing) kwa ajili ya wauzaji, mhasibu, stoo, masoko na mkurugenzi',
    code: `<?php

use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\SalesController;
use App\\Http\\Controllers\\StockController;
use App\\Http\\Controllers\\ExpenseController;
use App\\Http\\Controllers\\AdminController;
use App\\Http\\Controllers\\AuthController;

// Auth Routes
Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Mfumo Mzima (Locked behind Auth and CheckBlocked middleware)
Route::middleware(['auth', 'check.blocked'])->group(function () {
    
    // Dashboard Kuu
    Route::get('/', function () {
        return view('dashboard');
    })->name('dashboard');

    // Paneli ya Muuzaji
    Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');
    Route::post('/sales', [SalesController::class, 'store'])->name('sales.store');
    Route::post('/sales/{id}/pay-debt', [SalesController::class, 'payDebt'])->name('sales.pay-debt');

    // Paneli ya Stoo Kuu (Stock)
    Route::get('/stock', [StockController::class, 'index'])->name('stock.index');
    Route::post('/stock/order', [StockController::class, 'requestOrder'])->name('stock.order');
    Route::post('/stock/dispatch/{id}', [StockController::class, 'dispatchOrder'])->name('stock.dispatch');
    Route::post('/stock/return', [StockController::class, 'returnBoxes'])->name('stock.return');

    // Paneli ya Mhasibu
    Route::get('/expenses', [ExpenseController::class, 'index'])->name('expenses.index');
    Route::post('/expenses', [ExpenseController::class, 'store'])->name('expenses.store');

    // Paneli ya System Admin (Block & Unblock)
    Route::middleware('role:system_admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'users'])->name('admin.users');
        Route::post('/admin/users/{id}/toggle-block', [AdminController::class, 'toggleBlock'])->name('admin.users.toggle-block');
    });
});
`
  },
  {
    name: 'dashboard.blade.php',
    path: 'resources/views/dashboard.blade.php',
    language: 'html',
    descriptionSwahili: 'Muundo kamili wa Blade kwa muonekano wa kifahari wa Vioo (Luxury Dark Honey Glassmorphism)',
    code: `@extends('layouts.app')

@section('content')
<div class="space-y-6">
    <!-- Top KPI Cards with Luxury Glassmorphism -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-panel-zamboo rounded-3xl p-5 border border-amber-400/40 shadow-xl">
            <span class="text-xs font-bold uppercase text-stone-400">Mapato Yote</span>
            <div class="text-2xl font-black text-[#F6BA35] font-mono mt-1">TZS {{ number_format($totalRevenue) }}</div>
        </div>
        <div class="glass-panel-zamboo rounded-3xl p-5 border border-amber-400/40 shadow-xl">
            <span class="text-xs font-bold uppercase text-stone-400">Stoo Kuu</span>
            <div class="text-2xl font-black text-white font-mono mt-1">{{ $warehouseBoxes }} Box</div>
        </div>
        <div class="glass-panel-zamboo rounded-3xl p-5 border border-amber-400/40 shadow-xl">
            <span class="text-xs font-bold uppercase text-stone-400">Deni Vybu Gin</span>
            <div class="text-2xl font-black text-rose-400 font-mono mt-1">TZS {{ number_format($vybuGinDebt) }}</div>
        </div>
        <div class="glass-panel-zamboo rounded-3xl p-5 border border-amber-400/40 shadow-xl">
            <span class="text-xs font-bold uppercase text-stone-400">Deni Bee Products</span>
            <div class="text-2xl font-black text-amber-300 font-mono mt-1">TZS {{ number_format($beeProductDebt) }}</div>
        </div>
    </div>
</div>
@endsection
`
  }
];
