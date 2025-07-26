const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
puppeteer.use(StealthPlugin());

const urls =[
  'https://robu.in/product/esp32-38pin-development-board-wifibluetooth-ultra-low-power-consumption-dual-core/?gad_source=1&gad_campaignid=21296336107&gbraid=0AAAAADvLFWcId0kcQoZ5G7yTCBwZ-AM90&gclid=Cj0KCQjwjJrCBhCXARIsAI5x66U1eq0zXoBuqR-co1CUKicJ99hmuI2GFzNnviJqzo5MPWjCkMnDRdMaAsNsEALw_wcB',
  'https://www.flyrobo.in/mpu6500-gy-6500-6dof-6-axis-accelerometer-gyro-sensor?tracking=ads&tracking=4a9a9a&gad_source=1&gad_campaignid=17426303996&gbraid=0AAAAAC6AkE_J-IhY8AoMDrZILBUTjtfBR&gclid=CjwKCAjwr5_CBhBlEiwAzfwYuLAqf5BRnpkEM8rPTbI8TnrfUuYeFlODy5XXEn4wTt96R1J-pac_-hoCsGMQAvD_BwE',
  'https://robocraze.com/products/mpu-6050-triple-axis-accelerometer-gyroscope-module?variant=40192322011289&country=IN&currency=INR&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic&campaignid=21596928874&adgroupid=&keyword=&device=c&gad_source=1&gad_campaignid=21596930350&gbraid=0AAAAADgHQvbeFfDunjoM48YseNJqX44sP&gclid=CjwKCAjwr5_CBhBlEiwAzfwYuGYa44DsoukyWZraCxQJ9xQL53WC6ryBnNp91kCV9-qW9oJ9kOc7jBoChNEQAvD_BwE',
  'https://flyingmachines.in/product/tower-pro-mg90s-9g-metal-gear/',
  'https://www.amazon.in/A2212-1000-Brushless-Motor-Drone/dp/B0CBQ2R895/ref=asc_df_B0CBQ2R895?mcid=05a1b4f75731384886023ddfed8e0fa9&tag=googleshopdes-21&linkCode=df0&hvadid=709963085501&hvpos=&hvnetw=g&hvrand=2764878810804600553&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9302378&hvtargid=pla-2358746805554&psc=1&gad_source=1',
  'https://quartzcomponents.com/collections/development-boards/products/raspberry-pi-5-model-b-8-gb-ram',
  'https://www.flipkart.com/ihc-a2212-1000kv-brushless-motor-drone-electronic-components-hobby-kit/p/itm2cc70ab2faa8f?pid=EHKGF58RSMNRF8HW&lid=LSTEHKGF58RSMNRF8HWHFAFX9&marketplace=FLIPKART&cmpid=content_electronic-hobby-kit_22431562759_x_8965229628_gmc_pla&tgi=sem,1,G,11214002,x,,,,,,,c,,,,,,,&entryMethod=22431562759&&cmpid=content_22431562759_gmc_pla&gad_source=1&gad_campaignid=22428048374&gbraid=0AAAAADxRY5-SECYYUT4N_XqqtLoQ-Fxtr&gclid=CjwKCAjwr5_CBhBlEiwAzfwYuFAz8A1FdcTowK_uuV3lPVFn-cUciI6CH3eQu_T-TnVCpHXAuJZg4hoCCqcQAvD_BwE',
];
// 50 user agents
const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/14.0.3 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/90.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 Version/14.0 Mobile Safari/604.1",
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 Chrome/92.0.4515.107 Safari/537.36",
  "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 Version/14.0 Mobile Safari/604.1",
  "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 Chrome/89.0.4389.105 Mobile Safari/537.36",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 Chrome/90.0.4430.93 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 Chrome/90.0.4430.212 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.5735.133 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 11; SM-M315F) AppleWebKit/537.36 Chrome/91.0.4472.120 Mobile Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/91.0.4472.114 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 8.0.0; SM-J600G) AppleWebKit/537.36 Chrome/90.0.4430.210 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 Chrome/90.0.4430.212 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 Chrome/90.0.4430.93 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 9; Mi A2) AppleWebKit/537.36 Chrome/89.0.4389.90 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 Version/13.0 Mobile Safari/604.1",
  "Mozilla/5.0 (X11; Fedora; Linux x86_64) Gecko/20100101 Firefox/85.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 Chrome/79.0.3945.117 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 10; SM-A205F) AppleWebKit/537.36 Chrome/83.0.4103.106 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/88.0.4324.104 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/87.0.4280.66 Safari/537.36",
  "Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15 Version/13.0 Mobile Safari/604.1",
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 Chrome/83.0.4103.61 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 10; SM-N960F) AppleWebKit/537.36 Chrome/89.0.4389.105 Mobile Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 Chrome/81.0.4044.138 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 Chrome/78.0.3904.108 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/86.0.4240.75 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 6.0.1; Redmi Note 4) AppleWebKit/537.36 Chrome/74.0.3729.136 Mobile Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 Chrome/68.0.3440.106 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 Chrome/87.0.4280.88 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 9; Nokia 6.1 Plus) AppleWebKit/537.36 Chrome/80.0.3987.132 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_2 like Mac OS X) AppleWebKit/605.1.15 Version/12.0 Mobile Safari/604.1",
  "Mozilla/5.0 (X11; Debian; Linux x86_64) Gecko/20100101 Firefox/82.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 Chrome/65.0.3325.181 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 Chrome/76.0.3809.132 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 8.1.0; Moto G5S Plus) AppleWebKit/537.36 Chrome/83.0.4103.106 Mobile Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 Chrome/49.0.2623.112 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/85.0.4183.121 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/93.0.4577.63 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 7.1.1; Pixel) AppleWebKit/537.36 Chrome/88.0.4324.93 Mobile Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 Chrome/61.0.3163.100 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 Mobile Safari/604.1",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 Chrome/70.0.3538.110 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/84.0.4147.125 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 7.0; Infinix X603) AppleWebKit/537.36 Chrome/74.0.3729.157 Mobile Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.36 Chrome/49.0.2623.112 Safari/537.36",
  "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 Chrome/49.0.2623.112 Safari/537.36"
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function getRandomHeaders() {
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  return {
    'User-Agent': userAgent,
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Upgrade-Insecure-Requests': '1',
    'Connection': 'keep-alive'
  };
}

