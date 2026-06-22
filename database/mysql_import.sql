-- Ruang Pustakawan MySQL Import
-- Generated: 2026-06-18 07:47:02

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `comments`;
INSERT INTO `comments` (`id`, `user_id`, `post_id`, `comment`, `created_at`) VALUES (1, 2, 8, 'test komentar', '2026-06-18 03:32:12');
INSERT INTO `comments` (`id`, `user_id`, `post_id`, `comment`, `created_at`) VALUES (2, 2, 9, 'asdf', '2026-06-18 03:32:26');
INSERT INTO `comments` (`id`, `user_id`, `post_id`, `comment`, `created_at`) VALUES (3, 2, 9, 'tesk komentar', '2026-06-18 03:35:09');
INSERT INTO `comments` (`id`, `user_id`, `post_id`, `comment`, `created_at`) VALUES (4, 2, 8, 'test komentar 2', '2026-06-18 03:35:32');
INSERT INTO `comments` (`id`, `user_id`, `post_id`, `comment`, `created_at`) VALUES (5, 1, 9, 'oke komentar masuk', '2026-06-18 03:40:55');
INSERT INTO `comments` (`id`, `user_id`, `post_id`, `comment`, `created_at`) VALUES (6, 1, 10, 'tahu...', '2026-06-18 04:10:02');
INSERT INTO `comments` (`id`, `user_id`, `post_id`, `comment`, `created_at`) VALUES (7, 3, 10, 'bulat', '2026-06-18 04:10:50');

TRUNCATE TABLE `follows`;
INSERT INTO `follows` (`id`, `follower_id`, `following_id`, `created_at`) VALUES (1, 3, 1, '2026-06-15 20:04:06');

TRUNCATE TABLE `likes`;
INSERT INTO `likes` (`id`, `user_id`, `post_id`, `created_at`) VALUES (1, 3, 4, '2026-06-15 20:04:12');
INSERT INTO `likes` (`id`, `user_id`, `post_id`, `created_at`) VALUES (3, 1, 5, '2026-06-18 02:40:36');
INSERT INTO `likes` (`id`, `user_id`, `post_id`, `created_at`) VALUES (4, 1, 3, '2026-06-18 02:40:39');
INSERT INTO `likes` (`id`, `user_id`, `post_id`, `created_at`) VALUES (5, 1, 4, '2026-06-18 02:40:40');
INSERT INTO `likes` (`id`, `user_id`, `post_id`, `created_at`) VALUES (11, 2, 8, '2026-06-18 03:31:57');
INSERT INTO `likes` (`id`, `user_id`, `post_id`, `created_at`) VALUES (12, 2, 9, '2026-06-18 03:35:15');
INSERT INTO `likes` (`id`, `user_id`, `post_id`, `created_at`) VALUES (13, 1, 9, '2026-06-18 03:40:46');

TRUNCATE TABLE `messages`;
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `image`, `created_at`, `is_read`, `read_at`) VALUES (1, 1, 3, 'test', NULL, '2026-06-18 03:22:23', 1, '2026-06-18 03:59:07');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `image`, `created_at`, `is_read`, `read_at`) VALUES (2, 1, 3, 'test', NULL, '2026-06-18 03:22:25', 1, '2026-06-18 03:59:07');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `image`, `created_at`, `is_read`, `read_at`) VALUES (3, 2, 1, 'test kirim pesan ke user lain', NULL, '2026-06-18 03:37:05', 1, '2026-06-18 03:40:26');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `image`, `created_at`, `is_read`, `read_at`) VALUES (4, 1, 2, 'iyya saya balas pesan ini', NULL, '2026-06-18 03:41:14', 1, '2026-06-18 04:00:42');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `image`, `created_at`, `is_read`, `read_at`) VALUES (5, 1, 2, 'iyya saya balas pesan ini', NULL, '2026-06-18 03:46:56', 1, '2026-06-18 04:00:42');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `image`, `created_at`, `is_read`, `read_at`) VALUES (6, 1, 2, 'saya balas 3 kali', NULL, '2026-06-18 03:47:09', 1, '2026-06-18 04:00:42');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `image`, `created_at`, `is_read`, `read_at`) VALUES (7, 1, 2, 'oke saya balas lagi', NULL, '2026-06-18 03:52:21', 1, '2026-06-18 04:00:42');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `image`, `created_at`, `is_read`, `read_at`) VALUES (8, 1, 2, 'oke amana', NULL, '2026-06-18 03:53:14', 1, '2026-06-18 04:00:42');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `image`, `created_at`, `is_read`, `read_at`) VALUES (9, 1, 2, 'tulis pesan', NULL, '2026-06-18 03:54:03', 1, '2026-06-18 04:00:42');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `image`, `created_at`, `is_read`, `read_at`) VALUES (10, 3, 1, 'iyya ada apa', NULL, '2026-06-18 03:59:15', 1, '2026-06-18 03:59:46');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `image`, `created_at`, `is_read`, `read_at`) VALUES (11, 1, 3, 'oke saya balas', NULL, '2026-06-18 04:00:19', 1, '2026-06-18 04:01:19');
INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `message`, `image`, `created_at`, `is_read`, `read_at`) VALUES (12, 1, 2, 'hyy..', NULL, '2026-06-18 04:45:58', 1, '2026-06-18 04:46:24');

