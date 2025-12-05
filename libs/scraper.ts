import { PlatformType } from "@/types/types";
import puppeteer, { Browser, Page } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export type ScraperResult = {
  followerCount: number;
  handle: string;
  avatarUrl: string;
};

/**
 * Main scraper function that routes to platform-specific scrapers
 */
export async function scrapeProfile(
  platform: PlatformType,
  url: string
): Promise<ScraperResult> {
  let browser: Browser | null = null;
  
  try {
    // Check if we're in a serverless environment (Vercel)
    const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (isServerless) {
      // For serverless environments (Vercel, AWS Lambda)
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      // For local development
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      });
    }

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`[Scraper] Starting scrape for ${platform}: ${url}`);
    let result: ScraperResult;

    switch (platform) {
      case PlatformType.YOUTUBE:
        result = await scrapeYouTube(page, url);
        break;
      case PlatformType.TWITTER:
        result = await scrapeTwitter(page, url);
        break;
      case PlatformType.INSTAGRAM:
        result = await scrapeInstagram(page, url);
        break;
      case PlatformType.TWITCH:
        result = await scrapeTwitch(page, url);
        break;
      case PlatformType.TIKTOK:
        result = await scrapeTikTok(page, url);
        break;
      case PlatformType.LINKEDIN:
        result = await scrapeLinkedIn(page, url);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    console.log(`[Scraper] Result for ${platform}:`, result);
    await browser.close();
    return result;
  } catch (error) {
    console.error(`[Scraper] Error scraping ${platform}:`, error);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

/**
 * YouTube scraper
 */
async function scrapeYouTube(page: Page, url: string): Promise<ScraperResult> {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

  // Handle cookie consent if it appears
  try {
    await page.waitForSelector('button', { timeout: 3000 }).then(async () => {
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent);
        if (text && (text.includes('Accept') || text.includes('Accepter') || text.includes('Reject'))) {
          console.log("[YouTube] Clicking cookie consent button");
          await button.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          break;
        }
      }
    }).catch(() => {
      console.log("[YouTube] No cookie consent found");
    });
  } catch {
    console.log("[YouTube] No cookie consent found or couldn't click it");
  }

  await new Promise(resolve => setTimeout(resolve, 4000)); // Wait longer for dynamic content

  // Extract subscriber count
  const subscriberData = await page.evaluate(() => {
    let subscriberCount = "0";
    let foundBy = "";

    // Method 1: Look for yt-content-metadata-view-model (new YouTube layout)
    const metadataRows = document.querySelectorAll(
      ".yt-content-metadata-view-model__metadata-row"
    );

    for (const row of metadataRows) {
      const text = row.textContent?.trim() || "";

      // Match patterns in any language: "5 subscribers", "5 abonnenter", "2 abonnenter", etc.
      const match = text.match(/^(\d+(?:[.,]\d+)?[KMB]?)\s+\w+/i);
      if (match) {
        subscriberCount = match[1];
        foundBy = "metadata-row";
        return { subscriberCount, foundBy };
      }
    }

    // Method 2: Try specific YouTube selectors
    const selectors = [
      "#subscriber-count",
      "yt-formatted-string#subscriber-count",
      '[id="subscriber-count"]',
      "#channel-header-container yt-formatted-string",
      "ytd-c4-tabbed-header-renderer #subscriber-count",
      ".yt-content-metadata-view-model__metadata-text",
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element?.textContent?.trim() || "";

        // Look for patterns like "1.2K subscribers" or just "1.2K" or "5 abonnenter"
        if (text && text.match(/^\d+(?:[.,]\d+)?[KMB]?/i)) {
          subscriberCount = text;
          foundBy = `selector: ${selector}`;
          return { subscriberCount, foundBy };
        }
      }
    }

    // Method 3: Search all spans for subscriber-like text (multi-language)
    const allSpans = document.querySelectorAll("span");

    for (const span of allSpans) {
      const text = span.textContent?.trim() || "";
      // Match patterns: "5 subscribers", "5 abonnenter", "2 abonnenter", "5K subscribers", etc.
      // Looks for: number followed by space and word
      const match = text.match(
        /^(\d+(?:[.,]\d+)?[KMB]?)\s+[a-zA-ZæøåÆØÅäöüßéèêëñ]+$/i
      );
      if (match && text.length < 30) {
        // Reasonable length for subscriber count
        subscriberCount = match[1];
        foundBy = "span search";
        return { subscriberCount, foundBy };
      }
    }

    // Method 4: Search entire page text with multi-language patterns
    const pageText = document.body.innerText;
    const patterns = [
      // English
      /(\d+(?:[.,]\d+)?[KMB]?)\s+subscribers?/i,
      /subscribers?\s*[•·]\s*(\d+(?:[.,]\d+)?[KMB]?)/i,
      /(\d+(?:[.,]\d+)?[KMB]?)\s*subs/i,
      // Danish
      /(\d+(?:[.,]\d+)?[KMB]?)\s+abonnenter?/i,
      // German
      /(\d+(?:[.,]\d+)?[KMB]?)\s+abonnenten?/i,
      // French
      /(\d+(?:[.,]\d+)?[KMB]?)\s+abonnés?/i,
      // Spanish
      /(\d+(?:[.,]\d+)?[KMB]?)\s+suscriptores?/i,
      // Portuguese
      /(\d+(?:[.,]\d+)?[KMB]?)\s+inscritos?/i,
    ];

    for (const pattern of patterns) {
      const match = pageText.match(pattern);
      if (match) {
        subscriberCount = match[1] || match[0];
        foundBy = `pattern: ${pattern}`;
        return { subscriberCount, foundBy };
      }
    }

    return { subscriberCount, foundBy: foundBy || "not found" };
  });

  // Extract handle/username
  const handle = await page.evaluate(() => {
    // Try channel handle - look for @username pattern
    const handleSelectors = [
      "ytd-channel-tagline-renderer yt-formatted-string",
      "#channel-handle",
      ".channel-handle",
      '[class*="channel-handle"]',
      ".yt-content-metadata-view-model__metadata-text",
    ];

    for (const selector of handleSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element?.textContent?.trim() || "";
        if (text.startsWith("@")) {
          return text;
        }
      }
    }

    // Search all text for @username pattern
    const pageText = document.body.innerText;
    const match = pageText.match(/@[\w]+/);
    if (match) {
      return match[0];
    }

    // Get from page title
    const title = document.title;
    return title.replace(" - YouTube", "").trim();
  });

  // Extract avatar
  const avatarUrl = await page.evaluate(() => {
    const imgSelectors = [
      "img#avatar",
      "ytd-c4-tabbed-header-renderer img",
      "#channel-header img",
      "yt-img-shadow img",
      '[class*="avatar"] img',
      'img[style*="border-radius"]',
      ".yt-spec-avatar-shape__image",
      "yt-avatar-shape img",
    ];

    for (const selector of imgSelectors) {
      const imgs = document.querySelectorAll(selector);
      for (const img of imgs) {
        const src = img?.getAttribute("src");
        if (
          src &&
          src.startsWith("http") &&
          !src.includes("404") &&
          src.includes("googleusercontent")
        ) {
          return src;
        }
      }
    }

    return "";
  });

  return {
    followerCount: parseFollowerCount(subscriberData.subscriberCount),
    handle: handle || extractHandleFromUrl(url),
    avatarUrl: avatarUrl || "",
  };
}

