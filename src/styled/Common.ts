import styled, { css } from 'styled-components/macro';
import { AnimationProps, Animations } from './Animations';

interface FontProps {
    font?: 'font-logo' | 'font-family' | 'roboto' | 'mono';
    letterSpacing?: boolean;
}
export const Font = css<FontProps>`
    ${({ font }) => (font ? `font-family: var(--${font});` : '')}
    ${({ letterSpacing }) => (letterSpacing ? 'letter-spacing: -0.02em;' : '')}
`;

interface FontSizeProps {
    fontSize?: 'header1' | 'header2' | 'header' | 'body' | 'mini';
}
export const FontSize = css<FontSizeProps>`
    ${({ fontSize }) =>
        fontSize
            ? `
    font-size: var(--${fontSize}-size);
    line-height: var(--${fontSize}-lh);
  `
            : ''}
`;

interface FontWeightProps {
    fontWeight?: string;
}
export const FontWeight = css<FontWeightProps>`
    ${({ fontWeight }) => (fontWeight ? `font-weight: ${fontWeight};` : '')}
`;

type textColors =
    | 'text1'
    | 'text2'
    | 'text3'
    | 'accent1'
    | 'accent2'
    | 'accent3'
    | 'accent4'
    | 'accent5'
    | 'positive'
    | 'negative'
    | 'other-green'
    | 'other-red'
    | 'white'
    | 'orange';

type backgrounds = 'dark1' | 'dark2' | 'dark3' | 'dark4' | 'title-gradient';
interface ColorProps {
    color?: textColors;
    background?: backgrounds;
}

export const Color = css<ColorProps>`
    ${({ color }) => (color ? `color: var(--${color});` : '')}
    ${({ background }) =>
        background ? `background-color: var(--${background});` : ''}
`;

export const Blur = css<{ blur: boolean }>`
    pointer-events: none;
    opacity: 0.2;
    filter: blur(2px);
`;

interface PaddingProps {
    padding?: string;
}
export const Padding = css<PaddingProps>`
    ${({ padding }) => (padding ? `padding: ${padding};` : '')}
`;

interface MarginProps {
    margin?: string;
}
export const Margin = css<MarginProps>`
    ${({ margin }) => (margin ? `margin: ${margin};` : '')}
`;

//   ------------------------------ DISPLAY ---------------------------------------

// Define the prop types for the FlexContainer
export interface FlexProps {
    flexDirection?: 'row' | 'column';
}

export const Flex = css<FlexProps>`
    display: flex;
    ${({ flexDirection }) => `
        flex-direction: ${flexDirection ? flexDirection : 'row'};

    `}
`;

type overflowTypes = 'scroll' | 'auto' | 'hidden' | 'visible';
export interface ContainerProps {
    transition?: boolean;
    cursor?: 'pointer' | 'default';
    height?: string;
    width?: string;
    gap?: number;
    fullHeight?: boolean;
    fullWidth?: boolean;
    justifyContent?: string;
    alignItems?: string;
    overflow?: overflowTypes;
    overflowY?: overflowTypes;
    overflowX?: overflowTypes;

    background?: backgrounds;
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
    blur?: boolean;
    grow?: boolean;

    margin?: string;
    padding?: string;
}

export const hideScrollbarCss = css`
    &::-webkit-scrollbar {
        display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
`;

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
        blur,
        grow,
        margin,
        padding,
    } = props;
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
        ${rounded ? 'border-radius: var(--border-radius);' : ''}
        ${maxWidth ? `max-width: ${maxWidth};` : ''}
        ${zIndex ? `z-index: ${zIndex};` : ''}

        ${transition ? 'transition: var(--transition);' : ''}
        ${cursor ? `cursor: ${cursor};` : ''}
        ${outline ? `outline: 1px solid var(--${outline});` : ''}
        ${minHeight ? `min-height: ${minHeight};` : ''}
        ${maxHeight ? `max-height: ${maxHeight};` : ''}
        ${blur ? Blur : ''}
        ${grow ? 'flex-grow: 1;' : ''}

        ${padding ? `padding: ${padding};` : ''}
        ${margin ? `margin: ${margin};` : ''}
    `;
};

export const WrappedContainerStyles = css<ContainerProps>`
    ${(props) => ContainerStyles(props)}
