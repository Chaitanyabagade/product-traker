const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
puppeteer.use(StealthPlugin());

const urls = [
'https://robu.in/product/esp32-38pin-development-board-wifibluetooth-ultra-low-power-consumption-dual-core/?gad_source=1&gad_campaignid=21296336107&gbraid=0AAAAADvLFWcId0kcQoZ5G7yTCBwZ-AM90&gclid=Cj0KCQjwjJrCBhCXARIsAI5x66U1eq0zXoBuqR-co1CUKicJ99hmuI2GFzNnviJqzo5MPWjCkMnDRdMaAsNsEALw_wcB',
'https://www.flyrobo.in/mpu6500-gy-6500-6dof-6-axis-accelerometer-gyro-sensor?tracking=ads&tracking=4a9a9a&gad_source=1&gad_campaignid=17426303996&gbraid=0AAAAAC6AkE_J-IhY8AoMDrZILBUTjtfBR&gclid=CjwKCAjwr5_CBhBlEiwAzfwYuLAqf5BRnpkEM8rPTbI8TnrfUuYeFlODy5XXEn4wTt96R1J-pac_-hoCsGMQAvD_BwE',
'https://robocraze.com/products/mpu-6050-triple-axis-accelerometer-gyroscope-module?variant=40192322011289&country=IN&currency=INR&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic&campaignid=21596928874&adgroupid=&keyword=&device=c&gad_source=1&gad_campaignid=21596930350&gbraid=0AAAAADgHQvbeFfDunjoM48YseNJqX44sP&gclid=CjwKCAjwr5_CBhBlEiwAzfwYuGYa44DsoukyWZraCxQJ9xQL53WC6ryBnNp91kCV9-qW9oJ9kOc7jBoChNEQAvD_BwE',
'https://www.flipkart.com/ihc-a2212-1000kv-brushless-motor-drone-electronic-components-hobby-kit/p/itm2cc70ab2faa8f?pid=EHKGF58RSMNRF8HW&lid=LSTEHKGF58RSMNRF8HWHFAFX9&marketplace=FLIPKART&cmpid=content_electronic-hobby-kit_22431562759_x_8965229628_gmc_pla&tgi=sem,1,G,11214002,x,,,,,,,c,,,,,,,&entryMethod=22431562759&&cmpid=content_22431562759_gmc_pla&gad_source=1&gad_campaignid=22428048374&gbraid=0AAAAADxRY5-SECYYUT4N_XqqtLoQ-Fxtr&gclid=CjwKCAjwr5_CBhBlEiwAzfwYuFAz8A1FdcTowK_uuV3lPVFn-cUciI6CH3eQu_T-TnVCpHXAuJZg4hoCCqcQAvD_BwE',
'https://www.amazon.in/A2212-1000-Brushless-Motor-Drone/dp/B0CBQ2R895/ref=asc_df_B0CBQ2R895?mcid=05a1b4f75731384886023ddfed8e0fa9&tag=googleshopdes-21&linkCode=df0&hvadid=709963085501&hvpos=&hvnetw=g&hvrand=2764878810804600553&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9302378&hvtargid=pla-2358746805554&psc=1&gad_source=1'];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeOnce() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const results = [];

  for (const url of urls) {
    const page = await browser.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      await delay(10000);

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
