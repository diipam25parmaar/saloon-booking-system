<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$category = \App\Models\Category::find(3);
if ($category) {
    echo "Category found: " . $category->name . "\n";
    $result = $category->delete();
    echo "Deleted: " . ($result ? 'true' : 'false') . "\n";
} else {
    echo "Category 3 not found.\n";
}
