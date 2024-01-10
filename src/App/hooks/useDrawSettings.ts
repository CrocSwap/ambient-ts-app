import { useMemo } from 'react';
import {
    defaultFibonacciDrawnShapeEditAttributes,
    defaultLineDrawnShapeEditAttributes,
    defaultRectDrawnShapeEditAttributes,
    defaultDpRangeDrawnShapeEditAttributes,
    fibDefaultLevels,
} from '../../pages/Chart/ChartUtils/drawConstants';
import { diffHashSig } from '../../ambient-utils/dataLayer';
import { LS_KEY_CHART_ANNOTATIONS } from '../../pages/Chart/ChartUtils/chartConstants';

export const useDrawSettings = () => {
    function getLineOptions(itemType: string) {
        const storedData = localStorage.getItem(LS_KEY_CHART_ANNOTATIONS);

        if (storedData) {
            const parseStoredData = JSON.parse(storedData);
            if (parseStoredData.defaultSettings) {
                let shouldDefault = false;
                if (parseStoredData.defaultSettings.FibRetracement) {
                    parseStoredData.defaultSettings.FibRetracement.extraData.forEach(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (element: any) => {
                            if (
                                Object.prototype.hasOwnProperty.call(
                                    element,
                                    'color',
                                )
                            ) {
                                shouldDefault = true;
                            }
                        },
                    );

                    parseStoredData.defaultSettings.FibRetracement.extraData =
                        shouldDefault
                            ? structuredClone(fibDefaultLevels)
                            : parseStoredData.defaultSettings.FibRetracement
                                  .extraData;
                }
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
        getLineOptions('DPRange') ?? defaultDpRangeDrawnShapeEditAttributes;

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
