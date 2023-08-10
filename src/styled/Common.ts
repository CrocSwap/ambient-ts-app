import styled, { css } from 'styled-components';

// Define the prop types for the GridContainer

interface GridContainerProps {
    numCols?: number;
    numRows?: number;
    gapSize?: number;
    fullHeight?: boolean;
}

// Define the prop types for the FlexContainer
interface FlexContainerProps {
    gap?: number;
    fullHeight?: boolean;
    flexDirection?: 'row' | 'column';
    justifyContent?: string;
}

//   ------------------------------ DISPLAY ---------------------------------------

const GridContainer = styled.div<GridContainerProps>`
    display: grid;
    grid-template-columns: ${({ numCols }) =>
        numCols ? `repeat(${numCols}, 1fr)` : 'auto'};
    grid-template-rows: ${({ numRows }) =>
        numRows ? `repeat(${numRows}, 1fr)` : 'auto'};
    gap: ${({ gapSize }) => (gapSize ? `${gapSize}px` : '0')};
    ${({ fullHeight }) => (fullHeight ? 'height: 100%;' : '')}
`;
const FlexContainer = styled.div<FlexContainerProps>`
    display: flex;
    flex-wrap: wrap;
    ${({ gap }) => gap && `gap: ${gap}px`};
    ${({ fullHeight }) => fullHeight && 'height: 100%;'};
    flex-direction: ${({ flexDirection }) =>
        flexDirection ? flexDirection : 'row'};
    ${({ justifyContent }) =>
        justifyContent && `justify-content: ${justifyContent}`};
`;

const Font = css<{ font?: 'font-logo' | 'font-family' | 'roboto' | 'mono' }>`
    ${({ font }) => font && `font-family: var(--${font})`}
`;

const FontSize = css<{ fontSize?: 'header1' | 'header2' | 'header' | 'body' }>`
    ${({ fontSize }) =>
        fontSize &&
        `
    font-size: var(--${fontSize}-size);
    line-height: var(--${fontSize}-lh);
  `}
`;

const Color = css<{
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
        | 'other-red';
    background: 'dark1' | 'dark2' | 'dark3' | 'dark4';
}>`
    ${({ color }) => color && `color: var(--${color})`};
    ${({ background }) =>
        background && `background-color: var(--${background})`};
`;
export { FlexContainer, GridContainer, Font, FontSize, Color };
