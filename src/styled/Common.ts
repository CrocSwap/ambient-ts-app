import styled, { css } from 'styled-components';

interface FontProps {
    font?: 'font-logo' | 'font-family' | 'roboto' | 'mono';
}
export const Font = css<FontProps>`
    ${({ font }) => font && `font-family: var(--${font})`}
`;

interface FontSizeProps {
    fontSize?: 'header1' | 'header2' | 'header' | 'body';
}
export const FontSize = css<FontSizeProps>`
    ${({ fontSize }) =>
        fontSize &&
        `
    font-size: var(--${fontSize}-size);
    line-height: var(--${fontSize}-lh);
  `}
`;

interface FontWeightProps {
    fontWeight?: string;
}
export const FontWeight = css<FontWeightProps>`
    ${({ fontWeight }) => fontWeight && `font-weight: ${fontWeight}`};
`;

interface ColorProps {
    color?:
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
        | 'orange';
    background?: 'dark1' | 'dark2' | 'dark3' | 'dark4';
}
export const Color = css<ColorProps>`
    ${({ color }) => color && `color: var(--${color})`};
    ${({ background }) =>
        background && `background-color: var(--${background})`};
`;

interface PaddingProps {
    padding?: string;
}
export const Padding = css<PaddingProps>`
    ${({ padding }) => padding && `padding: ${padding}`};
`;

interface MarginProps {
    margin?: string;
}
export const Margin = css<MarginProps>`
    ${({ margin }) => margin && `margin: ${margin}`};
`;

//   ------------------------------ DISPLAY ---------------------------------------

// Define the prop types for the GridContainer
interface GridProps {
    numCols?: number;
    numRows?: number;
    gapSize?: number;
    height?: number;
    fullWidth?: boolean;
    customRows?: string;
    customCols?: string;
}
const Grid = css<GridProps>`
    display: grid;
    grid-template-columns: ${({ numCols, customCols }) =>
        customCols ? customCols : numCols ? `repeat(${numCols}, 1fr)` : 'auto'};
    grid-template-rows: ${({ numRows, customRows }) =>
        customRows ? customRows : numRows ? `repeat(${numRows}, 1fr)` : 'auto'};
    gap: ${({ gapSize }) => (gapSize ? `${gapSize}px` : '4')};
    ${({ height }) => (height ? `height: ${height}px` : '100%')}
`;
export const GridContainer = styled.div<
    GridProps &
        FontProps &
        FontSizeProps &
        FontWeightProps &
        ColorProps &
        PaddingProps &
        MarginProps
>`
    ${Grid}
    ${Font}
    ${FontSize}
    ${FontWeight}
    ${Color}
    ${Padding}
    ${Margin}
`;

// Define the prop types for the FlexContainer
interface FlexProps {
    gap?: number;
    fullHeight?: boolean;
    fullWidth?: boolean;
    flexDirection?: 'row' | 'column';
    justifyContent?: string;
    alignItems?: string;
    overflow?: string;
    background?: string;
    rounded?: boolean;
}
const Flex = css<FlexProps>`
    display: flex;
    ${({
        flexDirection,
        fullWidth,
        fullHeight,
        justifyContent,
        alignItems,
        gap,
        overflow,
        background,
        rounded,
    }) => `
        flex-direction: ${flexDirection ? flexDirection : 'row'};
        ${fullWidth && 'width: 100%'};
        ${fullHeight && 'height: 100%'};
        ${justifyContent && `justify-content: ${justifyContent}`};
        ${alignItems && `align-items: ${alignItems}`};
        ${gap && `gap: ${gap}px`};
        ${overflow && `overflow: ${overflow}`};
        ${background && `background: ${background}`};
        ${rounded && 'border-radius: var(--border-radius)'};
    `}
`;
export const FlexContainer = styled.div<
    FlexProps &
        FontProps &
        FontSizeProps &
        FontWeightProps &
        ColorProps &
        PaddingProps &
        MarginProps
>`
    ${Flex}
    ${Font}
    ${FontSize}
    ${FontWeight}
    ${Color}
    ${Padding}
    ${Margin}
`;

export const Text = styled.p<
    FontProps &
        FontSizeProps &
        ColorProps &
        FontWeightProps & { align?: string }
>`
    ${Font}
    ${FontSize}
    ${FontWeight}
    ${Color}
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
