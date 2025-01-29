import styled, { css } from 'styled-components';

import { AnimationProps, Animations } from './Animations';
import { Breakpoint, BreakpointProps } from './Breakpoints';
import {
    AlignItems,
    BoxShadows,
    Displays,
    FontSizes,
    FontWeights,
    Fonts,
    JustifyContent,
    Position,
    TextAlign,
    backgrounds,
    overflowTypes,
    scrollSnapAlign,
    textColors,
} from './Types';

export const hideScrollbarCss = css`
    &::-webkit-scrollbar {
        display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
`;

export interface ContainerProps {
    transition?: boolean;
    cursor?: 'pointer' | 'default';
    height?: string;
    width?: string;
    gap?: number;
    fullHeight?: boolean;
    fullWidth?: boolean;
    justifyContent?: JustifyContent;
    alignItems?: AlignItems;
    overflow?: overflowTypes;
    overflowY?: overflowTypes;
    overflowX?: overflowTypes;
    background?: backgrounds;
    color?: textColors;
    rounded?: boolean;
    position?: Position;
    hideScrollbar?: boolean;
    scrollSnapAlign?: scrollSnapAlign;
    wrap?: boolean;
    textAlign?: TextAlign;
    maxWidth?: string;
    outline?: textColors;
    zIndex?: number;
    minHeight?: string;
    maxHeight?: string;
    overlay?: 'blur' | null | undefined | boolean;
    margin?: string;
    marginLeft?: string;
    padding?: string;
    display?: Displays;
    colSpan?: string;
    rowSpan?: string;
    boxShadow?: BoxShadows;

    // Flex Props
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    grow?: boolean;

    // Grid Props
    numCols?: number;
    numRows?: number;
    customRows?: string;
    customCols?: string;
    // Font Props
    font?: Fonts;
    letterSpacing?: boolean;
    fontSize?: FontSizes;
    fontWeight?: FontWeights;
    backgroundColor?: string;
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
        backgroundColor,
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
        marginLeft,
        boxShadow,
        padding,
        colSpan,
        rowSpan,
        // flex props
        flexDirection,
        display,
        // grid props
        numCols,
        numRows,
        customRows,
        customCols,
        // font props
        font,
        fontSize,
        letterSpacing,
        fontWeight,
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
            ${grow ? 'flex-grow: 1;' : ''}

            `;
            break;
        default:
            // Don't add anything if display isn't spcified
            break;
    }

    let overlayStyles = '';
    switch (overlay) {
        case 'blur':
            overlayStyles = `
            pointer-events: none;
            opacity: 0.2;
            filter: blur(2px);
            `;
            break;
        default:
            break;
    }

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
        ${backgroundColor ? `background-color: ${backgroundColor};` : ''}
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
        ${padding ? `padding: ${padding};` : ''}
        ${margin ? `margin: ${margin};` : ''}
        ${marginLeft ? `margin-left: ${marginLeft};` : ''}
        ${boxShadow ? `box-shadow: var(--${boxShadow}-box-shadow);` : ''}
        ${displayStyling}
        ${font ? `font-family: var(--${font});` : ''}
        ${letterSpacing ? 'letter-spacing: -0.02em;' : ''}
        ${
            fontSize
                ? `
            font-size: var(--${fontSize}-size);
            line-height: var(--${fontSize}-lh);
            `
                : ''
        }
        ${fontWeight ? `font-weight: ${fontWeight};` : ''}
        ${colSpan ? `grid-column: span ${colSpan};` : ''}
        ${rowSpan ? `grid-row: span ${rowSpan};` : ''}
        `;
};

export const WrappedContainerStyles = css<ContainerProps>`
    ${(props) => ContainerStyles(props)}
`;

export type StyledContainerProps = ContainerProps &
    BreakpointProps &
    AnimationProps;

export const FlexContainer = styled.div<StyledContainerProps>`
    ${(props) => ContainerStyles({ ...props, ...{ display: 'flex' } })}
    ${(props) => Breakpoint({ ...props, ...{ display: 'flex' } })}
    ${Animations}
`;

export const GridContainer = styled.div<StyledContainerProps>`
    ${(props) => ContainerStyles({ ...props, ...{ display: 'grid' } })}
    ${(props) => Breakpoint({ ...props, ...{ display: 'grid' } })}
    ${Animations}
`;

export const Container = styled.div<StyledContainerProps>`
    ${WrappedContainerStyles}
    ${(props) => Breakpoint(props)}
    ${Animations}
`;
