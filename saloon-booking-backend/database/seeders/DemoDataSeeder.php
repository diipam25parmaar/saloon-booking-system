<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\WorkingTimeRule;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Service::truncate();
        WorkingTimeRule::truncate();
        Category::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Admin User', 'password' => Hash::make('password123'), 'role' => 'admin']
        );

        $catHair = Category::create(['name' => 'Hair Care', 'is_active' => true]);
        $catNails = Category::create(['name' => 'Nail Care', 'is_active' => true]);
        $catSpa = Category::create(['name' => 'Spa & Massage', 'is_active' => true]);

        Service::create(['name' => 'Men\'s Haircut', 'duration_minutes' => 30, 'category_id' => $catHair->id, 'price' => 25.00]);
        Service::create(['name' => 'Women\'s Haircut & Styling', 'duration_minutes' => 60, 'category_id' => $catHair->id, 'price' => 65.00]);
        Service::create(['name' => 'Hair Coloring', 'duration_minutes' => 120, 'category_id' => $catHair->id, 'price' => 120.00]);

        Service::create(['name' => 'Classic Manicure', 'duration_minutes' => 30, 'category_id' => $catNails->id, 'price' => 20.00]);
        Service::create(['name' => 'Gel Pedicure', 'duration_minutes' => 45, 'category_id' => $catNails->id, 'price' => 45.00]);

        Service::create(['name' => 'Deep Tissue Massage', 'duration_minutes' => 60, 'category_id' => $catSpa->id, 'price' => 80.00]);
        Service::create(['name' => 'Hot Stone Massage', 'duration_minutes' => 90, 'category_id' => $catSpa->id, 'price' => 110.00]);

        // Monday to Friday
        foreach ([1,2,3,4,5] as $dow) {
            WorkingTimeRule::create([
                'day_of_week' => $dow,
                'start_time' => '09:00',
                'end_time' => '18:00',
                'is_active' => true,
            ]);
        }
        
        // Saturday
        WorkingTimeRule::create([
            'day_of_week' => 6,
            'start_time' => '10:00',
            'end_time' => '15:00',
            'is_active' => true,
        ]);
    }
}
