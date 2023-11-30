export const drawnShapeDefaultColor = '#7371fc';
export const drawnShapeDefaultBackgroundColor = 'rgba(115, 113, 252, 0.15)';
export const drawnShapeDefaultLineWidth = 1.5;
export const drawnShapeDefaultDash = [0, 0];
export const fibonacciDefaultDash = [6, 6];

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
