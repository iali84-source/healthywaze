import { useEffect, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";

interface UTMParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
}

function getUTMParams(): UTMParams {
  const params = new URLSearchParams(window.location.search);
  
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmTerm: params.get("utm_term") || undefined,
    utmContent: params.get("utm_content") || undefined,
    gclid: params.get("gclid") || undefined,
    gbraid: params.get("gbraid") || undefined,
    wbraid: params.get("wbraid") || undefined,
    fbclid: params.get("fbclid") || undefined,
  };
}

function getDeviceType(): string {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Other";
}

function getOrCreateVisitorId(): string {
  const key = "hw_visitor_id";
  let visitorId = localStorage.getItem(key);
  
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(key, visitorId);
  }
  
  return visitorId;
}

function storeUTMParams(params: UTMParams): void {
  const key = "hw_utm_params";
  const existing = localStorage.getItem(key);
  
  if (!existing && Object.values(params).some(v => v)) {
    localStorage.setItem(key, JSON.stringify({
      ...params,
      landingPage: window.location.pathname,
      referrer: document.referrer,
      timestamp: Date.now(),
    }));
  }
}

export function getStoredUTMParams(): UTMParams | null {
  const stored = localStorage.getItem("hw_utm_params");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function useMarketingTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const utmParams = getUTMParams();
    storeUTMParams(utmParams);

    const hasTracking = Object.values(utmParams).some(v => v);
    if (!hasTracking) return;

    const visitorId = getOrCreateVisitorId();

    apiRequest("POST", "/api/marketing/session", {
      visitorId,
      ...utmParams,
      landingPage: window.location.pathname,
      referrer: document.referrer || undefined,
      deviceType: getDeviceType(),
      browser: getBrowser(),
    }).catch(err => {
      console.warn("Failed to track marketing session:", err);
    });
  }, []);
}

export function getVisitorId(): string {
  return getOrCreateVisitorId();
}
