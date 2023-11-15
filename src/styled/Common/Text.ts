import styled from 'styled-components/macro';
import { FontSizes, FontWeights, Fonts, textColors } from './Types';

interface TextProps {
    align?: string;
    cursor?: 'pointer' | 'default';
    margin?: string;
    marginLeft?: string;
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    padding?: string;
    color?: textColors;
    font?: Fonts;
    letterSpacing?: boolean;
    fontSize?: FontSizes;
    fontWeight?: FontWeights;
}
export const Text = styled.span<TextProps>`
    ${({
        font,
        fontSize,
        letterSpacing,
        fontWeight,
        align,
        cursor,
        margin,
        marginLeft,
        marginTop,
        marginRight,
        marginBottom,
        padding,
        color,
    }) => `
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
    ${align ? `text-align: ${align}` : ''}
    ${cursor ? `cursor: ${cursor}` : ''}
    ${margin ? `margin: ${margin};` : ''}
    ${marginLeft ? `margin-left: ${marginLeft};` : ''}
    ${marginTop ? `margin-top: ${marginTop};` : ''}
    ${marginRight ? `margin-right: ${marginRight};` : ''}
    ${marginBottom ? `margin-bottom: ${marginBottom};` : ''}
    ${padding ? `padding: ${padding};` : ''}
    ${color ? `color: var(--${color});` : ''}
    `}
`;

export const WarningText = styled(Text)`
    font-size: var(--body-size);
    line-height: var(--body-lh);
    color: var(--negative);
`;
