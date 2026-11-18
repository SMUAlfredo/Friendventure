import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',timeout:60000,workers:1,reporter:'list',
 use:{browserName:'chromium',channel:'chrome',headless:true},
 webServer:{command:'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5175',url:'http://127.0.0.1:5175',reuseExistingServer:true}
});