TRUNCATE TABLE `notifications`;
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (1, 1, 3, 'follow', NULL, 1, '2026-06-15 20:04:06');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (2, 1, 3, 'like', 4, 1, '2026-06-15 20:04:12');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (4, 3, 1, 'follow', NULL, 1, '2026-06-16 06:01:21');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (5, 2, 1, 'follow', NULL, 1, '2026-06-16 06:01:22');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (6, 2, 1, 'follow', NULL, 1, '2026-06-16 19:34:58');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (7, 2, 1, 'follow', NULL, 1, '2026-06-16 19:35:01');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (8, 3, 2, 'like', 9, 1, '2026-06-18 03:31:36');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (9, 3, 2, 'like', 9, 1, '2026-06-18 03:31:39');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (10, 1, 2, 'like', 8, 1, '2026-06-18 03:31:47');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (11, 3, 2, 'like', 9, 1, '2026-06-18 03:31:51');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (12, 3, 2, 'like', 9, 1, '2026-06-18 03:31:54');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (13, 1, 2, 'like', 8, 1, '2026-06-18 03:31:57');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (14, 1, 2, 'comment', 8, 1, '2026-06-18 03:32:12');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (15, 3, 2, 'comment', 9, 1, '2026-06-18 03:32:26');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (16, 3, 2, 'comment', 9, 1, '2026-06-18 03:35:09');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (17, 3, 2, 'like', 9, 1, '2026-06-18 03:35:15');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (18, 1, 2, 'comment', 8, 1, '2026-06-18 03:35:32');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (19, 3, 1, 'like', 9, 1, '2026-06-18 03:40:46');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (20, 3, 1, 'comment', 9, 1, '2026-06-18 03:40:55');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (22, 2, 1, 'message', NULL, 1, '2026-06-18 03:46:57');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (23, 2, 1, 'message', NULL, 1, '2026-06-18 03:47:10');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (24, 2, 1, 'message', NULL, 1, '2026-06-18 03:52:21');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (25, 2, 1, 'message', NULL, 1, '2026-06-18 03:53:14');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (26, 2, 1, 'message', NULL, 1, '2026-06-18 03:54:03');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (27, 1, 3, 'message', NULL, 1, '2026-06-18 03:59:16');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (28, 3, 1, 'message', NULL, 1, '2026-06-18 04:00:19');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (29, 3, 1, 'comment', 10, 1, '2026-06-18 04:10:02');
INSERT INTO `notifications` (`id`, `user_id`, `from_user_id`, `type`, `post_id`, `is_read`, `created_at`) VALUES (30, 2, 1, 'message', NULL, 1, '2026-06-18 04:45:59');


