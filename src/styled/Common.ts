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
    fullHeight?: boolean;
    fullWidth?: boolean;
}
const Grid = css<GridProps>`
    display: grid;
    grid-template-columns: ${({ numCols }) =>
        numCols ? `repeat(${numCols}, 1fr)` : 'auto'};
    grid-template-rows: ${({ numRows }) =>
        numRows ? `repeat(${numRows}, 1fr)` : 'auto'};
    gap: ${({ gapSize }) => (gapSize ? `${gapSize}px` : '0')};
    ${({ fullHeight }) => (fullHeight ? 'height: 100%;' : '')}
    ${({ fullWidth }) => (fullWidth ? 'width: 100%;' : '')}
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
    ${({ gap }) => gap && `gap: ${gap}px`};
    ${({ fullWidth }) => (fullWidth ? 'width: 100%;' : '')}
    ${({ fullHeight }) => fullHeight && 'height: 100%;'};
    flex-direction: ${({ flexDirection }) =>
        flexDirection ? flexDirection : 'row'};
    ${({ justifyContent }) =>
        justifyContent && `justify-content: ${justifyContent}`};
    ${({ alignItems }) => alignItems && `align-items: ${alignItems}`};
    ${({ overflow }) => `overflow: ${overflow || 'hidden'}`};

    ${({ background, rounded }) => `
    ${background && `background: ${background};`}
    ${rounded ? 'border-radius: var(--border-radius);' : ''}

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
    ${({ align }) => align && `text-align: ${align};`}
`;
