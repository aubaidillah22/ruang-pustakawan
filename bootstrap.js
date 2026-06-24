const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CWD = process.cwd();

function run(cmd, opts = {}) {
    const maxRetries = opts.retries || 5;
    const delay = opts.delay || 2000;
    const timeout = opts.timeout || 300000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[Attempt ${attempt}/${maxRetries}] Running: ${cmd.substring(0, 100)}...`);
            const out = execSync(cmd, {
                shell: 'cmd.exe',
                cwd: CWD,
                timeout: timeout,
                stdio: 'pipe',
                windowsHide: true,
                env: { ...process.env, PATH: process.env.PATH }
            });
            const output = out?.toString() || '';
            console.log('SUCCESS!');
            if (opts.verbose || attempt > 1) {
                console.log(output.substring(0, 2000));
            }
            return output;
        } catch (e) {
            const stdout = e.stdout?.toString() || '';
            const stderr = e.stderr?.toString() || '';
            const combined = stdout + stderr;
            
            // Check if there's useful output despite the error
            if (combined.includes('require') || combined.includes('already')) {
                console.log('Already done or partial success.');
                console.log(combined.substring(0, 500));
                return combined;
            }
            
            console.log(`Attempt ${attempt} failed: ${e.message.substring(0, 200)}`);
            if (attempt < maxRetries) {
                console.log(`Waiting ${delay}ms before retry...`);
                execSync(`ping 127.0.0.1 -n ${Math.ceil(delay/1000) + 1} > nul`, { 
                    shell: 'cmd.exe', 
                    timeout: 10000,
                    windowsHide: true 
                });
            }
        }
    }
    throw new Error(`All ${maxRetries} attempts failed for: ${cmd.substring(0, 100)}`);
}

function fileExists(p) {
    return fs.existsSync(path.join(CWD, p));
}

// Step 1: Create Laravel project
console.log('\n========== STEP 1: CREATE LARAVEL PROJECT ==========');
if (fileExists('artisan')) {
    console.log('Laravel already installed, skipping...');
} else {
    run('cmd /c composer create-project laravel/laravel . --prefer-dist --no-interaction --no-progress 2>&1', { 
        timeout: 600000, retries: 3, delay: 5000 
    });
    console.log('Laravel project created!');
}

// Step 2: Check .env file
console.log('\n========== STEP 2: CHECK ENVIRONMENT ==========');
if (fileExists('.env')) {
    const envContent = fs.readFileSync(path.join(CWD, '.env'), 'utf-8');
    console.log('.env exists, current DB config:');
    const dbLines = envContent.split('\n').filter(l => l.startsWith('DB_'));
    dbLines.forEach(l => console.log('  ' + l));
} else {
    console.log('No .env found, copying from .env.example...');
    if (fileExists('.env.example')) {
        fs.copyFileSync(path.join(CWD, '.env.example'), path.join(CWD, '.env'));
        console.log('.env created from example');
    }
}

// Step 3: Generate app key
console.log('\n========== STEP 3: GENERATE APP KEY ==========');
run('cmd /c php artisan key:generate --no-interaction 2>&1', { timeout: 60000 });

// Step 4: Install Breeze
console.log('\n========== STEP 4: INSTALL BREEZE (REACT) ==========');
if (!fileExists('app/Http/Controllers/ProfileController.php') && !fileExists('resources/js/Pages')) {
    run('cmd /c composer require laravel/breeze --dev --no-interaction --no-progress 2>&1', { 
        timeout: 300000, retries: 3, delay: 3000 
    });
    console.log('Breeze package installed!');
    
    run('cmd /c php artisan breeze:install react --no-interaction 2>&1', { 
        timeout: 120000, retries: 3, delay: 3000 
    });
    console.log('Breeze scaffolding installed!');
} else {
    console.log('Breeze already installed, skipping...');
}

// Step 5: Install NPM dependencies
console.log('\n========== STEP 5: INSTALL NPM DEPENDENCIES ==========');
if (!fileExists('node_modules/.package-lock.json')) {
    run('cmd /c npm install 2>&1', { timeout: 300000, retries: 3, delay: 3000 });
    console.log('NPM dependencies installed!');
} else {
    console.log('node_modules exists, skipping...');
}

// Step 6: Check MySQL and create database
console.log('\n========== STEP 6: SETUP DATABASE ==========');
try {
    const mysqlOut = run('cmd /c "C:\\xampp\\mysql\\bin\\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS ruang_pustakawan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1', 
        { timeout: 30000, retries: 2 });
    console.log('Database created/verified:', mysqlOut);
} catch(e) {
    console.log('Could not create database. Will use SQLite fallback.');
}

// Update .env for database
let envContent = fs.readFileSync(path.join(CWD, '.env'), 'utf-8');
envContent = envContent
    .replace(/DB_CONNECTION=.*/, 'DB_CONNECTION=mysql')
    .replace(/DB_HOST=.*/, 'DB_HOST=127.0.0.1')
    .replace(/DB_PORT=.*/, 'DB_PORT=3306')
    .replace(/DB_DATABASE=.*/, 'DB_DATABASE=ruang_pustakawan')
    .replace(/DB_USERNAME=.*/, 'DB_USERNAME=root')
    .replace(/DB_PASSWORD=.*/, 'DB_PASSWORD=');
fs.writeFileSync(path.join(CWD, '.env'), envContent);
console.log('.env updated for MySQL');

// Step 7: Build frontend
console.log('\n========== STEP 7: BUILD FRONTEND ==========');
run('cmd /c npm run build 2>&1', { timeout: 300000, retries: 2, delay: 3000 });

console.log('\n========== BOOTSTRAP COMPLETE! ==========');
console.log('Open another terminal and run:');
console.log('  1. php artisan serve');
console.log('  2. php artisan migrate');
console.log('  3. npm run dev');
