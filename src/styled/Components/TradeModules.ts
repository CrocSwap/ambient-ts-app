import styled from 'styled-components';
import { FlexContainer, pulseAnimation, Text } from '../Common';

export const SelectorContainer = styled(FlexContainer)`
    border-radius: var(--border-radius);
    margin-bottom: 16px;

    & a {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        border-radius: var(--border-radius);
        font-style: normal;
        font-weight: 300;
        font-size: 18px;
        line-height: 22px;
        letter-spacing: -0.02em;
        color: var(--text1);

        transition: all var(--animation-speed) ease-in-out;
    }

    & a[class='active'],
    & a:hover {
        background: var(--accent1);
        color: var(--text1);
    }
`;

export const SelectorWrapper = styled.div`
    color: var(--text1);
    width: 116.67px;
    height: 25px;
    background: var(--dark2);

    border-radius: var(--border-radius);
`;

export const WarningContainer = styled(FlexContainer)`
    border: 1px solid var(--dark3);
    border-radius: var(--border-radius);

    & svg {
        color: var(--other-red) !important;
    }
`;

export const HoverableIcon = styled.svg`
    fill: var(--text2) !important;
    color: var(--text2) !important;
    height: 20px;
    width: 20px;

    &:hover {
        fill: var(--accent1) !important;
        color: var(--accent1) !important;
    }
`;

export const TradeModuleHeaderContainer = styled(FlexContainer)`
    & svg {
        color: var(--text2);
        height: 20px;
        width: 20px;
    }

    & svg:hover {
        color: var(--accent1) !important;
    }
`;

export const AdvancedModeSection = styled.section<{ disabled: boolean }>`
    ${({ disabled }) =>
        disabled &&
        `
        pointer-events: none;
        opacity: 0.2;
        filter: blur(2px);
    `}
`;

export const AcknowledgeText = styled(Text)`
    border: 1px var(--dark3);
    border-radius: var(--border-radius);
    border: 0.1px solid var(--text3);
    text-align: center;
    padding: 4px;
    margin-top: 8px;
`;

export const AcknowledgeLink = styled.a`
    border: 1px solid transparent;
    border-bottom: 1px solid var(--accent1);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    transition: all var(--animation-speed) ease-in-out;
`;

export const SettingsContainer = styled(FlexContainer)`
    min-height: 305px;
    border-radius: var(--border-radius);
`;

export const ShareItem = styled.a`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 80px;
    width: 130px;
    color: var(--text2);
    margin-bottom: 12px;

    transition: all var(--animation-speed) ease-in-out;

    &:hover,
    &:focus-visible {
        color: var(--text1);
        background: var(--dark2);
        border-radius: 4px;
    }

    &:focus-visible svg {
        color: var(--text2);
    }
`;

export const TokenArrowButton = styled.button<{
    display: boolean;
    disabled: boolean;
}>`
    display: flex;
    transition: all var(--animation-speed) ease-in-out;
    border-radius: 50%;

    justify-content: center;
    align-items: center;

    height: 30px;
    width: 30px;

    outline: none;
    border: none;
    background: transparent;

    cursor: ${({ display }) => (display ? 'default' : 'pointer')};

    ${({ disabled }) => disabled && 'cursor: wait !important; '}

    &:hover {
        width: 30px;
        height: 30px;
        border-radius: 50%;

        svg {
            -webkit-transform: rotate(180deg);
            -moz-transform: rotate(180deg);
            -o-transform: rotate(180deg);
            -ms-transform: rotate(180deg);
            transform: rotate(180deg);

            ${({ display }) =>
                display &&
                `
                transform: none;
                cursor: unset !important;
            `}

            ${({ disabled }) =>
                disabled &&
                `
                cursor: wait !important;
            `}
        }
    }
`;

export const TokenArrow = styled.svg<{ display: boolean; disabled: boolean }>`
    background-color: transparent;
    transition: 0.7s;
    -webkit-transition: 0.7s;
    -moz-transition: 0.7s;
    -ms-transition: 0.7s;
    -o-transition: 0.7s;

    ${({ disabled }) => disabled && 'cursor: wait !important; '}
`;

export const IconButton = styled.button`
    background: transparent;
    outline: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    color: var(--text2);
`;

export const ShareUrl = styled.input`
    flex: 1;
    outline: none;
    border: none;
    color: var(--text2);
    background: var(--dark2);
    padding: 8px;
    border-radius: var(--border-radius);
    text-overflow: ellipsis;
`;

export const InputDisabledText = styled(FlexContainer)`
    font-size: 10px;
    line-height: var(--body-lh);
    text-align: center;
    font-weight: 100;
`;

