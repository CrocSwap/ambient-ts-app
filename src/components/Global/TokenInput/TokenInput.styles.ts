import styled from 'styled-components/macro';

export const TokenInputQuanity = styled.div``;

export const TokenInputContainer = styled.div<{
    showPulseAnimation?: boolean;
    includeWallet?: boolean;
}>`
    border-radius: var(--border-radius);
    background-color: var(--dark2);

    min-height: 40px;
    display: grid;
    grid-template-columns: 1fr 145px;
    align-items: center;

    @keyframes shadow-pulse {
        0% {
            box-shadow: 0 0 0 0px rgba(131, 119, 220, 0.8);
            border-radius: var(--border-radius);
        }

        100% {
            box-shadow: 0 0 0 12px rgba(0, 0, 0, 0);
            border-radius: var(--border-radius);
        }
    }
    ${({ showPulseAnimation }) =>
        showPulseAnimation ? 'animation: shadow-pulse 1s 6;' : ''}

    ${({ includeWallet }) => (!includeWallet ? 'bottom-padding: 8px;' : '')}
`;

export const TokenSelectButton = styled.button`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: all var(--animation-speed) ease-in-out;
    background: transparent;
    outline: none;
    border: none;
    padding: 0 4px;
    border-radius: 4px;

    &:hover {
        background: var(--dark3);
    }

    &:focus-visible {
        border: 1px solid var(--text1);
    }
`;

export const DisabledText = styled.div`
    font-size: 10px;
    line-height: var(--body-lh);
    text-align: center;
    font-weight: 100;
`;

export const TokenInputQuantityInput = styled.input`
    font-weight: 300;
    font-size: 18px;
    line-height: 22px;
    color: var(--text1);
    text-align: start;
    width: 80%;
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0;
    max-height: 23px;
    margin: 8.5px 0;
    margin-left: 32px;
    border: none;
    outline: 0;
    background-color: transparent;
    background-clip: padding-box;

    transition: border-color var(--animation-speed) ease-in-out,
        box-shadow var(--animation-speed) ease-in-out;

    font-family: var(--mono);

    &:placeholder {
        color: var(--text3);
        font-weight: 300;
        font-size: 18px;
        line-height: 22px;
    }
`;
