export const MINUTES_BETWEEN_POINTS_CTA_DISMISSALS = 1;

// function to get current dismissals from local storage
export function getCtaDismissalsFromLocalStorage(): {
    ctaId: string;
    unixTimeOfDismissal: number;
}[] {
    const storedData = localStorage.getItem('cta_dismissals');
    if (storedData) {
        return JSON.parse(storedData);
    } else {
        return [];
    }
}

export function saveCtaDismissalToLocalStorage(ctaDismissal: {
    ctaId: string;
}) {
    const parsedData = getCtaDismissalsFromLocalStorage();
    const existingMatchingDismissalIndex = parsedData.findIndex(
        (x) => x.ctaId === ctaDismissal.ctaId,
    );
    if (existingMatchingDismissalIndex > -1) {
        parsedData[existingMatchingDismissalIndex] = {
            ctaId: ctaDismissal.ctaId,
            unixTimeOfDismissal: Math.floor(Date.now() / 1000),
        };

        localStorage.setItem('cta_dismissals', JSON.stringify(parsedData));
    } else {
        parsedData.push({
            ctaId: ctaDismissal.ctaId,
            unixTimeOfDismissal: Math.floor(Date.now() / 1000),
        });

        localStorage.setItem('cta_dismissals', JSON.stringify(parsedData));
    }
}
