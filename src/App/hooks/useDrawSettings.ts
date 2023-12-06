import { useMemo } from 'react';
import { LS_KEY_CHART_ANNOTATIONS } from '../../pages/Chart/ChartUtils/chartUtils';
import {
    defaultDrawnShapeEditAttributes,
    defaultFibonacciDrawnShapeEditAttributes,
    defaultLineDrawnShapeEditAttributes,
    defaultRectDrawnShapeEditAttributes,
} from '../../pages/Chart/ChartUtils/drawConstants';
import { diffHashSig } from '../../ambient-utils/dataLayer';

export const useDrawSettings = () => {
    function getLineOptions(itemType: string) {
        const storedData = localStorage.getItem(LS_KEY_CHART_ANNOTATIONS);
        if (storedData) {
            const parseStoredData = JSON.parse(storedData);
            if (parseStoredData.defaultSettings) {
                const options = parseStoredData.defaultSettings[itemType];
                return options;
            }
        }
    }
    const brushOptions =
        getLineOptions('Brush') ?? defaultLineDrawnShapeEditAttributes;
    const rayOptions =
        getLineOptions('Ray') ?? defaultLineDrawnShapeEditAttributes;
    const rectOptions =
        getLineOptions('Rect') ?? defaultRectDrawnShapeEditAttributes;
    const fibRetracementOptions =
        getLineOptions('FibRetracement') ??
        defaultFibonacciDrawnShapeEditAttributes;
    const dPRangeOptions =
        getLineOptions('DPRange') ?? defaultDrawnShapeEditAttributes;

    const drawSettings = useMemo(() => {
        return {
            ['Brush']: brushOptions,
            ['Ray']: rayOptions,
            ['Rect']: rectOptions,
            ['FibRetracement']: fibRetracementOptions,
            ['DPRange']: dPRangeOptions,
        };
    }, [
        diffHashSig(brushOptions),
        diffHashSig(rayOptions),
        diffHashSig(rectOptions),
        diffHashSig(fibRetracementOptions),
        diffHashSig(dPRangeOptions),
    ]);

    return drawSettings;
};
