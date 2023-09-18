import styled, { css } from 'styled-components/macro';

export const ButtonBase = styled.button<{
    flat: boolean;
    width?: string;
    height?: string;
}>`
    width: ${({ width }) => width || '100%'};
    max-width: 500px;
    height: ${({ height }) => height || 'auto'};
    outline: none;
    padding: 12px 16px;
    font-size: 16px;
    line-height: 24px;
    display: block;
    cursor: pointer;
    text-align: center;
    background: transparent;
    text-transform: capitalize;
    border-radius: var(--border-radius);
    transition: var(--transition);
    border: 1px solid var(--accent1);

    // flat or gradient
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

export const ChipComponent = styled.button`
    outline: none;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all var(--animation-speed) ease-in-out;
    white-space: nowrap;
    height: 23px;
    padding: 5px 8px;
    text-decoration: none;
    cursor: pointer;
    font-size: var(--body-size);
    /* line-height: var(--body-lh); */
    color: var(--text1);
    background: var(--dark1);
    border: 1px solid var(--dark3);
    border-radius: 50px;

    &:hover {
        border: 1px solid var(--accent1);
        color: var(--accent1);
    }

    &:hover svg {
        color: var(--accent1) !important;
    }
`;

export const ToggleComponent = styled.div<{ disabled: boolean }>`
    width: 36px;
    height: 20px;
    background: var(--dark3);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-radius: 18px;
    border: 1px solid var(--accent1);
    cursor: pointer;

    &:focus-visible {
        box-shadow: 0px 0px 36px rgba(205, 193, 255, 0.2),
            0px 0px 21px rgba(205, 193, 255, 0.2),
            0px 0px 12px rgba(205, 193, 255, 0.2),
            0px 0px 7px rgba(205, 193, 255, 0.2), 0px 0px 4px var(--accent5),
            0px 0px 2px rgba(205, 193, 255, 0.2);
    }

    &[data-isOn='true'] {
        justify-content: flex-end;
        background-color: var(--accent1);
    }

    &[data-isOn='true'] .handle {
        background: var(--text1);
    }
    ${({ disabled }) =>
        disabled &&
        `
    pointer-events: none;
    opacity: 0.4;
    `}
`;
