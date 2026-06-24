<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Follow;
use App\Models\Like;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin
        $admin = User::create([
            'username' => 'admin',
            'email' => 'admin@ruangpustakawan.app',
            'password' => 'password123',
            'fullname' => 'Admin RuangPustakawan',
            'bio' => 'Administrator platform RuangPustakawan. Pustakawan profesional.',
            'role' => 'admin',
            'avatar' => 'default.svg',
        ]);

        // Create sample users
        $users = collect();
        $names = [
            ['Ahmad Fauzi', 'ahmad_fauzi', 'Pustakawan di Perpustakaan Umum Jakarta'],
            ['Siti Nurhaliza', 'siti_nur', 'Kepala Perpustakaan SMA Negeri 1 Bandung'],
            ['Bambang Supriyadi', 'bambang_sp', 'Dokumentalis di Arsip Nasional'],
            ['Dewi Sartika', 'dewi_sartika', 'Pustakawan Universitas Indonesia'],
            ['Rudi Hermawan', 'rudi_herm', 'Peneliti dan Pustakawan'],
            ['Maya Indah', 'maya_indah', 'Katalogisasi & Klasifikasi'],
            ['Agus Prasetyo', 'agus_pras', 'Pustakawan Sistem Informasi'],
            ['Rina Marlina', 'rina_marl', 'Pengelola Perpustakaan Digital'],
            ['Hendra Gunawan', 'hendra_gun', 'Konsultan Perpustakaan'],
            ['Fitri Handayani', 'fitri_han', 'Pustakawan Madrasah Aliyah'],
        ];

        foreach ($names as $i => [$name, $username, $bio]) {
            $users->push(User::create([
                'username' => $username,
                'email' => $username . '@example.com',
                'password' => 'password123',
                'fullname' => $name,
                'bio' => $bio,
                'avatar' => 'default.svg',
            ]));
        }

        // Create posts
        $contents = [
            'Selamat Hari Kunjung Perpustakaan! 📚 Mari tingkatkan minat baca masyarakat Indonesia.',
            'Baru selesai mengikuti workshop Digital Library Management System. Banyak ilmu baru yang bisa diterapkan!',
            'Tips hari ini: Gunakan sistem klasifikasi Dewey Decimal System (DDC) untuk memudahkan pencarian buku.',
            'Alhamdulillah, perpustakaan kami baru saja menerima donasi 500 buku baru dari Kementerian Pendidikan.',
            'Diskusi seru tentang transformasi perpustakaan di era digital. Perpustakaan bukan hanya tempat buku, tapi juga pusat komunitas!',
            'Review jurnal: "Peran Pustakawan dalam Meningkatkan Literasi Informasi di Era Digital" — recommended!',
            'Sedang merancang program "Satu Bulan Satu Buku" untuk anggota perpustakaan. Semoga antusias!',
            'Proses katalogisasi koleksi baru. Pekerjaan yang butuh ketelitian tinggi!',
            'Senang bisa berbagi ilmu dengan teman-teman di RuangPustakawan. Mari majukan dunia kepustakawanan Indonesia!',
            'Buku rekomendasi bulan ini: "The Library Book" oleh Susan Orlean. Inspiratif banget!',
            'Kunjungan studi banding ke Perpustakaan Nasional. Banyak yang bisa kita adopsi!',
            'Webinar: "Digital Preservation of Cultural Heritage" — penting banget untuk diketahui pustakawan.',
        ];

        $allUsers = User::all();
        $posts = collect();

        foreach ($contents as $i => $content) {
            $post = Post::create([
                'user_id' => $allUsers->random()->id,
                'content' => $content,
            ]);
            $posts->push($post);
        }

        // Create additional posts by admin
        for ($i = 0; $i < 5; $i++) {
            Post::create([
                'user_id' => $admin->id,
                'content' => collect([
                    'Pengumuman: Akan ada maintenance sistem pada hari Minggu pukul 02.00 - 04.00 WIB.',
                    'Selamat bergabung untuk anggota baru! Jangan lupa lengkapi profil Anda.',
                    'Tips: Gunakan fitur chat untuk berdiskusi langsung dengan sesama pustakawan.',
                    'Fitur baru: Sekarang Anda bisa mengirim gambar di chat! Coba sekarang.',
                    'Terima kasih atas partisipasinya di RuangPustakawan. Teruslah berkarya!',
                ])->random(),
            ]);
        }

        // Create likes
        $allPosts = Post::all();
        foreach ($allPosts as $post) {
            $likers = $allUsers->random(rand(2, 8));
            foreach ($likers as $liker) {
                if ($liker->id !== $post->user_id) {
                    try {
                        Like::create([
                            'user_id' => $liker->id,
                            'post_id' => $post->id,
                        ]);
                    } catch (\Throwable $e) {}
                }
            }
        }

        // Create comments
        $commentTexts = [
            'Setuju banget! 👍',
            'Terima kasih infonya!',
            'Mantap! Semoga semakin maju.',
            'Baru tahu, thanks for sharing!',
            'Saya juga pernah ikut workshop itu. Sangat bermanfaat!',
            'Wah, keren!',
            'Ini yang saya cari-cari. Terima kasih!',
            'Boleh saya minta referensinya?',
            'Luar biasa! Inspiratif sekali.',
            'Mohon info lebih lanjut dong.',
        ];

        foreach ($allPosts->random(rand(5, 10)) as $post) {
            $commentCount = rand(1, 4);
            for ($i = 0; $i < $commentCount; $i++) {
                Comment::create([
                    'user_id' => $allUsers->random()->id,
                    'post_id' => $post->id,
                    'comment' => $commentTexts[array_rand($commentTexts)],
                ]);
            }
        }

        // Create follows
        foreach ($allUsers as $user) {
            $followTargets = $allUsers->where('id', '!=', $user->id)->random(rand(3, 6));
            foreach ($followTargets as $target) {
                try {
                    Follow::create([
                        'follower_id' => $user->id,
                        'following_id' => $target->id,
                    ]);
                } catch (\Throwable $e) {}
            }
        }

        // Create notifications
        foreach ($allUsers as $user) {
            $fromUsers = $allUsers->where('id', '!=', $user->id)->random(rand(1, 3));
            foreach ($fromUsers as $from) {
                Notification::create([
                    'user_id' => $user->id,
                    'from_user_id' => $from->id,
                    'type' => 'follow',
                    'is_read' => rand(0, 1),
                ]);
            }
        }

        echo "Seeding completed!\n";
        echo "Admin login: admin / password123\n";
    }
}