TRUNCATE TABLE `posts`;
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (1, 1, 'sdfg', NULL, '2026-06-15 19:45:39', NULL, NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (2, 1, 'sdfg', NULL, '2026-06-15 19:45:41', NULL, NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (3, 1, 'sdfgsdfg', NULL, '2026-06-15 19:45:43', NULL, NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (4, 1, 'sdfgsdfg', NULL, '2026-06-15 19:45:44', NULL, NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (5, 1, 'sdfgsdfg', NULL, '2026-06-15 19:45:45', NULL, NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (7, 1, 'aku pusingg', NULL, '2026-06-16 19:10:38', '2026-06-16 19:35:26', NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (8, 1, 'asdfa', NULL, '2026-06-18 02:32:32', '2026-06-18 02:32:32', NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (9, 3, 'test posting', NULL, '2026-06-18 03:22:47', '2026-06-18 03:22:47', NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (10, 3, 'halo semuanya!!', NULL, '2026-06-18 04:09:09', '2026-06-18 04:09:09', NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (11, 1, 'a', NULL, '2026-06-18 04:12:07', '2026-06-18 04:12:07', NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (12, 1, 'b', NULL, '2026-06-18 04:12:11', '2026-06-18 04:12:11', NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (13, 1, 'c', NULL, '2026-06-18 04:12:14', '2026-06-18 04:12:14', NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (14, 1, 'asdfasdgg', NULL, '2026-06-18 04:12:17', '2026-06-18 04:12:17', NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (15, 1, 'adfhsdfgs', NULL, '2026-06-18 04:12:22', '2026-06-18 04:12:22', NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (16, 1, 'afdgdasfad', NULL, '2026-06-18 04:12:25', '2026-06-18 04:12:25', NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (17, 1, 'sdfghjkjhgf', NULL, '2026-06-18 04:12:34', '2026-06-18 04:12:34', NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (18, 1, 'ghjklhbhbjk', NULL, '2026-06-18 04:12:37', '2026-06-18 04:12:37', NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (19, 2, '', 'assets/uploads/1781759005_6a337c1d37430.png', '2026-06-18 05:03:25', '2026-06-18 05:03:25', NULL);
INSERT INTO `posts` (`id`, `user_id`, `content`, `image`, `created_at`, `updated_at`, `video`) VALUES (21, 1, 'tes upload gambar', 'assets/uploads/1781763314_6a338cf267220.png', '2026-06-18 06:15:14', '2026-06-18 06:15:14', NULL);


TRUNCATE TABLE `users`;
INSERT INTO `users` (`id`, `username`, `email`, `password`, `fullname`, `bio`, `avatar`, `role`, `remember_token`, `created_at`, `updated_at`, `last_seen_at`) VALUES (1, 'starboy', 'starboy@gmail.com', '$2y$12$6c/WPzJKpA6GMAJojBeAku1X/TdFn1gFZin5kxUMn.kzqJpwE/8BW', 'starboy', 'Aku starboyy huhuy', 'avatar_1_1781638337_6a31a4c171461.png', 'admin', NULL, '2026-06-15 19:42:51', '2026-06-16 19:32:17', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `fullname`, `bio`, `avatar`, `role`, `remember_token`, `created_at`, `updated_at`, `last_seen_at`) VALUES (2, 'user', 'user@gmail.com', '$2y$12$7UZ/Y3xZNIPSQJ/7Eqv/eu7Weekw220LPci.eNTw/rSB6xD2boJYW', 'user', 'test', 'avatar_2_1781753218_6a336582afe38.jpg', 'user', NULL, '2026-06-15 19:47:00', '2026-06-18 03:26:58', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `fullname`, `bio`, `avatar`, `role`, `remember_token`, `created_at`, `updated_at`, `last_seen_at`) VALUES (3, 'coba', 'coba@gmail.com', '$2y$12$OuPBz5bSoagIDE/eAhNNuOGAPDz3HdminIGTepylLB6kj2LM/0Zui', 'coba', 'kucing galau', 'avatar_3_1781755117_6a336cedd8c29.png', 'user', NULL, '2026-06-15 22:32:23', '2026-06-18 03:58:37', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `fullname`, `bio`, `avatar`, `role`, `remember_token`, `created_at`, `updated_at`, `last_seen_at`) VALUES (4, 'joko', 'joko@gmail.com', '$2y$12$.wGEp1ETThesw0lQkNGe/u0VHp/OZNAZjbfGLSVkmpvW9hBwnqpiC', 'joko', NULL, 'default.svg', 'user', NULL, '2026-06-18 05:17:05', '2026-06-18 05:17:05', NULL);

SET FOREIGN_KEY_CHECKS = 1;
