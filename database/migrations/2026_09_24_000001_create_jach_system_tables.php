<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Markets Table
        Schema::create('markets', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('code', 50)->unique();
            $table->string('location', 255);
            $table->string('phone', 30)->nullable();
            $table->unsignedBigInteger('manager_id')->nullable();
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });

        // 2. Users Table with Roles and Security Blocking
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('username', 100)->unique();
            $table->string('password');
            $table->string('phone', 30)->nullable();
            $table->enum('role', [
                'admin', 
                'director', 
                'seller', 
                'market_manager', 
                'stock_manager', 
                'accountant'
            ])->default('seller');
            $table->foreignId('market_id')->nullable()->constrained('markets')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_blocked')->default(false); // Admin Block/Unblock
            $table->string('avatar_path')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Products Table (Vybu Gin 200mls & Bee Products)
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->enum('category', ['VYBU_GIN', 'BEE_PRODUCTS'])->index();
            $table->string('sku', 100)->unique();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->decimal('cost_price', 15, 2)->default(0.00); // For COGS & Profit
            $table->decimal('box_price', 15, 2);
            $table->decimal('piece_price', 15, 2)->default(0.00);
            $table->unsignedInteger('pieces_per_box')->default(1);
            $table->unsignedInteger('min_stock_alert')->default(10);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 4. Main Store Inventory
        Schema::create('main_store_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained('products')->cascadeOnDelete();
            $table->unsignedInteger('boxes_available')->default(0);
            $table->unsignedInteger('pieces_available')->default(0);
            $table->timestamps();
        });

        // 5. Market Stocks (Separated per market)
        Schema::create('market_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('market_id')->constrained('markets')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->unsignedInteger('boxes_available')->default(0);
            $table->unsignedInteger('pieces_available')->default(0);
            $table->timestamps();

            $table->unique(['market_id', 'product_id']);
        });

        // 6. Restock Orders
        Schema::create('restock_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 50)->unique();
            $table->foreignId('market_id')->constrained('markets')->cascadeOnDelete();
            $table->foreignId('requested_by')->constrained('users');
            $table->unsignedInteger('boxes_requested');
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED', 'FULFILLED', 'CANCELLED'])->default('PENDING');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 7. Customers
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone', 30)->index();
            $table->string('tin', 50)->nullable();
            $table->timestamps();
        });

        // 8. Sales
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number', 50)->unique()->index();
            $table->foreignId('seller_id')->constrained('users');
            $table->foreignId('market_id')->constrained('markets');
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_phone', 30);
            $table->string('customer_tin', 50)->nullable();
            $table->enum('category_type', ['VYBU_GIN', 'BEE_PRODUCTS'])->index();
            $table->decimal('subtotal', 15, 2);
            $table->decimal('discount', 15, 2)->default(0.00);
            $table->decimal('total_amount', 15, 2);
            $table->decimal('cost_of_goods_sold', 15, 2)->default(0.00);
            $table->decimal('paid_amount', 15, 2);
            $table->decimal('balance_due', 15, 2);
            $table->enum('payment_status', ['PAID', 'PARTIAL', 'UNPAID', 'CANCELLED'])->default('PAID');
            $table->enum('payment_method', ['CASH', 'M_PESA', 'TIGO_PESA', 'AIRTEL_MONEY', 'BANK', 'CREDIT'])->default('CASH');
            $table->date('sale_date')->index();
            $table->time('sale_time');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 9. Sale Items
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products');
            $table->enum('unit_type', ['BOX', 'PIECE'])->default('BOX');
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('unit_cost', 15, 2);
            $table->unsignedInteger('pieces_per_box')->default(1);
            $table->decimal('boxes_equivalent', 8, 4)->default(1.0);
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();
        });

        // 10. Debts (Strict separation between Bee Products & Vybu Gin)
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->unique()->constrained('sales')->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_phone', 30);
            $table->foreignId('seller_id')->constrained('users');
            $table->foreignId('market_id')->constrained('markets');
            $table->enum('debt_category', ['VYBU_GIN', 'BEE_PRODUCTS'])->index();
            $table->decimal('original_amount', 15, 2);
            $table->decimal('paid_amount', 15, 2)->default(0.00);
            $table->decimal('remaining_amount', 15, 2);
            $table->enum('status', ['UNPAID', 'PARTIALLY_PAID', 'PAID'])->default('UNPAID');
            $table->date('due_date')->nullable();
            $table->timestamps();
        });

        // 11. Debt Payments
        Schema::create('debt_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debt_id')->constrained('debts')->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->string('payment_method', 50)->default('CASH');
            $table->foreignId('received_by')->constrained('users');
            $table->dateTime('payment_date');
            $table->string('reference', 100)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 12. Expenses & Accountant Vouchers with Digital Signature
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('voucher_number', 50)->unique();
            $table->date('expense_date')->index();
            $table->string('recipient_name');
            $table->decimal('amount', 15, 2);
            $table->string('category', 100);
            $table->text('description');
            $table->string('signature_path')->nullable(); // Saved to storage
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamps();
        });

        // 13. Stock Transactions (Immutable movement audit)
        Schema::create('stock_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products');
            $table->foreignId('market_id')->nullable()->constrained('markets');
            $table->foreignId('user_id')->constrained('users');
            $table->enum('transaction_type', [
                'RECEIVED_MAIN_STORE', 
                'TRANSFER_TO_MARKET', 
                'RETURN_FROM_MARKET', 
                'SALE', 
                'STOCK_ADJUSTMENT', 
                'DAMAGED', 
                'EXPIRED'
            ])->index();
            $table->integer('boxes');
            $table->integer('pieces')->default(0);
            $table->integer('before_boxes');
            $table->integer('after_boxes');
            $table->string('reference_type', 100)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // 14. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100);
            $table->string('module', 50);
            $table->text('description');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // 15. System Settings
        Schema::create('system_settings', function (Blueprint $table) {
            $table->string('key', 100)->primary();
            $table->text('value');
            $table->string('type', 20)->default('string');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('stock_transactions');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('debt_payments');
        Schema::dropIfExists('debts');
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('restock_orders');
        Schema::dropIfExists('market_stocks');
        Schema::dropIfExists('main_store_stocks');
        Schema::dropIfExists('products');
        Schema::dropIfExists('users');
        Schema::dropIfExists('markets');
    }
};
