export { SessionProvider, useSession, continueAsGuest } from "./SessionProvider";
export {
  decidePostSplashRoute,
  hrefForDestination,
  type AppDestination,
  type RouteDecisionInput,
} from "./routing";
export {
  sendMagicLink,
  continueAsGuest as enterGuestMode,
  markWelcomeSeen,
  markChartComputed,
  markWelcomePaywallSkipped,
  signOut,
  getAuthCallbackUrl,
  devBypassAsGuest,
  appleAuthAvailable,
  googleAuthAvailable,
  sessionUserFromSupabase,
} from "./auth";
export {
  loadLocalSessionFlags,
  setBoolMeta,
  getBoolMeta,
  clearLocalSessionFlags,
} from "./local-db";
export {
  saveChartPayload,
  loadChartPayload,
  clearChartPayload,
} from "./chart-db";
