<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Inertia\Inertia;

class AptController extends Controller
{
    public function index()
    {
        return Inertia::render('APT/Index');
    }
}
