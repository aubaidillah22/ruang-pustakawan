<?php

namespace App\Providers;

use App\Http\Middleware\UpdateUserActivity;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Register middleware alias
        Route::aliasMiddleware('active', UpdateUserActivity::class);
    }
}
