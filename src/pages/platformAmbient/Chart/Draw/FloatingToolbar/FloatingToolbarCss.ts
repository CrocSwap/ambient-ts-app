import styled from 'styled-components';

const FloatingDivContainer = styled.div`
    height: auto;

    flex-direction: column;
    align-items: start;

    display: flex;

    opacity: 1;
    position: fixed;
    z-index: 10000;
`;

const FloatingDiv = styled.div`
    align-items: center;

    height: 30px;
    max-width: 300px;

    border-radius: 3px;
    box-shadow: 0 2px 6px #0d1117;
    display: flex;
    flex-direction: column;
    opacity: 1;
    background: #242f3f;
    flex-direction: row;
    gap: 5px;
`;

export const FloatingDropdownOptions = styled.div`
    height: auto;
    display: grid;
    grid-template-rows: auto;
`;

export const FloatingButtonDiv = styled.div`
    align-items: center;
    color: #b2b5be;
    cursor: grab;
    display: flex;
    flex-shrink: 0;
    justify-content: space-between;
    width: 30px;

    padding-left: 11px;
`;

export const FloatingOptions = styled.div<{ hoverColor: string }>`
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 30px;
    height: 30px;
    padding: 1px;
    border-radius: 3px;
    display: flex;

    &:hover {
        background: ${({ hoverColor }) => hoverColor};
    }
`;

export const Divider = styled.div`
    background: #434c58;
    width: 1px;
    height: 30px;
`;

export const HorizontalDivider = styled.div`
    background: #434c58;
    width: 30px;
    height: 1px;
`;

const OptionsTab = styled.div`
    background: #242f3f;
    margin-top: 4px;
    border-radius: 3px;
    box-shadow: 0px 2px 3px 2px #0d1117;
    align-items: end;

    z-index: 1000;

    margin: 4px;
    padding: 4px;

    width: 50%;

    justify-content: end;
`;

const ColorPickerTab = styled.div`
    display: flex;

    align-items: center;

    margin: 4px;
    padding: 4px;

    justify-content: center;
`;

const OptionsTabSize = styled.div<{
    backgroundColor: string | undefined;
}>`
    align-items: center;
    justify-content: center;
    cursor: pointer;

    z-index: 1000;

    background: ${({ backgroundColor }) =>
        backgroundColor ? backgroundColor : 'transparent'};

    font-size: var(--body-lh);
    line-height: var(--body-lh);
    color: var(--text2);
    outline: none;
    border: none;
    padding: 1px 8px;
    position: relative;
    padding: 4px;
    gap: 12px;

    display: flex;

    &:hover {
        background: #434c58;
    }
`;
const OptionsTabStyle = styled.div<{
    backgroundColor: string | undefined;
}>`
    background: ${({ backgroundColor }) =>
        backgroundColor ? backgroundColor : 'transparent'};

    align-items: center;
    justify-content: start;
    cursor: pointer;

    font-size: var(--body-lh);
    line-height: var(--body-lh);

    padding: 4px;
    gap: 12px;

    display: flex;

    &:hover {
        background: #434c58;
    }
`;

export {
    ColorPickerTab,
    FloatingDiv,
    FloatingDivContainer,
    OptionsTab,
    OptionsTabSize,
    OptionsTabStyle,
};