/**
 * Twitter/X scraper
 */
async function scrapeTwitter(page: Page, url: string): Promise<ScraperResult> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 3000));

  const data = await page.evaluate(() => {
    // Twitter shows followers in a link with specific structure
    const followersLink = Array.from(
      document.querySelectorAll('a[href*="/verified_followers"]')
    ).find((el) => el.textContent?.includes("Followers"));

    const followersText =
      followersLink?.querySelector("span")?.textContent || "0";

    // Get handle from URL or profile
    const handleElement = document.querySelector(
      '[data-testid="UserName"] span'
    );
    const handle = handleElement?.textContent || "";

    // Get avatar
    const avatar = document.querySelector('img[alt*="profile"]');
    const avatarUrl = avatar?.getAttribute("src") || "";

    return {
      followers: followersText,
      handle,
      avatarUrl,
    };
  });

  return {
    followerCount: parseFollowerCount(data.followers),
    handle: data.handle || extractHandleFromUrl(url),
    avatarUrl: data.avatarUrl,
  };
}

/**
 * Instagram scraper
 */
async function scrapeInstagram(
  page: Page,
  url: string
): Promise<ScraperResult> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 3000));

  const data = await page.evaluate(() => {
    // Instagram shows followers in meta tags
    const metaDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    const content = metaDescription?.getAttribute("content") || "";

    // Format: "123K Followers, 456 Following, 789 Posts"
    const followersMatch = content.match(/([\d,\.]+[KMB]?)\s+Followers/i);
    const followers = followersMatch ? followersMatch[1] : "0";

    // Get username
    const titleMeta = document.querySelector('meta[property="og:title"]');
    const title = titleMeta?.getAttribute("content") || "";
    const usernameMatch = title.match(/@([\w\.]+)/);
    const username = usernameMatch ? usernameMatch[1] : "";

    // Get avatar
    const avatarMeta = document.querySelector('meta[property="og:image"]');
    const avatar = avatarMeta?.getAttribute("content") || "";

    return {
      followers,
      username,
      avatar,
    };
  });

  return {
    followerCount: parseFollowerCount(data.followers),
    handle: data.username || extractHandleFromUrl(url),
    avatarUrl: data.avatar,
  };
}