async function scrapeOnce() {
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  const results = [];

  for (const url of urls) {
    const page = await browser.newPage();
    const headers = getRandomHeaders();
    await page.setExtraHTTPHeaders(headers);
    await page.setUserAgent(headers['User-Agent']);
    await page.setViewport({
      width: 1200 + Math.floor(Math.random() * 200),
      height: 800 + Math.floor(Math.random() * 200),
    });

    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      await delay(3000);

      let title = null, price = null, availability = 'Unknown';
      const domain = new URL(url).hostname;

      if (domain.includes('robu.in')) {
        title = await page.$eval('.product_title', el => el.textContent.trim()).catch(() => null);
        price = await page.$eval('.woocommerce-Price-amount', el => el.textContent.trim()).catch(() => null);
        availability = await page.$eval('.stock', el => el.textContent.trim()).catch(() => 'Unknown');
        if (!price || price.includes('0.00')) {
          const bodyText = await page.evaluate(() => document.body.innerText);
          const matches = bodyText.match(/₹\s?[\d,]+(\.\d{2})?/g);
          if (matches && matches.length > 0) {
            price = matches.find(p => !p.includes('0.00')) || matches[0];
          }
        }
      }
      else if (domain.includes('flyrobo.in')) {
        title = await page.$eval('.page-title', el => el.textContent.trim()).catch(() => null);
        price = await page.$eval('.product-price', el => el.textContent.trim()).catch(() => { return null; });
        availability = await page.$eval('.product-stock span', el => el.textContent.trim()).catch(() => 'Unknown');
        if (!price || price.includes('0.00')) {
          const bodyText = await page.evaluate(() => document.body.innerText);
          const matches = bodyText.match(/₹\s?[\d,]+(\.\d{2})?/g);
          if (matches && matches.length > 0) {
            price = matches.find(p => !p.includes('0.00')) || matches[0];
          }
        }
      }
      else if (domain.includes('robocraze.com')) {
        title = await page.$eval('.product_title h1', el => el.textContent.trim()).catch(() => null);
        price = await page.$eval('.price-item', el => el.textContent.trim()).catch(() => null);
        availability = 'Unknown';
      }
      else if (domain.includes('flyingmachines.in')) {
        title = await page.$eval('.product_title', el => el.textContent.trim()).catch(() => null);
        price = await page.$eval('.woocommerce-Price-amount', el => el.textContent.trim()).catch(() => null);
        availability = await page.$eval('.stock', el => el.textContent.trim()).catch(() => 'Unknown');
        if (!price || price.includes('0.00')) {
          const bodyText = await page.evaluate(() => document.body.innerText);
          const matches = bodyText.match(/₹\s?[\d,]+(\.\d{2})?/g);
          if (matches && matches.length > 0) {
            price = matches.find(p => !p.includes('0.00')) || matches[0];
          }
        }
      }
      else if (domain.includes('quartzcomponents.com')) {
        title = await page.$eval('.product_shop .product-title', el => el.textContent.trim()).catch(() => null);
        price = await page.$eval('.product-price .price-item', el => el.textContent.trim()).catch(() => null);
        const availability = await page.$eval(
          '.product_inventory span',
          el => {
            const text = el.textContent.trim();         // "176 In stock"
            const match = text.match(/[A-Za-z\s]+$/);   // Match last word(s) like "In stock"
            return match ? match[0].trim() : 'Unknown';
          }
        ).catch(() => 'Unknown');
        if (!price || price.includes('0.00')) {
          const bodyText = await page.evaluate(() => document.body.innerText);
          const matches = bodyText.match(/₹\s?[\d,]+(\.\d{2})?/g);
          if (matches && matches.length > 0) {
            price = matches.find(p => !p.includes('0.00')) || matches[0];
          }
        }
      }
      else if (domain.includes('flipkart.com')) {
        title = await page.$eval('.VU-ZEz', el => el.textContent.trim()).catch(() => "Sorry We can not get it");
        price = await page.$eval('.Nx9bqj .CxhGGd', el => el.textContent.trim()).catch(() => null);
        availability = await page.$eval('div._16FRp0', el => el.textContent.trim()).catch(() => 'In stock');
        if (!price || price.includes('0.00')) {
          const bodyText = await page.evaluate(() => document.body.innerText);
          const matches = bodyText.match(/₹[\d,]+(?:\.\d{1,2})?/);
          if (matches && matches.length > 0) {
            price = matches[0];
          }
        }



      }
      else if (domain.includes('amazon.in') || domain.includes('amazon.com')) {
        await delay(2000); // Wait for 2 seconds
        title = await page.$eval('#productTitle', el => el.textContent.trim()).catch(() => null);
        price = price = await page.$$eval('span.a-price', priceEls => {
          for (let el of priceEls) {
            const symbol = el.querySelector('.a-price-symbol')?.textContent || '';
            const whole = el.querySelector('.a-price-whole')?.textContent || '';
            if (whole) {
              return symbol + whole;
            }
          } return null;
        }).catch(() => null);

        availability = await page.$eval('#availability span', el => el.textContent.trim()).catch(() => 'Unknown');
      }

      /*
        if (!price || price.includes('0.00')) {
          const bodyText = await page.evaluate(() => document.body.innerText);
          const matches = bodyText.match(/₹\s?[\d,]+(\.\d{2})?/g);
          if (matches && matches.length > 0) {
            price = matches.find(p => !p.includes('0.00')) || matches[0];
          }
        }
       */

      results.push({ url, title, price, availability });
      console.log(`✅ Scraped: ${domain}`);
    } catch (err) {
      console.error(`❌ Error scraping : ${err.message}`);
    }
    await page.close();
  }

  await browser.close();

  console.log(results);
}

// Infinite loop
(async () => {
  while (true) {
    console.log(`🔁 New cycle at ${new Date().toLocaleString()}`);
    await scrapeOnce();
    console.log(`⏳ Waiting 5 minutes...\n`);

  }
})();
