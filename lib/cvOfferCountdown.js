export const CV_OFFER_STAGES = [
  { minutes: 10, label: "10 Minute Offer" },
  { minutes: 8, label: "8 Minute Offer" },
  { minutes: 6, label: "6 Minute Offer" },
  { minutes: 4, label: "4 Minute Offer" },
  { minutes: 2, label: "Last Countdown" },
];

export const CV_OFFER_STORAGE_KEY = "cvBuilderOfferCountdown:session";
export const CV_LAST_POPUP_KEY = "cvBuilderLastCountdownPopupShown:session";

export function getOfferStartedAt() {
  if (typeof window === "undefined") return Date.now();

  let startedAt = Number(window.sessionStorage.getItem(CV_OFFER_STORAGE_KEY));

  if (!startedAt || Number.isNaN(startedAt)) {
    startedAt = Date.now();

    window.sessionStorage.setItem(CV_OFFER_STORAGE_KEY, String(startedAt));
    window.sessionStorage.removeItem(CV_LAST_POPUP_KEY);
  }

  return startedAt;
}

export function getTotalOfferSeconds() {
  return CV_OFFER_STAGES.reduce((total, stage) => {
    return total + stage.minutes * 60;
  }, 0);
}

export function getOfferState(startedAt) {
  const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
  const totalOfferSeconds = getTotalOfferSeconds();

  let passedSeconds = 0;

  for (let index = 0; index < CV_OFFER_STAGES.length; index++) {
    const stage = CV_OFFER_STAGES[index];
    const stageSeconds = stage.minutes * 60;
    const stageEnd = passedSeconds + stageSeconds;

    if (elapsedSeconds < stageEnd) {
      return {
        isActive: true,
        isExpired: false,
        stageIndex: index,
        stageLabel: stage.label,
        stageMinutes: stage.minutes,
        remainingSeconds: stageEnd - elapsedSeconds,
        totalRemainingSeconds: Math.max(totalOfferSeconds - elapsedSeconds, 0),
        isLastStage: index === CV_OFFER_STAGES.length - 1,
      };
    }

    passedSeconds += stageSeconds;
  }

  return {
    isActive: false,
    isExpired: true,
    stageIndex: CV_OFFER_STAGES.length,
    stageLabel: "Offer Expired",
    stageMinutes: 0,
    remainingSeconds: 0,
    totalRemainingSeconds: 0,
    isLastStage: false,
  };
}

export function formatCountdown(seconds) {
  const safeSeconds = Math.max(Number(seconds) || 0, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}