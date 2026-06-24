<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->withoutMiddleware()
            ->post('/register', [
                'fullname' => 'Test User',
                'username' => 'testuser',
                'email' => 'test@example.com',
                'password' => 'Rahasia123!',
                'password_confirmation' => 'Rahasia123!',
            ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