export const TokenQuantityInput = styled.input`
    font-weight: 300;
    font-size: 18px;
    line-height: 22px;
    color: var(--text1);
    text-align: start;
    width: 80%;
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0;
    max-height: 23px;
    margin: 8px 0;
    margin-left: 32px;
    border: none;
    outline: 0;
    background-color: transparent;
    background-clip: padding-box;

    transition: border-color var(--animation-speed) ease-in-out,
        box-shadow var(--animation-speed) ease-in-out;

    font-family: var(--mono);

    &::placeholder {
        color: var(--text3);
    }
`;

export const TokenQuantityContainer = styled.div<{ showPulse: boolean }>`
    border-radius: var(--border-radius);
    background-color: var(--dark2);
    min-height: 40px;

    display: grid;
    grid-template-columns: 1fr 145px;

    ${({ showPulse }) => showPulse && pulseAnimation}
`;

export const TokenSelectButton = styled.button`
    width: 100%;
    height: 100%;
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

export const MaxButton = styled.button`
    cursor: pointer;
    font-size: var(--body-size);
    line-height: var(--body-lh);
    color: var(--text1);
    outline: none;
    border: none;
    background: transparent;

    width: 25px;
    max-height: 20px;
    transition: all var(--animation-speed) ease-in-out;
    border-radius: 4px;

    &:hover {
        color: var(--accent1);
    }
`;

export const RefreshButton = styled(IconButton)`
    justify-content: flex-end;

    &:hover > svg {
        color: var(--accent1);
    }

    &:focus-visible {
        color: var(--text1);
        cursor: pointer;
    }
`;

export const ExtraInfoContainer = styled(FlexContainer)<{ active: boolean }>`
    border-radius: var(--border-radius);

    ${({ active }) =>
        active
            ? `
        & > div:not(:first-child) {
            &:hover {
                color: var(--accent1);
            }
        }
        &:hover {
            cursor: pointer;
            background: var(--dark2) !important;
        }
        &:focus-visible {
            border: 1px solid var(--text1);
        }
    `
            : `
        & > div:last-child {
            cursor: pointer;

            &:hover {
                color: var(--accent1);
            }
        }
        
        &:hover,
        &:focus-visible {
            border-radius: var(--border-radius);
            cursor: default;
            background: transparent;
        }
    `}
`;

export const ExtraDetailsContainer = styled.div`
    border: 1px solid var(--dark3);
    border-radius: var(--border-radius);

    color: var(--text2);
    font-size: var(--body-size);
    line-height: var(--body-lh);
    padding: 8px 16px;
`;

export const ModalContainer = styled(FlexContainer)`
    width: 400px;
    border-radius: var(--border-radius);
`;

export const ConfirmationDetailsContainer = styled(FlexContainer)`
    border: 1px solid var(--border);
    border-radius: 4px;
`;

export const ConfirmationQuantityContainer = styled.div`
    height: 40px;
    width: 100%;
    display: grid;
    grid-template-columns: auto 140px;
    align-items: center;
    background: var(--dark2);
    padding: 0 2rem;
    border-radius: var(--border-radius);
`;

export const SubmitTransactionButton = styled.button`
    height: auto;
    width: 100%;

    font-size: 12px;
    line-height: 24px;
    text-align: center;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border: none;
    outline: none;
    cursor: pointer;

    padding: 12px 8px;

    text-transform: capitalize;
    background: var(--dark2);
    color: var(--text1);

    border-radius: 4px;
`;

export const SubmitTransactionExtraButton = styled.button`
    background: transparent;
    outline: none;
    font-size: var(--body-size);
    line-height: var(--body-lh);
    color: var(--accent5);
    cursor: pointer;
    border: 1px solid var(--dark3);
    transition: all var(--animation-speed) ease-in-out;
    border-radius: 50px;
    padding: 4px 8px;
`;

export const LimitRateContainer = styled(FlexContainer)<{ showPulse: boolean }>`
    ${({ showPulse }) => showPulse && pulseAnimation}
`;

export const LimitRateButtonContainer = styled(FlexContainer)<{
    disabled: boolean;
}>`
    border-radius: var(--border-radius);

    ${({ disabled }) =>
        disabled &&
        `
        pointer-events: none;
        filter: blur(2px);
    `}
`;

export const LimitRateButton = styled.button`
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;

    width: 20px;
    height: 20px;

    & button:hover > svg {
        color: var(--accent1);
    }
    & button:focus-visible {
        box-shadow: 0px 0px 36px rgba(205, 193, 255, 0.2),
            0px 0px 21px rgba(205, 193, 255, 0.2),
            0px 0px 12px rgba(205, 193, 255, 0.2),
            0px 0px 7px rgba(205, 193, 255, 0.2), 0px 0px 4px var(--accent5),
            0px 0px 2px rgba(205, 193, 255, 0.2);
    }
`;

export const FeeTierDisplay = styled.div`
    padding: 16px;

    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: var(--dark2);
`;
