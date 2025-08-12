const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
puppeteer.use(StealthPlugin());

// Your URLs
const urls = [
  'https://robu.in/product/esp32-38pin-development-board-wifibluetooth-ultra-low-power-consumption-dual-core/',
  'https://www.flyrobo.in/mpu6500-gy-6500-6dof-6-axis-accelerometer-gyro-sensor',
  'https://robocraze.com/products/mpu-6050-triple-axis-accelerometer-gyroscope-module',
  'https://flyingmachines.in/product/tower-pro-mg90s-9g-metal-gear/',
  'https://www.amazon.in/A2212-1000-Brushless-Motor-Drone/dp/B0CBQ2R895',
  'https://quartzcomponents.com/collections/development-boards/products/raspberry-pi-5-model-b-8-gb-ram',
  'https://www.flipkart.com/ihc-a2212-1000kv-brushless-motor-drone-electronic-components-hobby-kit/p/itm2cc70ab2faa8f'
];

// User agents
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.5735.133 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/14.0.3 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/90.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 Version/14.0 Mobile Safari/604.1",
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 Chrome/92.0.4515.107 Safari/537.36"
];

// Proxy list (optional) - you can use rotating residential proxies here
const proxies = [
  null, // No proxy for first request
  // "http://user:pass@proxy-ip:port"
];

const delay = ms => new Promise(res => setTimeout(res, ms));

function getRandomUA() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getRandomProxy() {
  return proxies[Math.floor(Math.random() * proxies.length)];
}

// Anti-detection tweaks
async function applyAntiDetection(page) {
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    window.chrome = { runtime: {} };
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  });
}

// Human-like scrolling
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 200;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300 + Math.random() * 300);
    });
  });
}

async function scrapeOnce() {
  for (const url of urls) {
    const proxy = getRandomProxy();
    const launchArgs = ['--no-sandbox', '--disable-setuid-sandbox'];

    if (proxy) launchArgs.push(`--proxy-server=${proxy}`);

    const browser = await puppeteer.launch({
      headless: false,
      args: launchArgs
    });

    const page = await browser.newPage();

    const ua = getRandomUA();
    await page.setUserAgent(ua);

    // Random viewport
    await page.setViewport({
      width: 1200 + Math.floor(Math.random() * 200),
      height: 800 + Math.floor(Math.random() * 200)
    });

    await applyAntiDetection(page);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await delay(3000 + Math.random() * 4000);

      // Scroll a bit
      await autoScroll(page);

      // CAPTCHA detection
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (/captcha|i am not a robot/i.test(bodyText)) {
        console.log(`⚠ CAPTCHA detected for ${url}, skipping...`);
        await browser.close();
        continue;
      }

      const domain = new URL(url).hostname;
      let title = null, price = null, availability = "Unknown";

      if (domain.includes('robu.in')) {
        title = await page.$eval('.product_title', el => el.textContent.trim()).catch(() => null);
        price = await page.$eval('.woocommerce-Price-amount', el => el.textContent.trim()).catch(() => null);
        availability = await page.$eval('.stock', el => el.textContent.trim()).catch(() => 'Unknown');
      }
      else if (domain.includes('flyrobo.in')) {
        title = await page.$eval('.page-title', el => el.textContent.trim()).catch(() => null);
        price = await page.$eval('.product-price', el => el.textContent.trim()).catch(() => null);
      }
      else if (domain.includes('robocraze.com')) {
        title = await page.$eval('.product_title h1', el => el.textContent.trim()).catch(() => null);
        price = await page.$eval('.price-item', el => el.textContent.trim()).catch(() => null);
      }
      else if (domain.includes('amazon.in') || domain.includes('amazon.com')) {
        title = await page.$eval('#productTitle', el => el.textContent.trim()).catch(() => null);
        price = await page.$$eval('span.a-price', priceEls => {
          for (let el of priceEls) {
            const symbol = el.querySelector('.a-price-symbol')?.textContent || '';
            const whole = el.querySelector('.a-price-whole')?.textContent || '';
            if (whole) return symbol + whole;
          }
          return null;
        }).catch(() => null);
      }
      else if (domain.includes('flipkart.com')) {
        title = await page.$eval('.VU-ZEz', el => el.textContent.trim()).catch(() => null);
        price = await page.$eval('.Nx9bqj .CxhGGd', el => el.textContent.trim()).catch(() => null);
      }

      console.log(`✅ ${domain} → ${title} | ${price} | ${availability}`);
    } catch (err) {
      console.log(`❌ Error on ${url}: ${err.message}`);
    }

    await browser.close();

    // Random delay between sites
    await delay(5000 + Math.random() * 5000);
  }
}

// Run every 5 mins
(async () => {
  while (true) {
    console.log(`🔄 Cycle start at ${new Date().toLocaleTimeString()}`);
    await scrapeOnce();
    console.log(`⏳ Waiting 5 minutes...\n`);
    await delay(5 * 60 * 1000);
  }
})();