/**
 * Twitch scraper
 */
async function scrapeTwitch(page: Page, url: string): Promise<ScraperResult> {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 3000));

  const data = await page.evaluate(() => {
    // Twitch 2024+ selectors
    const followerSelectors = [
      '[data-a-target="followers-count"]',
      'p[data-a-target="followers-count"]',
      '[class*="followers"]',
    ];

    let followers = "0";
    for (const selector of followerSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent) {
        followers = element.textContent.trim();
        console.log(`Found followers with selector ${selector}:`, followers);
        break;
      }
    }

    // Fallback: search page text for follower count
    if (followers === "0") {
      const pageText = document.body.innerText;
      const match = pageText.match(/([\d,]+)\s+[Ff]ollowers?/);
      if (match) {
        followers = match[1];
        console.log("Found via text search:", match[0]);
      }
    }

    // Get username from title or URL
    const title = document.title;
    const username = title.split(" - ")[0] || "";

    // Get avatar from the channel header section
    // Look for the avatar in the channel-info-content area specifically
    let avatarUrl = "";

    // First, try to find the avatar container with aria-label
    const avatarContainer = document.querySelector('[aria-label*="avatar"]');
    if (avatarContainer) {
      const img = avatarContainer.querySelector("img.tw-image-avatar");
      if (img) {
        const src = img.getAttribute("src");
        if (src && src.startsWith("http")) {
          avatarUrl = src;
          console.log("Found avatar in channel header:", src);
        }
      }
    }

    // Fallback: try to find img with alt matching the username
    if (!avatarUrl && username) {
      const avatarImg = document.querySelector(`img[alt="${username}"]`);
      if (avatarImg) {
        const src = avatarImg.getAttribute("src");
        if (
          src &&
          src.startsWith("http") &&
          src.includes("jtv_user_pictures")
        ) {
          avatarUrl = src;
          console.log("Found avatar by username alt:", src);
        }
      }
    }

    // Last resort: find any tw-avatar img in the home-header-sticky section
    if (!avatarUrl) {
      const headerSticky = document.querySelector('[class*="home-header"]');
      if (headerSticky) {
        const img = headerSticky.querySelector(".tw-avatar img");
        if (img) {
          const src = img.getAttribute("src");
          if (
            src &&
            src.startsWith("http") &&
            src.includes("jtv_user_pictures")
          ) {
            avatarUrl = src;
            console.log("Found avatar in header sticky:", src);
          }
        }
      }
    }

    return {
      followers,
      username,
      avatarUrl,
    };
  });

  return {
    followerCount: parseFollowerCount(data.followers),
    handle: data.username || extractHandleFromUrl(url),
    avatarUrl: data.avatarUrl,
  };
}

/**
 * TikTok scraper
 */
async function scrapeTikTok(page: Page, url: string): Promise<ScraperResult> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 3000));

  const data = await page.evaluate(() => {
    // TikTok shows follower count in specific elements
    const followersElement = document.querySelector(
      '[data-e2e="followers-count"]'
    );
    const followers = followersElement?.textContent?.trim() || "0";

    // Get username
    const usernameElement = document.querySelector('[data-e2e="user-title"]');
    const username = usernameElement?.textContent?.trim() || "";

    // Get avatar - find the img element inside the user-avatar container
    let avatarUrl = "";
    const avatarContainer = document.querySelector('[data-e2e="user-avatar"]');
    if (avatarContainer) {
      const img = avatarContainer.querySelector("img");
      if (img) {
        const src = img.getAttribute("src");
        if (src && src.startsWith("http")) {
          avatarUrl = src;
          console.log("Found TikTok avatar:", src);
        }
      }
    }

    return {
      followers,
      username,
      avatarUrl,
    };
  });

  return {
    followerCount: parseFollowerCount(data.followers),
    handle: data.username || extractHandleFromUrl(url),
    avatarUrl: data.avatarUrl,
  };
}

