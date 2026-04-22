import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = './screenshots';
const VIEWPORT = { width: 1920, height: 1080 };

const AUTH = {
    email: 'administrator@edu.id',
    password: 'password',
};

async function screenshot(page, flow, name) {
    const dir = path.join(SCREENSHOTS_DIR, flow);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`  Captured: ${flow}/${name}.png`);
}

async function waitForLivewire(page) {
    await page.waitForLoadState('networkidle');
    try {
        await page.waitForSelector('[wire\\:id]', { timeout: 5000 });
        await page.waitForTimeout(500);
    } catch {}
    await page.waitForTimeout(300);
}

async function login(page) {
    await page.goto(`${BASE_URL}/login`);
    await waitForLivewire(page);
    await page.fill('input[name="email"]', AUTH.email);
    await page.fill('input[name="password"]', AUTH.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await waitForLivewire(page);
}

async function safeNav(page, url) {
    try {
        await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle', timeout: 15000 });
        await waitForLivewire(page);
        return true;
    } catch (e) {
        console.log(`  Skipped (failed to load): ${url} — ${e.message}`);
        return false;
    }
}

async function clickAndScreenshot(page, flow, name, selector) {
    try {
        await page.click(selector, { timeout: 3000 });
        await waitForLivewire(page);
        await screenshot(page, flow, name);
    } catch (e) {
        console.log(`  Skipped click: ${name} — ${e.message}`);
    }
}

// ─── Flows ────────────────────────────────────────────────

async function flowAuth(page) {
    const flow = '01-auth';
    console.log('\n[Auth]');

    await page.goto(`${BASE_URL}/login`);
    await waitForLivewire(page);
    await screenshot(page, flow, '01-login-page');

    await page.fill('input[name="email"]', AUTH.email);
    await page.fill('input[name="password"]', AUTH.password);
    await screenshot(page, flow, '02-login-filled');
}

async function flowDashboard(page) {
    const flow = '02-dashboard';
    console.log('\n[Dashboard]');

    await page.goto(`${BASE_URL}/dashboard`);
    await waitForLivewire(page);
    await screenshot(page, flow, '01-dashboard');
}

async function flowFramework(page) {
    const flow = '03-framework';
    console.log('\n[Framework]');

    if (!(await safeNav(page, '/framework'))) return;
    await screenshot(page, flow, '01-framework-list');

    await clickAndScreenshot(page, flow, '02-framework-detail', 'table tbody tr:first-child a, table tbody tr:first-child td:first-child a');

    if (await safeNav(page, '/utilities/framework/template')) {
        await screenshot(page, flow, '03-framework-template-list');
    }

    if (await safeNav(page, '/utilities/framework/preparation')) {
        await screenshot(page, flow, '04-framework-preparation-list');
    }
}

async function flowOutline(page) {
    const flow = '04-outline';
    console.log('\n[Outline]');

    if (!(await safeNav(page, '/outline'))) return;
    await screenshot(page, flow, '01-outline-list');

    await clickAndScreenshot(page, flow, '02-outline-detail', 'table tbody tr:first-child a, table tbody tr:first-child td:first-child a');

    if (await safeNav(page, '/utilities/outline/template')) {
        await screenshot(page, flow, '03-outline-template-list');
    }

    if (await safeNav(page, '/utilities/outline/preparation')) {
        await screenshot(page, flow, '04-outline-preparation-list');
    }
}

async function flowQuestionWriting(page) {
    const flow = '05-question-writing';
    console.log('\n[Question Writing]');

    if (!(await safeNav(page, '/question-writing'))) return;
    await screenshot(page, flow, '01-question-writing-list');

    await clickAndScreenshot(page, flow, '02-question-writing-detail', 'table tbody tr:first-child a, table tbody tr:first-child td:first-child a');
}

async function flowQuestionReview(page) {
    const flow = '06-question-review';
    console.log('\n[Question Review]');

    if (!(await safeNav(page, '/question-review'))) return;
    await screenshot(page, flow, '01-question-review-list');

    await clickAndScreenshot(page, flow, '02-question-review-detail', 'table tbody tr:first-child a, table tbody tr:first-child td:first-child a');
}

async function flowQuestions(page) {
    const flow = '07-questions';
    console.log('\n[Questions]');

    if (!(await safeNav(page, '/questions'))) return;
    await screenshot(page, flow, '01-questions-list');

    await clickAndScreenshot(page, flow, '02-questions-detail', 'table tbody tr:first-child a, table tbody tr:first-child td:first-child a');
}

async function flowEvents(page) {
    const flow = '08-events';
    console.log('\n[Events]');

    if (await safeNav(page, '/utilities/event')) {
        await screenshot(page, flow, '01-event-list');
    }

    if (await safeNav(page, '/utilities/event/create')) {
        await screenshot(page, flow, '02-event-create');
    }

    if (await safeNav(page, '/utilities/event-review/not-set')) {
        await screenshot(page, flow, '03-event-review-not-set');
    }

    if (await safeNav(page, '/utilities/event-review/already-set')) {
        await screenshot(page, flow, '04-event-review-already-set');
    }
}

async function flowUserManagement(page) {
    const flow = '09-user-management';
    console.log('\n[User Management]');

    if (await safeNav(page, '/user-management/users')) {
        await screenshot(page, flow, '01-users-list');
    }

    if (await safeNav(page, '/user-management/roles')) {
        await screenshot(page, flow, '02-roles-list');
    }

    if (await safeNav(page, '/user-management/permissions')) {
        await screenshot(page, flow, '03-permissions-list');
    }
}

async function flowProfile(page) {
    const flow = '10-profile';
    console.log('\n[Profile]');

    if (await safeNav(page, '/my-profile')) {
        await screenshot(page, flow, '01-my-profile');
    }

    if (await safeNav(page, '/change-password')) {
        await screenshot(page, flow, '02-change-password');
    }
}

// ─── Main ─────────────────────────────────────────────────

(async () => {
    console.log('Starting screenshot capture...');
    console.log(`Target: ${BASE_URL}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();

    // Hide any remaining debugbar elements
    await page.addInitScript(() => {
        const style = document.createElement('style');
        style.textContent = '.phpdebugbar { display: none !important; }';
        document.head.appendChild(style);
    });

    try {
        await flowAuth(page);
        await login(page);
        console.log('Logged in successfully.');

        await flowDashboard(page);
        await flowFramework(page);
        await flowOutline(page);
        await flowQuestionWriting(page);
        await flowQuestionReview(page);
        await flowQuestions(page);
        await flowEvents(page);
        await flowUserManagement(page);
        await flowProfile(page);

        console.log('\nDone! Screenshots saved to ./screenshots/');
    } catch (e) {
        console.error('Fatal error:', e.message);
    } finally {
        await browser.close();
    }
})();
