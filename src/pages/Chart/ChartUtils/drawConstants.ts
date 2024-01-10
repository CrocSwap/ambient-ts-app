export const drawnShapeDefaultColor = '#7371fc';
export const drawnShapeDefaultBackgroundColor = 'rgba(115, 113, 252, 0.15)';
export const drawnShapeDefaultLineWidth = 2;
export const drawnShapeDefaultDash = [0, 0];
export const fibonacciDefaultDash = [3, 6];

export const fibDefaultLevels = [
    {
        level: 0,
        active: true,
        lineColor: '#787b86',
        areaColor: 'rgba(120, 123, 13, 0.3)',
    },
    {
        level: 0.236,
        active: true,
        lineColor: '#f23645',
        areaColor: 'rgba(242, 54, 69, 0.3)',
    },
    {
        level: 0.382,
        active: true,
        lineColor: '#ff9800',
        areaColor: 'rgba(255, 152, 0, 0.3)',
    },
    {
        level: 0.5,
        active: true,
        lineColor: '#4caf50',
        areaColor: 'rgba(76, 175, 80, 0.3)',
    },
    {
        level: 0.618,
        active: true,
        lineColor: '#089981',
        areaColor: 'rgba(8, 153, 129, 0.3)',
    },
    {
        level: 0.786,
        active: true,
        lineColor: '#00bcd4',
        areaColor: 'rgba(0, 188, 212, 0.3)',
    },
    {
        level: 1,
        active: true,
        lineColor: '#787b86',
        areaColor: 'rgba(120, 123, 134, 0.3)',
    },
    {
        level: 1.272,
        active: false,
        lineColor: '#ff9800',
        areaColor: 'rgba(255, 152, 0, 0.3)',
    },
    {
        level: 1.414,
        active: false,
        lineColor: '#f23645',
        areaColor: 'rgba(242, 54, 69, 0.3)',
    },
    {
        level: 1.618,
        active: true,
        lineColor: '#2962ff',
        areaColor: 'rgba(41, 98, 255, 0.3)',
    },
    {
        level: 2,
        active: false,
        lineColor: '#089981',
        areaColor: 'rgba(8, 153, 129, 0.3)',
    },
    {
        level: 2.272,
        active: false,
        lineColor: '#ff9800',
        areaColor: 'rgba(255, 152, 0, 0.3)',
    },
    {
        level: 2.414,
        active: false,
        lineColor: '#4caf50',
        areaColor: 'rgba(76, 175, 80, 0.3)',
    },
    {
        level: 2.618,
        active: true,
        lineColor: '#f23645',
        areaColor: 'rgba(242, 54, 69, 0.3)',
    },
    {
        level: 3,
        active: false,
        lineColor: '#00bcd4',
        areaColor: 'rgba(0, 188, 212, 0.3)',
    },
    {
        level: 3.272,
        active: false,
        lineColor: '#787b86',
        areaColor: 'rgba(120, 123, 134, 0.3)',
    },
    {
        level: 3.414,
        active: false,
        lineColor: '#2962ff',
        areaColor: 'rgba(41, 98, 255, 0.3)',
    },
    {
        level: 3.618,
        active: true,
        lineColor: '#9c27b0',
        areaColor: 'rgba(156, 39, 176, 0.3)',
    },
    {
        level: 4,
        active: false,
        lineColor: '#f23645',
        areaColor: 'rgba(242, 54, 69, 0.3)',
    },
    {
        level: 4.236,
        active: true,
        lineColor: '#e91e63',
        areaColor: 'rgba(233, 30, 99, 0.3)',
    },
    {
        level: 4.272,
        active: false,
        lineColor: '#9c27b0',
        areaColor: 'rgba(156, 39, 176, 0.3)',
    },
    {
        level: 4.414,
        active: false,
        lineColor: '#e91e63',
        areaColor: 'rgba(233, 30, 99, 0.3)',
    },
    {
        level: 4.618,
        active: false,
        lineColor: '#ff9800',
        areaColor: 'rgba(255, 152, 0, 0.3)',
    },
    {
        level: 4.764,
        active: false,
        lineColor: '#089981',
        areaColor: 'rgba(8, 153, 129, 0.3)',
    },
];

export const defaultShapeAttributes = {
    color: drawnShapeDefaultColor,
    lineWidth: drawnShapeDefaultLineWidth,
    dash: drawnShapeDefaultDash,
};

export const defaultShapeBackgroundAttributes = {
    color: drawnShapeDefaultBackgroundColor,
    lineWidth: drawnShapeDefaultLineWidth,
    dash: drawnShapeDefaultDash,
};

export const defaultFibonacciShapeAttributes = {
    color: drawnShapeDefaultColor,
    lineWidth: drawnShapeDefaultLineWidth,
    dash: fibonacciDefaultDash,
};

export const defaultLineDrawnShapeEditAttributes = {
    line: { active: true, ...defaultShapeAttributes },
    border: { active: false, ...defaultShapeAttributes },
    background: { active: false, ...defaultShapeBackgroundAttributes },
};

export const defaultFibonacciDrawnShapeEditAttributes = {
    line: { active: true, ...defaultFibonacciShapeAttributes },
    border: { active: false, ...defaultShapeAttributes },
    background: { active: false, ...defaultShapeBackgroundAttributes },
    extraData: fibDefaultLevels,
    extendLeft: false,
    extendRight: false,
    labelPlacement: 'Left',
    labelAlignment: 'Middle',
    reverse: false,
};

export const defaultRectDrawnShapeEditAttributes = {
    line: { active: false, ...defaultShapeAttributes },
    border: { active: true, ...defaultShapeAttributes },
    background: { active: true, ...defaultShapeBackgroundAttributes },
};

export const defaultDpRangeDrawnShapeEditAttributes = {
    line: { active: true, ...defaultShapeAttributes },
    border: { active: false, ...defaultShapeAttributes },
    background: { active: true, ...defaultShapeBackgroundAttributes },
};

export const defaultDrawnShapeEditAttributes = {
    border: { active: true, ...defaultShapeAttributes },
    background: { active: true, ...defaultShapeBackgroundAttributes },
    line: { active: false, ...defaultShapeAttributes },
};
