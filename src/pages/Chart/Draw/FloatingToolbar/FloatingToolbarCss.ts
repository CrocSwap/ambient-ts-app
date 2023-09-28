import styled from 'styled-components';

const FloatingDiv = styled.div`
    align-items: stretch;
    border-radius: 6px;
    box-shadow: 0 2px 6px #ffffff99;
    display: flex;
    flex-direction: column;
    opacity: 1;
    position: fixed;
    background: rgba(23, 29, 39, 255);
    flex-direction: row;
    z-index: 55;
`;

export const FloatingButtonDiv = styled.div`
    align-items: center;
    color: #b2b5be;
    cursor: grab;
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    width: 24px;
`;

export const FloatingOptions = styled.div`
    align-items: center;
    cursor: pointer;
    width: 24px;
`;

export default FloatingDiv;
