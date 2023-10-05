import styled, { css } from 'styled-components/macro';
import { AnimationProps, Animations } from './Animations';
import {
    FontSizes,
    FontWeights,
    Fonts,
    backgrounds,
    textColors,
} from './Types';
import {
    ContainerProps,
    ContainerStyles,
    WrappedContainerStyles,
} from './Container';
import { Breakpoint, BreakpointProps } from './Breakpoints';

interface FontProps {
    font?: Fonts;
    letterSpacing?: boolean;
    fontSize?: FontSizes;
    fontWeight?: FontWeights;
}
export const Font = css<FontProps>`
    ${({ font }) => (font ? `font-family: var(--${font});` : '')}
    ${({ letterSpacing }) => (letterSpacing ? 'letter-spacing: -0.02em;' : '')}
    ${({ fontSize }) =>
        fontSize
            ? `
            font-size: var(--${fontSize}-size);
            line-height: var(--${fontSize}-lh);
            `
            : ''}

        ${({ fontWeight }) => (fontWeight ? `font-weight: ${fontWeight};` : '')}
`;

interface TextPropsAux {
    align?: string;
    cursor?: 'pointer' | 'default';
    margin?: string;
    padding?: string;
    color?: textColors;
    background?: backgrounds;
}
export const Text = styled.span<FontProps & TextPropsAux>`
    ${Font}
    ${({ align }) => align && `text-align: ${align}`};
    ${({ cursor }) => cursor && `cursor: ${cursor}`};
    ${({ margin }) => (margin ? `margin: ${margin};` : '')}
    ${({ padding }) => (padding ? `padding: ${padding};` : '')}
    ${({ color }) => (color ? `color: var(--${color});` : '')}
    ${({ background }) =>
        background ? `background-color: var(--${background});` : ''}
`;

export const WarningText = styled.p`
    font-size: var(--body-size);
    line-height: var(--body-lh);
    color: var(--negative);
`;

export type StyledContainerProps = ContainerProps &
    FontProps &
    BreakpointProps &
    AnimationProps;

export const FlexContainer = styled.div<StyledContainerProps>`
    ${(props) => ContainerStyles({ ...props, ...{ display: 'flex' } })}
    ${Font}
    ${Breakpoint}
    ${Animations}
`;

export const GridContainer = styled.div<StyledContainerProps>`
    ${(props) => ContainerStyles({ ...props, ...{ display: 'grid' } })}
    ${Font}
    ${Breakpoint}
    ${Animations}
`;

export const Container = styled.div<StyledContainerProps>`
    ${WrappedContainerStyles}
    ${Font}
    ${Breakpoint}
    ${Animations}
`;