`;

type BeakpointSubProps = ContainerProps & ColorProps;
// & FlexProps & FontProps & FontSizeProps & FontWeightProps & ColorProps & PaddingProps & MarginProps;
export interface BreakpointProps {
    mobile?: BeakpointSubProps;
    tablet?: BeakpointSubProps;
    desktop?: BeakpointSubProps;
}

export const Breakpoint = css<BreakpointProps>`
    ${({ mobile, tablet, desktop }) => `
    ${
        mobile
            ? `@media only screen and (max-width: 600px) {
                ${ContainerStyles(mobile)}
            }`
            : ''
    }
    ${
        tablet
            ? `@media only screen and (min-width: 600px) {
                ${ContainerStyles(tablet)}
            }`
            : ''
    }
    ${
        desktop
            ? `@media only screen and (min-width: 1200px) {
                ${ContainerStyles(desktop)}
            }`
            : ''
    }

    `}
`;

export const Text = styled.span<
    FontProps &
        FontSizeProps &
        ColorProps &
        FontWeightProps & {
            align?: string;
            cursor?: 'pointer' | 'default';
        } & MarginProps &
        PaddingProps
>`
    ${Font}
    ${FontSize}
    ${FontWeight}
    ${Color}
    ${Margin}
    ${Padding}
    ${({ align }) => align && `text-align: ${align}`};
`;

interface ScrollContainerProps {
    scrollHeight?: string;
}
export const ScrollContainer = styled.div<ScrollContainerProps>`
    overflow-y: auto;
    ${({ scrollHeight }) =>
        scrollHeight ? `height: ${scrollHeight};` : 'height: 100%'};

    /* Custom scrollbar styles */
    scrollbar-width: thin;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-thumb {
        background: linear-gradient(
            90deg,
            rgba(115, 113, 252, 0) 0%,
            rgba(115, 113, 252, 0) 71.21%,
            var(--accent1) 100%
        );
        border: 1px solid var(--accent1);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(
            90deg,
            rgba(115, 113, 252, 0) 0%,
            rgba(115, 113, 252, 0) 71.21%,
            var(--accent) 100%
        );
    }
`;

export const WarningText = styled.p`
    font-size: var(--body-size);
    line-height: var(--body-lh);
    color: var(--negative);
`;
export const FlexContainer = styled.div<
    FlexProps &
        FontProps &
        FontSizeProps &
        FontWeightProps &
        ColorProps &
        ContainerProps &
        BreakpointProps &
        AnimationProps
>`
    ${Flex}
    ${Font}
    ${FontSize}
    ${FontWeight}
    ${Color}
    ${Padding}
    ${Margin}
    ${WrappedContainerStyles}
    ${Breakpoint}
    ${Animations}
`;

// Define the prop types for the GridContainer
interface GridProps {
    numCols?: number;
    numRows?: number;
    customRows?: string;
    customCols?: string;
}
const Grid = css<GridProps>`
    display: grid;
    grid-template-columns: ${({ numCols, customCols }) =>
        customCols ? customCols : numCols ? `repeat(${numCols}, 1fr)` : 'auto'};
    grid-template-rows: ${({ numRows, customRows }) =>
        customRows ? customRows : numRows ? `repeat(${numRows}, 1fr)` : 'auto'};
`;
export const GridContainer = styled.div<
    GridProps &
        ContainerProps &
        FontProps &
        FontSizeProps &
        FontWeightProps &
        ColorProps
>`
    ${Grid}
    ${WrappedContainerStyles}
    ${Font}
    ${FontSize}
    ${FontWeight}
    ${Color}


    ${({ gap }) => (gap ? `gap: ${gap};` : 'gap: 4px;')}})}
`;
// TODO: Would be better if no default height were provided
