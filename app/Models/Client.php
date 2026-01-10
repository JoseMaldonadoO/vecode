<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'business_name',
        'rfc',
        'address',
        'contact_info',
    ];
}
