<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category',
        'sku',
        'name',
        'description',
        'cost_price',
        'box_price',
        'piece_price',
        'pieces_per_box',
        'min_stock_alert',
        'is_active',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'box_price' => 'decimal:2',
        'piece_price' => 'decimal:2',
        'pieces_per_box' => 'integer',
        'min_stock_alert' => 'integer',
        'is_active' => 'boolean',
    ];

    public function mainStoreStock(): HasOne
    {
        return $this->hasOne(MainStoreStock::class);
    }

    public function marketStocks(): HasMany
    {
        return $this->hasMany(MarketStock::class);
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function isVybuGin(): bool
    {
        return $this->category === 'VYBU_GIN';
    }

    public function isBeeProduct(): bool
    {
        return $this->category === 'BEE_PRODUCTS';
    }
}