/**
 * LinkedIn scraper
 * Note: LinkedIn heavily restricts scraping and requires login for most data
 */
async function scrapeLinkedIn(page: Page, url: string): Promise<ScraperResult> {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 4000));

  const data = await page.evaluate(() => {
    // Try to get connection/follower count from multiple places
    let followers = "0";

    // Try various selectors for LinkedIn's public profile
    const followerSelectors = [
      '[class*="follower"]',
      '[class*="connection"]',
      "span.t-bold",
      ".pv-recent-activity-section__follower-count",
    ];

    for (const selector of followerSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const text = el.textContent?.trim() || "";
        // Look for numbers followed by "follower" or "connection"
        const match = text.match(/([\d,]+)\s*(follower|connection)/i);
        if (match) {
          followers = match[1];
          console.log("Found LinkedIn followers:", match[0]);
        }
      });
      if (followers !== "0") break;
    }

    // Fallback: search entire page text
    if (followers === "0") {
      const pageText = document.body.innerText;
      const match = pageText.match(/([\d,]+)\s*(followers?|connections?)/i);
      if (match) {
        followers = match[1];
        console.log("Found via text search:", match[0]);
      }
    }

    // Get name from title or page
    const titleEl = document.querySelector("title");
    const title = titleEl?.textContent || "";
    const name = title.split("|")[0].trim() || title.split("-")[0].trim();

    // Get avatar from meta or profile image
    let avatar = "";
    const avatarMeta = document.querySelector('meta[property="og:image"]');
    avatar = avatarMeta?.getAttribute("content") || "";

    if (!avatar) {
      const profileImg = document.querySelector('img[class*="profile"]');
      avatar = profileImg?.getAttribute("src") || "";
    }

    return {
      followers,
      title: name,
      avatar,
    };
  });

  return {
    followerCount: parseFollowerCount(data.followers),
    handle: data.title || extractHandleFromUrl(url),
    avatarUrl: data.avatar,
  };
}

/**
 * Parse follower count string to number
 * Handles formats like: "1.5M", "10K", "1,234", "1234", "1.2K subscribers"
 */
function parseFollowerCount(countStr: string): number {
  if (!countStr) return 0;

  console.log("[Parser] Input:", countStr);

  // Extract just the number part if it contains "subscribers" or other words
  let numberPart = countStr;
  const match = countStr.match(/([\d.,]+[KMB]?)/i);
  if (match) {
    numberPart = match[1];
  }

  // Remove non-numeric characters except K, M, B, decimal point, and comma
  const cleaned = numberPart.replace(/[^\d.,KMB]/gi, "").toUpperCase();

  console.log("[Parser] Cleaned:", cleaned);

  // Handle K, M, B suffixes (case insensitive)
  if (cleaned.includes("K")) {
    const num = parseFloat(cleaned.replace("K", "").replace(/,/g, ""));
    const result = Math.round(num * 1000);
    console.log("[Parser] Result (K):", result);
    return result;
  }
  if (cleaned.includes("M")) {
    const num = parseFloat(cleaned.replace("M", "").replace(/,/g, ""));
    const result = Math.round(num * 1000000);
    console.log("[Parser] Result (M):", result);
    return result;
  }
  if (cleaned.includes("B")) {
    const num = parseFloat(cleaned.replace("B", "").replace(/,/g, ""));
    const result = Math.round(num * 1000000000);
    console.log("[Parser] Result (B):", result);
    return result;
  }

  // Remove commas and parse as regular number
  const result = parseInt(cleaned.replace(/,/g, "").replace(/\./g, "")) || 0;
  console.log("[Parser] Result (plain):", result);
  return result;
}

/**
 * Extract username/handle from URL
 */
function extractHandleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Remove leading/trailing slashes and @ symbols
    const parts = pathname.split("/").filter(Boolean);
    const handle = parts[0]?.replace("@", "") || "";

    return handle;
  } catch {
    return "";
  }
}
