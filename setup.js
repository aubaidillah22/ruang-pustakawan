const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CWD = process.cwd();

function run(cmd, opts = {}) {
    const maxRetries = opts.retries || 8;
    const delay = opts.delay || 3000;
    const timeout = opts.timeout || 600000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`\n[Attempt ${attempt}/${maxRetries}] Running: ${cmd.substring(0, 120)}...`);
            const out = execSync(cmd, {
                shell: 'cmd.exe',
                cwd: CWD,
                timeout: timeout,
                stdio: 'pipe',
                windowsHide: true,
                env: { ...process.env, PATH: process.env.PATH }
            });
            const output = out?.toString() || '';
            console.log('✅ SUCCESS!');
            if (output.length > 0) {
                console.log(output.substring(0, 1000));
            }
            return output;
        } catch (e) {
            const stdout = e.stdout?.toString() || '';
            const stderr = e.stderr?.toString() || '';
            const combined = stdout + stderr;
            
            if (combined.includes('already') || combined.includes('Nothing to install') || combined.includes('up-to-date')) {
                console.log('Already done.');
                return combined;
            }
            
            console.log(`Attempt ${attempt} failed. ${e.message.substring(0, 200)}`);
            if (attempt < maxRetries) {
                console.log(`Waiting ${delay}ms before retry...`);
                execSync(`ping 127.0.0.1 -n ${Math.ceil(delay/1000) + 1} > nul`, { 
                    shell: 'cmd.exe', timeout: 10000, windowsHide: true 
                });
            }
        }
    }
    throw new Error(`All attempts failed`);
}

console.log('========================================');
console.log('  RUANG PUSTAKAWAN - SETUP SCRIPT');
console.log('========================================\n');

// Step 1: Composer install
console.log('\n========== STEP 1: COMPOSER INSTALL ==========');
if (!fs.existsSync(path.join(CWD, 'vendor/laravel/reverb'))) {
    run('cmd /c composer install --no-interaction --no-progress 2>&1', { timeout: 600000, retries: 5, delay: 5000 });
    console.log('Composer install completed!');
} else {
    console.log('Reverb already installed, skipping...');
}

// Step 2: Generate APP_KEY
console.log('\n========== STEP 2: GENERATE APP KEY ==========');
const envContent = fs.readFileSync(path.join(CWD, '.env'), 'utf-8');
if (!envContent.includes('APP_KEY=') || envContent.includes('APP_KEY=') && envContent.match(/APP_KEY=(base64|$)/)) {
    run('cmd /c php artisan key:generate --no-interaction 2>&1', { timeout: 60000, retries: 5 });
    console.log('APP_KEY generated!');
} else {
    console.log('APP_KEY already exists.');
}

// Step 3: Generate Reverb key
console.log('\n========== STEP 3: GENERATE REVERB KEY ==========');
try {
    const reverbOut = run('cmd /c php artisan reverb:generate --force --no-interaction 2>&1', { timeout: 60000, retries: 5 });
    console.log('Reverb keys generated!');
    // Update .env with reverb keys
    let env = fs.readFileSync(path.join(CWD, '.env'), 'utf-8');
    const keyMatch = reverbOut.match(/REVERB_APP_ID=(\w+)/);
    if (keyMatch) {
        const lines = reverbOut.split('\n');
        lines.forEach(line => {
            if (line.startsWith('REVERB_')) {
                const [k, ...v] = line.split('=');
                const val = v.join('=');
                if (env.includes(k + '=')) {
                    const regex = new RegExp(k + '=.*', 'g');
                    env = env.replace(regex, k + '=' + val);
                } else {
                    env += '\n' + k + '=' + val;
                }
            }
        });
        fs.writeFileSync(path.join(CWD, '.env'), env);
        console.log('.env updated with Reverb keys');
    }
} catch(e) {
    console.log('Reverb generate warning (may need to run manually):', e.message.substring(0, 100));
}

// Step 4: Create database
console.log('\n========== STEP 4: CREATE DATABASE ==========');
try {
    run('cmd /c "C:\\xampp\\mysql\\bin\\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS ruang_pustakawan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1', 
        { timeout: 30000, retries: 3 });
    console.log('Database created/verified!');
} catch(e) {
    console.log('Could not create database via mysql client. Please create manually:');
    console.log('  CREATE DATABASE ruang_pustakawan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
}

// Step 5: Migrate
console.log('\n========== STEP 5: MIGRATE & SEED ==========');
run('cmd /c php artisan migrate --force --no-interaction 2>&1', { timeout: 120000, retries: 5 });
console.log('Migration completed!');

run('cmd /c php artisan db:seed --force --no-interaction 2>&1', { timeout: 120000, retries: 5 });
console.log('Seeding completed!');

// Step 6: NPM install
console.log('\n========== STEP 6: NPM INSTALL ==========');
if (!fs.existsSync(path.join(CWD, 'node_modules'))) {
    run('cmd /c npm install 2>&1', { timeout: 300000, retries: 5, delay: 5000 });
    console.log('NPM install completed!');
} else {
    console.log('node_modules already exists, skipping...');
}

// Step 7: Build frontend
console.log('\n========== STEP 7: BUILD FRONTEND ==========');
run('cmd /c npm run build 2>&1', { timeout: 300000, retries: 3, delay: 5000 });
console.log('Frontend built!');

console.log('\n========================================');
console.log('  ✅ SETUP COMPLETE!');
console.log('========================================');
console.log('\nUntuk menjalankan aplikasi:');
console.log('  Terminal 1: php artisan serve');
console.log('  Terminal 2: php artisan queue:listen --tries=1');
console.log('  Terminal 3: php artisan reverb:start');
console.log('  Terminal 4: npm run dev (development)');
console.log('\nAtau jalankan semua dengan: composer run dev');
console.log('\nLogin: admin / password123');
