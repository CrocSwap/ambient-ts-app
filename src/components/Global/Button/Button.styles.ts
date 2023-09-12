import styled, { css } from 'styled-components/macro';

export const ButtonBase = styled.button<{ flat: boolean; width?: string }>`
    width: ${({ width }) => width || '100%'};
    outline: none;
    padding: 12px 16px;
    font-size: 16px;
    line-height: 24px;
    display: block;
    height: auto;
    cursor: pointer;
    text-align: center;
    background: transparent;
    text-transform: capitalize;
    border-radius: 4px;
    transition: all var(--animation-speed) ease-in-out;
    border: 1px solid var(--accent1);

    ${({ flat }) =>
        flat
            ? css`
                  background: var(--accent1);
                  color: var(--text1);

                  &:hover,
                  &:focus-visible {
                      background: var(--dark2);
                      color: var(--accent1);
                  }
              `
            : css`
                  color: var(--accent5);
                  background: var(--title-gradient);
                  background-position: 1% 50%;
                  background-size: 300% 300%;
                  text-decoration: none;

                  &:hover,
                  &:focus-visible {
                      color: var(--text1);
                      border: 1px solid rgba(223, 190, 106, 0);
                      background-position: 99% 50%;
                  }
              `}

    ${({ disabled }) =>
        disabled &&
        css`
            font-size: var(--header2-size);
            line-height: var(--header2-lh);
            color: var(--text2);
            border: none;
            transition: color var(--animation-speed) ease-in-out;
            border-radius: var(--border-radius);
            background-color: var(--dark2);
            pointer-events: none;
        `}
`;
