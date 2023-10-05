import { css } from 'styled-components/macro';
import {
    FontSizes,
    FontWeights,
    Fonts,
    backgrounds,
    textColors,
    overflowTypes,
} from './Types';

export const hideScrollbarCss = css`
    &::-webkit-scrollbar {
        display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
`;

export const Blur = css<{ blur: boolean }>`
    pointer-events: none;
    opacity: 0.2;
    filter: blur(2px);
`;

export interface ContainerProps {
    transition?: boolean;
    cursor?: 'pointer' | 'default';
    height?: string;
    width?: string;
    gap?: number;
    fullHeight?: boolean;
    fullWidth?: boolean;
    justifyContent?:
        | 'flex-start'
        | 'flex-end'
        | 'center'
        | 'space-between'
        | 'space-around'
        | 'space-evenly';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
    overflow?: overflowTypes;
    overflowY?: overflowTypes;
    overflowX?: overflowTypes;

    background?: backgrounds;
    color?: textColors;
    rounded?: boolean;
    position?: 'relative' | 'absolute' | 'fixed';
    hideScrollbar?: boolean;
    scrollSnapAlign?: 'start' | 'end' | 'center';
    wrap?: boolean;
    textAlign?: 'left' | 'center' | 'right';
    maxWidth?: string;
    outline?: textColors;
    zIndex?: number;
    minHeight?: string;
    maxHeight?: string;
    overlay?: 'blur';
    grow?: boolean;

    margin?: string;
    padding?: string;
    display?: 'flex' | 'grid';
    // // Flex Props
    flexDirection?: 'row' | 'column';
    // // Grid Props
    numCols?: number;
    numRows?: number;
    customRows?: string;
    customCols?: string;

    // Font Props
    font?: Fonts;
    letterSpacing?: boolean;
    fontSize?: FontSizes;
    fontWeight?: FontWeights;
}

export const ContainerStyles = (props: ContainerProps) => {
    const {
        transition,
        cursor,
        width,
        height,
        fullWidth,
        fullHeight,
        justifyContent,
        alignItems,
        gap,
        overflow,
        overflowX,
        overflowY,
        background,
        color,
        rounded,
        position,
        hideScrollbar,
        scrollSnapAlign,
        wrap,
        textAlign,
        maxWidth,
        outline,
        zIndex,
        minHeight,
        maxHeight,
        overlay,
        grow,
        margin,
        padding,
        // flex props
        flexDirection,
        display,
        // grid props
        numCols,
        numRows,
        customRows,
        customCols,
    } = props;

    let displayStyling = '';
    switch (display) {
        // Adds grid, cols, rows, and gap
        case 'grid':
            displayStyling = `
            display: grid;
            grid-template-columns: ${
                customCols
                    ? customCols
                    : numCols
                    ? `repeat(${numCols}, 1fr)`
                    : 'auto'
            };
            grid-template-rows: ${
                customRows
                    ? customRows
                    : numRows
                    ? `repeat(${numRows}, 1fr)`
                    : 'auto'
            };   
            
            ${gap ? `gap: ${gap};` : 'gap: 4px;'}

             `;
            break;
        case 'flex':
            // Adds flex and flex-direction
            displayStyling = `
            display: flex;
            ${flexDirection ? `flex-direction: ${flexDirection};` : ''}
            `;
            break;
        default:
            // Don't add anything if display isn't spcified
            break;
    }

    let overlayStyles = '';
    overlay === 'blur' && (overlayStyles += Blur);
    return `
        ${width ? `width: ${width};` : ''}
        ${height ? `height: ${height};` : ''}
        ${fullWidth ? 'width: 100%;' : ''}
        ${fullHeight ? 'height: 100%;' : ''}
        ${justifyContent ? `justify-content: ${justifyContent};` : ''}
        ${alignItems ? `align-items: ${alignItems};` : ''}
        ${gap ? `gap: ${gap}px;` : ''}

        ${position ? `position: ${position};` : ''}
        ${hideScrollbar ? hideScrollbarCss : ''}
        ${scrollSnapAlign ? `scroll-snap-align: ${scrollSnapAlign};` : ''}
        ${wrap ? 'flex-wrap: wrap;' : ''}
        ${textAlign ? `text-align: ${textAlign};` : ''}
        ${overflow ? `overflow: ${overflow};` : ''}
        ${overflowX ? `overflow-x: ${overflowX};` : ''}
        ${overflowY ? `overflow-y: ${overflowY};` : ''}
        ${background ? `background: var(--${background});` : ''}
        ${color ? `color: var(--${color});` : ''}
        ${rounded ? 'border-radius: var(--border-radius);' : ''}
        ${maxWidth ? `max-width: ${maxWidth};` : ''}
        ${zIndex ? `z-index: ${zIndex};` : ''}

        ${transition ? 'transition: var(--transition);' : ''}
        ${cursor ? `cursor: ${cursor};` : ''}
        ${outline ? `outline: 1px solid var(--${outline});` : ''}
        ${minHeight ? `min-height: ${minHeight};` : ''}
        ${maxHeight ? `max-height: ${maxHeight};` : ''}
        ${overlayStyles}
        ${grow ? 'flex-grow: 1;' : ''}

        ${padding ? `padding: ${padding};` : ''}
        ${margin ? `margin: ${margin};` : ''}
        ${displayStyling}
        `;
};

export const WrappedContainerStyles = css<ContainerProps>`
    ${(props) => ContainerStyles(props)}
`;
