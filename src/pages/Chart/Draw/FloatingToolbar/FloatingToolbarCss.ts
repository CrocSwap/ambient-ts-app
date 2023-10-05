import styled from 'styled-components';

// --dark1: #0d1117;
// --dark2: #171d27;
// --dark3: #242f3f;
// --dark4: #141922;

const FloatingDiv = styled.div`
    align-items: center;
    border-radius: 6px;
    box-shadow: 0 2px 6px #0d1117;
    display: flex;
    flex-direction: column;
    opacity: 1;
    position: fixed;
    background: #242f3f;
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
