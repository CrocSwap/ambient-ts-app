export const drawnShapeDefaultColor = '#7371fc';
export const drawnShapeDefaultBackgroundColor = 'rgba(115, 113, 252, 0.15)';
export const drawnShapeDefaultLineWidth = 1.5;
export const drawnShapeDefaultDash = [0, 0];
export const fibonacciDefaultDash = [6, 6];
export const fibDefaultLevels = [
    { level: 0, active: true, color: '#787b86' },
    { level: 0.236, active: true, color: '#f23645' },
    { level: 0.382, active: true, color: '#ff9800' },
    { level: 0.5, active: true, color: '#4caf50' },
    { level: 0.618, active: true, color: '#089981' },
    { level: 0.786, active: true, color: '#00bcd4' },
    { level: 1, active: true, color: '#787b86' },
    { level: 1.272, active: false, color: '#ff9800' },
    { level: 1.414, active: false, color: '#f23645' },
    { level: 1.618, active: true, color: '#2962ff' },
    { level: 2, active: false, color: '#089981' },
    { level: 2.272, active: false, color: '#ff9800' },
    { level: 2.414, active: false, color: '#4caf50' },
    { level: 2.618, active: true, color: '#f23645' },
    { level: 3, active: false, color: '#00bcd4' },
    { level: 3.272, active: false, color: '#787b86' },
    { level: 3.414, active: false, color: '#2962ff' },
    { level: 3.618, active: true, color: '#9c27b0' },
    { level: 4, active: false, color: '#f23645' },
    { level: 4.236, active: true, color: '#e91e63' },
    { level: 4.272, active: false, color: '#9c27b0' },
    { level: 4.414, active: false, color: '#e91e63' },
    { level: 4.618, active: false, color: '#ff9800' },
    { level: 4.764, active: false, color: '#089981' },
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
