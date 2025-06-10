const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
puppeteer.use(StealthPlugin());

const urls = []
 'https://www.flipkart.com/arduino-r3-ch40-micro-controller-board-electronic-hobby-kit/p/itm75bad445346cb',
 'https://www.amazon.in/roboCraze-Arduino-Development-Board-cable/dp/B07G4C4D8F/ref=asc_df_B07G4C4D8F',
];


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeOnce() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const results = [];

  for (const url of urls) {
    const page = await browser.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      await delay(3000);

      let title = null, price = null, description = null, availability = 'Unknown';
      const domain = new URL(url).hostname;
      if (domain.includes('robu.in')) {
        title = await page.$eval('.product_title', el => el.textContent.trim()).catch(() => null);
        description = await page.$eval('.woocommerce-product-details__short-description', el => el.textContent.trim()).catch(() => null);
        price = await page.$eval('.woocommerce-Price-amount', el => el.textContent.trim()).catch(() => null);
        availability = await page.$eval('.stock', el => el.textContent.trim()).catch(() => 'Unknown');
      }
      else if (domain.includes('flyrobo.in')) {
        title = await page.$eval('.page-title', el => el.textContent.trim()).catch(() => null);
        price = await page.$eval('.price-box .special-price .price', el => el.textContent.trim()).catch(() => { return null; });
        availability = await page.$eval('.product-stock span', el => el.textContent.trim()).catch(() => 'Unknown');
        description = await page.$eval('.block-content p', el => el.textContent.trim()).catch(() => null);
      }
      else if (domain.includes('robocraze.com')) {
        title = await page.$eval('.product_title .h1 h2', el => el.textContent.trim()).catch(() => null);
        price = await page.$eval('.price-item', el => el.textContent.trim()).catch(() => null);
        availability = 'Unknown';
        description = await page.$eval('.product__description p', el => el.textContent.trim()).catch(() => null);
      }
      else if (domain.includes('flipkart.com')) {
        title = await page.$eval('.css-1qaijid', el => el.textContent.trim()).catch(() => "Sorry We can not get it");
        price = await page.$eval('div._30jeq3._16Jk6d', el => el.textContent.trim()).catch(() => null);
        availability = await page.$eval('div._16FRp0', el => el.textContent.trim()).catch(() => 'In stock');
        description = await page.$eval('div._2hZGFK', el => el.textContent.trim()).catch(() => "Sorry We can not get");
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
          }          return null;
        }).catch(() => null);

        availability = await page.$eval('#availability span', el => el.textContent.trim()).catch(() => 'Unknown');
        description = await page.$eval('#productDescription p, #feature-bullets ul', el => el.textContent.trim()).catch(() => null);
      }






      // Additional fallback for price if needed
      if (!price || price.includes('0.00')) {
        const bodyText = await page.evaluate(() => document.body.innerText);
        const matches = bodyText.match(/₹\s?[\d,]+(\.\d{2})?/g);
        if (matches && matches.length > 0) {
          price = matches.find(p => !p.includes('0.00')) || matches[0];
        }
      }

      results.push({ url, title, price, availability, description });
      console.log(`✅ Scraped: ${url}`);
    } catch (err) {
      console.error(`❌ Error scraping ${url}: ${err.message}`);
    }
    await page.close();
  }

  await browser.close();

  const timestamp = new Date().toISOString().replace(/:/g, '-');
  fs.writeFileSync(`output-${timestamp}.json`, JSON.stringify(results, null, 2));
  console.log(`🗂️  Saved data to output-${timestamp}.json\n`);
}

// Infinite scraping loop
(async () => {
  while (true) {
    console.log(`🔁 New cycle at ${new Date().toLocaleString()}`);
    await scrapeOnce();
    console.log(`⏳ Waiting 5 minutes...\n`);
    
  }
})();