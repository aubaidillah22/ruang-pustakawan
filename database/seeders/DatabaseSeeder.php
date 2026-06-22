<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Follow;
use App\Models\Like;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks for clean seeding
        if (config('database.default') === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        } else {
            DB::statement('PRAGMA foreign_keys = OFF;');
        }

        // Clear existing data
        Notification::truncate();
        Like::truncate();
        Comment::truncate();
        Follow::truncate();
        Post::truncate();
        User::truncate();

        if (config('database.default') === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        } else {
            DB::statement('PRAGMA foreign_keys = ON;');
        }

        // === Users ===
        $starboy = User::create([
            'username' => 'starboy',
            'email' => 'starboy@gmail.com',
            'password' => 'password',
            'fullname' => 'starboy',
            'bio' => 'Aku starboyy huhuy',
            'avatar' => 'default.svg',
            'role' => 'admin',
            'created_at' => Carbon::parse('2026-06-15 19:42:51'),
            'updated_at' => Carbon::parse('2026-06-15 19:42:51'),
        ]);

        $user = User::create([
            'username' => 'user',
            'email' => 'user@gmail.com',
            'password' => 'password',
            'fullname' => 'user',
            'bio' => null,
            'avatar' => 'default.svg',
            'role' => 'user',
            'created_at' => Carbon::parse('2026-06-15 19:47:00'),
            'updated_at' => Carbon::parse('2026-06-15 19:47:00'),
        ]);

        $coba = User::create([
            'username' => 'coba',
            'email' => 'coba@gmail.com',
            'password' => 'password',
            'fullname' => 'coba',
            'bio' => null,
            'avatar' => 'default.svg',
            'role' => 'user',
            'created_at' => Carbon::parse('2026-06-15 22:32:23'),
            'updated_at' => Carbon::parse('2026-06-15 22:32:23'),
        ]);

        // === Posts (by starboy) ===
        $postsData = [
            ['content' => 'sdfg', 'created_at' => '2026-06-15 19:45:39'],
            ['content' => 'sdfg', 'created_at' => '2026-06-15 19:45:41'],
            ['content' => 'sdfgsdfg', 'created_at' => '2026-06-15 19:45:43'],
            ['content' => 'sdfgsdfg', 'created_at' => '2026-06-15 19:45:44'],
            ['content' => 'sdfgsdfg', 'created_at' => '2026-06-15 19:45:45'],
            ['content' => 'fsdfgsfgh', 'created_at' => '2026-06-15 19:45:47', 'updated_at' => '2026-06-15 20:15:35'],
        ];

        $posts = [];
        foreach ($postsData as $data) {
            $posts[] = Post::create([
                'user_id' => $starboy->id,
                'content' => $data['content'],
                'image' => null,
                'created_at' => Carbon::parse($data['created_at']),
                'updated_at' => isset($data['updated_at']) ? Carbon::parse($data['updated_at']) : null,
            ]);
        }

        // === Likes ===
        Like::insert([
            ['user_id' => $coba->id, 'post_id' => $posts[3]->id, 'created_at' => Carbon::parse('2026-06-15 20:04:12')],
            ['user_id' => $coba->id, 'post_id' => $posts[5]->id, 'created_at' => Carbon::parse('2026-06-15 20:06:01')],
        ]);

        // === Follows ===
        Follow::insert([
            ['follower_id' => $coba->id, 'following_id' => $starboy->id, 'created_at' => Carbon::parse('2026-06-15 20:04:06')],
        ]);

        // === Notifications ===
        Notification::insert([
            ['user_id' => $starboy->id, 'from_user_id' => $coba->id, 'type' => 'follow', 'post_id' => null, 'is_read' => true, 'created_at' => Carbon::parse('2026-06-15 20:04:06')],
            ['user_id' => $starboy->id, 'from_user_id' => $coba->id, 'type' => 'like', 'post_id' => $posts[3]->id, 'is_read' => true, 'created_at' => Carbon::parse('2026-06-15 20:04:12')],
            ['user_id' => $starboy->id, 'from_user_id' => $coba->id, 'type' => 'like', 'post_id' => $posts[5]->id, 'is_read' => true, 'created_at' => Carbon::parse('2026-06-15 20:06:01')],
            ['user_id' => $coba->id, 'from_user_id' => $starboy->id, 'type' => 'follow', 'post_id' => null, 'is_read' => false, 'created_at' => Carbon::parse('2026-06-16 06:01:21')],
            ['user_id' => $user->id, 'from_user_id' => $starboy->id, 'type' => 'follow', 'post_id' => null, 'is_read' => false, 'created_at' => Carbon::parse('2026-06-16 06:01:22')],
        ]);

        $this->command->info('Database seeded successfully!');
        $this->command->info('Login credentials:');
        $this->command->table(
            ['Username', 'Password', 'Role'],
            [
                ['starboy', 'password', 'admin'],
                ['user', 'password', 'user'],
                ['coba', 'password', 'user'],
            ]
        );
    }
}
