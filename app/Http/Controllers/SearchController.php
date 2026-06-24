<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = trim($request->get('q', ''));

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $users = User::where('id', '!=', Auth::id())
            ->where(function ($q) use ($query) {
                $q->where('fullname', 'like', '%' . $query . '%')
                  ->orWhere('username', 'like', '%' . $query . '%');
            })
            ->limit(10)
            ->get(['id', 'username', 'fullname', 'avatar', 'bio']);

        return response()->json($users);
    }
}
