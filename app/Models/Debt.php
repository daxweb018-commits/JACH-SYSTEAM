<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Debt extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'customer_id',
        'customer_name',
        'customer_phone',
        'seller_id',
        'market_id',
        'debt_category',
        'original_amount',
        'paid_amount',
        'remaining_amount',
        'status',
        'due_date',
    ];

    protected $casts = [
        'original_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'due_date' => 'date',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function market(): BelongsTo
    {
        return $this->belongsTo(Market::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(DebtPayment::class);
    }

    // Scopes to guarantee separation of Bee Products and Vybu Gin debts
    public function scopeVybuGin($query)
    {
        return $query->where('debt_category', 'VYBU_GIN');
    }

    public function scopeBeeProducts($query)
    {
        return $query->where('debt_category', 'BEE_PRODUCTS');
    }
}
