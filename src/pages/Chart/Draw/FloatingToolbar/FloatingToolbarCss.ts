import styled from 'styled-components';

const FloatingDivContainer = styled.div`
    align-items: center;
    height: 30px;
    border-radius: 3px;
    box-shadow: 0 2px 6px #0d1117;
    display: flex,
    opacity: 1;
    position: fixed;
    z-index: 55;
`;

const FloatingDiv = styled.div`
    align-items: center;

    height: 30px;

    border-radius: 3px;
    box-shadow: 0 2px 6px #0d1117;
    display: flex;
    flex-direction: column;
    opacity: 1;
    background: #242f3f;
    flex-direction: row;
    gap: 5px;
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

export const FloatingOptions = styled.div`
    align-items: center;
    justify-content: center;
    cursor: pointer;
    width: 30px;
    height: 30px;
    padding: 1px;
    border-radius: 3px;
    display: flex;

    &:hover {
        background: #434c58;
    }
`;

export const Divider = styled.div`
    background: #434c58;
    width: 1px;
    height: 30px;
`;

const OptionsTab = styled.div`
    background: #242f3f;
    height: 80px;
    width: 30px;
    margin-top: 4px;
    border-radius: 3px;
    box-shadow: 4px 4px 6px #0d1117;
`;

export { FloatingDiv, FloatingDivContainer, OptionsTab };
