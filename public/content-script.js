// Content script for slot scanning
(function() {
  function scrapeCalendlySlots() {
    // Calendly: look for slot times in the DOM
    const slotNodes = document.querySelectorAll('[data-testid="slot-time"], .calendly-slot, .calendly-time');
    const slots = [];
    slotNodes.forEach(node => {
      const text = node.textContent?.trim();
      if (text && /\d{1,2}:\d{2}\s?(AM|PM)/i.test(text)) {
        slots.push(text);
      }
    });
    return slots;
  }

  function scrapeHubSpotSlots() {
    // HubSpot: look for time options in the DOM
    const slotNodes = document.querySelectorAll('.meetings-timeslot-time, .hs-meetings-slot-time');
    const slots = [];
    slotNodes.forEach(node => {
      const text = node.textContent?.trim();
      if (text && /\d{1,2}:\d{2}\s?(AM|PM)/i.test(text)) {
        slots.push(text);
      }
    });
    return slots;
  }

  function detectPlatform() {
    if (document.querySelector('.calendly-slot, [data-testid="slot-time"]')) return 'calendly';
    if (document.querySelector('.meetings-timeslot-time, .hs-meetings-slot-time')) return 'hubspot';
    return 'unknown';
  }

  function scrapeSlots() {
    const platform = detectPlatform();
    let slots = [];
    if (platform === 'calendly') slots = scrapeCalendlySlots();
    else if (platform === 'hubspot') slots = scrapeHubSpotSlots();
    window.postMessage({ type: 'SLOT_SCOUT_RESULTS', slots, platform }, '*');
  }

  // Run on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', scrapeSlots);
  // Also run after 2s in case slots load late
  setTimeout(scrapeSlots, 2000);
})();
