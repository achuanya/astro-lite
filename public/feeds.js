import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

function createFeedCardHTML(item, siteTimezone, fallbackOgImageGlobal) {
  let displayDate = "";
  let displayTime = "";
  let isoTimestamp = "";

  if (item.published && typeof item.published === 'string') {
    const parts = item.published.split(" | ");
    displayDate = parts[0]; // e.g., "26 May, 2025"
    if (parts.length > 1) {
      displayTime = parts[1]; // e.g., "01:20 PM"
    }

    // Construct a string that dayjs is likely to parse for the ISO timestamp
    // Example: "26 May 2025 01:20 PM" (remove comma from date part for better parsing)
    let parsableString = displayDate.replace(/,/g, ''); // "26 May 2025"
    if (displayTime) {
      parsableString += ` ${displayTime}`; // "26 May 2025 01:20 PM"
    }
    
    try {
      // @ts-ignore
      const parsed = dayjs(parsableString, ["D MMM YYYY hh:mm A", "D MMM YYYY h:mm A", "D MMM YYYY"], true); // Added true for strict parsing
      if (parsed.isValid()) {
        // @ts-ignore
        isoTimestamp = parsed.tz(siteTimezone || 'UTC').toISOString();
      } else {
        // Fallback for isoTimestamp if strict parsing fails
        // Try parsing without format string, relying on dayjs's flexibility
        // @ts-ignore
        const lessStrictParse = dayjs(item.published.replace(" | ", " "));
        if(lessStrictParse.isValid()){
          // @ts-ignore
          isoTimestamp = lessStrictParse.tz(siteTimezone || "UTC").toISOString();
        } else {
          console.warn("Failed to parse date for ISO timestamp:", item.published);
        }
      }
    } catch (e) {
      console.warn("Exception during date parsing for ISO timestamp:", item.published, e);
    }
  } else {
    displayDate = "Date not available";
  }

  const defaultImageClass = "w-[50px] h-[50px] object-cover rounded-md shrink-0 group-hover:opacity-90 transition-opacity duration-300";

  let imgSrc = item.avatar || '';
  if ((!imgSrc || imgSrc.trim() === "") && fallbackOgImageGlobal) {
    imgSrc = fallbackOgImageGlobal;
  }
  
  const onerrorHandler = fallbackOgImageGlobal ? `this.onerror=null; this.src='${fallbackOgImageGlobal}';` : '';

  const blogName = typeof item.blog_name === 'string' ? item.blog_name.trim() : '';
  const blogNameDisplay = blogName ? blogName : '';

  return `
    <li class="mb-4">
      <div class="relative block pr-12">
        <div class="flex items-center gap-3">
          ${imgSrc ? `
            <img
              src="${imgSrc}"
              alt="${item.title}"
              class="${defaultImageClass}"
              loading="lazy"
              onerror="${onerrorHandler}"
            />
          ` : ''}
          <div class="min-w-0 flex-1 ">
            <div class="text-lg font-medium text-accent underline-offset-4 min-w-0">
              <h3 class="text-base font-medium truncate overflow-hidden whitespace-nowrap min-w-0">
                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="hover:underline">${item.title}</a>
              </h3>
            </div>
            <div class="mt-1 flex items-center gap-x-2 opacity-80 text-xs whitespace-nowrap">
              <span class="sr-only">Published:</span>
              <time class="opacity-80" datetime="${isoTimestamp}">
                ${displayDate}
              </time>
              ${blogName ? `
                <span class="truncate min-w-0 flex-1 opacity-80 text-xs font-normal">${blogNameDisplay}</span>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    </li>
  `;
}

export async function initFeeds(siteTimezone, fallbackOgImageGlobal, initialItemCount, itemsPerPage, dataSourceUrl) {
  const feedsListElement = document.getElementById('feeds-list');
  const loadMoreTrigger = document.getElementById('load-more-trigger');
  const loadingContainer = document.getElementById('feeds-loading');
  const errorContainer = document.getElementById('feeds-error');
  const noContentContainer = document.getElementById('feeds-no-content');

  if (!feedsListElement || !loadingContainer || !errorContainer || !noContentContainer) {
    console.error("Required DOM elements for feeds are missing.");
    return;
  }

  let allFeeds = [];
  let currentIndex = 0; // Start with 0 as initial items will also be loaded by loadMoreItems
  let observer;

  async function fetchFeeds() {
    try {
      const response = await fetch(dataSourceUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      allFeeds = data.items || []; // Ensure allFeeds is an array
      loadingContainer.classList.add('hidden');

      if (allFeeds.length === 0) {
        noContentContainer.classList.remove('hidden');
        if (loadMoreTrigger) loadMoreTrigger.style.display = 'none';
        return;
      }
      
      // Initial load of items
      loadMoreItems(initialItemCount); 

      // Setup Intersection Observer if there are more items than initially shown
      if (loadMoreTrigger && allFeeds.length > initialItemCount) {
        loadMoreTrigger.style.display = 'block'; // Show trigger if more items exist
        observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            loadMoreItems(itemsPerPage);
          }
        }, { threshold: 0.1 });
        observer.observe(loadMoreTrigger);
      } else if (loadMoreTrigger) {
        loadMoreTrigger.style.display = 'none';
      }

    } catch (e) {
      console.error("Failed to fetch feeds:", e);
      loadingContainer.classList.add('hidden');
      errorContainer.classList.remove('hidden');
      if (loadMoreTrigger) loadMoreTrigger.style.display = 'none';
    }
  }

  function loadMoreItems(count) {
    if (!feedsListElement) {
        return;
    }
    const itemsToLoad = allFeeds.slice(currentIndex, currentIndex + count);

    if (itemsToLoad.length === 0) {
      if (loadMoreTrigger) loadMoreTrigger.style.display = 'none'; 
      if (observer) {
        observer.disconnect();
      }
      // If it's the initial load and no items, noContentContainer would have been shown by fetchFeeds
      return;
    }

    let newItemsHTML = '';
    itemsToLoad.forEach(item => {
      newItemsHTML += createFeedCardHTML(item, siteTimezone, fallbackOgImageGlobal);
    });
    feedsListElement.insertAdjacentHTML('beforeend', newItemsHTML);
    currentIndex += itemsToLoad.length;

    if (currentIndex >= allFeeds.length) {
        if (loadMoreTrigger) loadMoreTrigger.style.display = 'none';
        if(observer) {
            observer.disconnect();
        }
    }
  }

  await fetchFeeds();
}
