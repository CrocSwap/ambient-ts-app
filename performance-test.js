const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'http://localhost:3000';
const RESULTS_DIR = path.join(__dirname, 'performance-results');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

async function measurePerformance() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        isMobile: false,
    });

    const page = await context.newPage();

    // Enable performance metrics
    await page.goto('about:blank');
    await page.addInitScript(() => {
        window.performanceMetrics = {
            navigationStart: 0,
            loadEventEnd: 0,
            firstPaint: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            timeToInteractive: 0,
        };

        // Listen for performance metrics
        window.performance.mark('start-navigation');

        // First Paint
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
                if (
                    entry.entryType === 'paint' &&
                    entry.name === 'first-paint'
                ) {
                    window.performanceMetrics.firstPaint = entry.startTime;
                } else if (
                    entry.entryType === 'paint' &&
                    entry.name === 'first-contentful-paint'
                ) {
                    window.performanceMetrics.firstContentfulPaint =
                        entry.startTime;
                } else if (entry.entryType === 'largest-contentful-paint') {
                    window.performanceMetrics.largestContentfulPaint =
                        entry.startTime;
                }
            }
        });

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    });

    // Navigate to the page
    console.log(`Navigating to ${SITE_URL}...`);
    await page.goto(SITE_URL, { waitUntil: 'networkidle' });

    // Wait for the page to be interactive
    await page.waitForFunction(() => document.readyState === 'complete');

    // Get the performance metrics
    const metrics = await page.evaluate(async () => {
        // Calculate Time to Interactive (simplified)
        const timing = window.performance.timing;
        const tti = Math.max(
            timing.domInteractive - timing.navigationStart,
            timing.domContentLoadedEventEnd - timing.navigationStart,
            timing.loadEventEnd - timing.navigationStart,
        );

        return {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            firstPaint: window.performanceMetrics.firstPaint,
            firstContentfulPaint:
                window.performanceMetrics.firstContentfulPaint,
            largestContentfulPaint:
                window.performanceMetrics.largestContentfulPaint,
            timeToInteractive: tti,
            domContentLoaded:
                timing.domContentLoadedEventEnd - timing.navigationStart,
            load: timing.loadEventEnd - timing.navigationStart,
            domComplete: timing.domComplete - timing.navigationStart,
            // Add more metrics as needed
        };
    });

    // Save results to a file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultFile = path.join(RESULTS_DIR, `performance-${timestamp}.json`);
    fs.writeFileSync(resultFile, JSON.stringify(metrics, null, 2));

    console.log('Performance Metrics:');
    console.table({
        'First Paint (ms)': metrics.firstPaint.toFixed(2),
        'First Contentful Paint (ms)': metrics.firstContentfulPaint.toFixed(2),
        'Largest Contentful Paint (ms)':
            metrics.largestContentfulPaint?.toFixed(2) || 'N/A',
        'Time to Interactive (ms)': metrics.timeToInteractive.toFixed(2),
        'DOM Content Loaded (ms)': metrics.domContentLoaded.toFixed(2),
        'Load (ms)': metrics.load.toFixed(2),
        'DOM Complete (ms)': metrics.domComplete.toFixed(2),
    });

    await browser.close();
    return metrics;
}

// Run the performance test
measurePerformance()
    .then((metrics) => {
        console.log('Performance test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Performance test failed:', error);
        process.exit(1);
    });
