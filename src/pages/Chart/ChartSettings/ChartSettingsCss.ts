import styled from 'styled-components';

const ChartSettingsContainer = styled.div<{
    top: number;
    left: number;
}>`
    position: absolute;

    transform: translateY(-50%);

    top: ${({ top }) => top + 'px'};
    left: ${({ left }) => left + 'px'};
`;

const ContextMenu = styled.div`
    width: 284px;
    height: 327px;

    padding: 8px 16px 8px 16px;

    gap: 16px;

    border-radius: 4px 0px 0px 0px;

    border: 1px 0px 0px 0px;

    background: var(--dark1);

    border: 1px solid var(--accent1);

    box-shadow: 0px 0px 20px 0px #7371fc66 inset;

    box-shadow: 0px 0px 20px 0px #7371fc33;
`;

const ContextMenuHeader = styled.div`
    display: flex;

    flex-direction: row;

    justify-content: space-between;
`;

const ContextMenuHeaderText = styled.div`
    font-family: Lexend Deca;

    font-size: 16px;

    font-weight: 300;

    line-height: 20px;

    letter-spacing: -0.02em;

    text-align: left;

    color: #ffffff;
`;

const CloseButton = styled.div`
    width: 16px;

    height: 16px;

    &:hover {
        cursor: pointer;
    }
`;

const CheckListContainer = styled.div``;

const SelectionContainer = styled.div``;

const ColorPickerContainer = styled.div``;

const ContextMenuFooter = styled.div``;

export {
    ChartSettingsContainer,
    ContextMenu,
    ContextMenuHeader,
    CheckListContainer,
    SelectionContainer,
    ColorPickerContainer,
    ContextMenuFooter,
    ContextMenuHeaderText,
    CloseButton,
};
