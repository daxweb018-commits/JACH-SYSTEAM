<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'phone',
        'role',
        'market_id',
        'is_active',
        'is_blocked',
        'avatar_path',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_blocked' => 'boolean',
        ];
    }

    public function market(): BelongsTo
    {
        return $this->belongsTo(Market::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'seller_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'created_by');
    }

    public function debts(): HasMany
    {
        return $this->hasMany(Debt::class, 'seller_id');
    }

    // Role Helper Methods
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isDirector(): bool
    {
        return $this->role === 'director';
    }

    public function isSeller(): bool
    {
        return $this->role === 'seller';
    }

    public function isMarketManager(): bool
    {
        return $this->role === 'market_manager';
    }

    public function isStockManager(): bool
    {
        return $this->role === 'stock_manager';
    }

    public function isAccountant(): bool
    {
        return $this->role === 'accountant';
    }
}
