import styled from 'styled-components';

const FloatingToolbarSettingsContainer = styled.div`
    background: #242f3f;
    margin-top: 4px;
    border-radius: 3px;
    box-shadow: 4px 4px 6px #0d1117;

    padding: 4px;

    width: 100%;
`;

const OptionColorContainer = styled.div`
    align-items: center;
    justify-content: center;

    height: 20px;

    display: flex;
`;

const OptionColor = styled.div<{
    backgroundColor: string | undefined;
    disabled: boolean;
}>`
    background: ${({ backgroundColor }) =>
        backgroundColor ? backgroundColor : '#242f3f'};

    filter: ${({ disabled }) =>
        disabled ? 'brightness(0.6)' : 'brightness(1)'};

    align-items: center;
    justify-content: center;

    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

    box-shadow: 0.5px 0.5px 1.5px 0.5px
        ${({ disabled }) =>
            disabled ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0.6)'};

    border-radius: 1.5px;

    border-width: 0.5px;
    border-style: solid;
    border-color: #434c58;

    height: 20px;
    width: 20px;

    display: flex;
`;

const OptionStyleContainer = styled.div<{
    disabled: boolean;
}>`
    background: ${({ disabled }) => (disabled ? '#242f3f' : '#2f3d52')};
    align-items: center;
    justify-content: center;

    box-shadow: 1px 1px 2px 1px
        ${({ disabled }) =>
            disabled ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.8)'};

    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

    border-radius: 1.5px;

    border-width: 1.5px;
    border-style: solid;
    border-color: ${({ disabled }) =>
        disabled ? 'rgba(67, 76, 88, 0.7)' : '#949ead'};

    height: 20px;
    width: 32px;

    padding: 1px;
    display: flex;

    &:hover {
        filter: ${({ disabled }) =>
            disabled ? 'brightness(1)' : 'brightness(1.2)'};
    }
`;

const LabelStyleContainer = styled.div`
    background: #242f3f;
    align-items: center;
    justify-content: start;
    cursor: pointer;

    font-size: 13px;
    color: rgba(204, 204, 204);

    width: 60px;

    display: flex;

    &:hover {
        font-size: 15px;
        font-weight: bold;
    }
`;

const ColorPickerTab = styled.div`
    display: flex;

    align-items: center;

    margin: 4px;
    padding: 4px;

    justify-content: center;
`;

const LineContainer = styled.div`
    align-items: center;

    justify-content: center;
`;

const LevelTitle = styled.div`
    font-size: 12px;
    color: rgba(204, 204, 204);
`;

const InfoLabel = styled.div`
    display: flex;
    font-size: 12px;
    color: rgba(204, 204, 204);

    align-items: center;

    justify-content: center;
`;

const LineSettings = styled.div`
    background: #242f3f;
    align-items: center;

    padding: 4px;
    gap: 10px;

    display: grid;
    grid-template-columns: 50% 50%;
`;

const LineSettingsLeft = styled.div`
    align-items: center;
    justify-content: center;
    display: grid;
    grid-template-columns: 30% 70%;

    gap: 10px;
`;

const LineSettingsRight = styled.div`
    align-items: center;
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    gap: 10px;
`;

const ExtendSettings = styled.div`
    align-items: center;
    display: grid;
    grid-template-columns: 25% 70%;

    gap: 10px;
`;

const FibLineSettings = styled.div`
    background: #242f3f;
    align-items: center;

    padding: 5px 5px 0 5px;
    gap: 10px;

    display: grid;
    grid-template-columns: repeat(2, 1fr);
`;

const FibLineOptions = styled.div`
    align-items: center;
    justify-content: center;
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    gap: 10px;
`;

const StyledLabel = styled.div`
    color: rgba(204, 204, 204);
    padding-left: 7px;
    padding-top: 2px;
    font-size: 13px;
`;

const DropDownContainer = styled.div`
    position: relative;

    align-items: center;
    justify-content: center;

    margin: 0 auto;
`;

const DropDownHeader = styled.div`
    padding: 4px;
    box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.7);

    display: flex;

    border-radius: 3px;

    font-size: 13px;
    color: rgba(204, 204, 204);
    background: #2f3d52;

    align-items: center;
    justify-content: center;

    cursor: pointer;

    width: 65px;

    &:hover {
        background: var(--dark4);
    }
`;

const DropDownListContainer = styled.div<{ placement: number }>`
    top: ${({ placement }) => placement + 'px'};

    position: absolute;
    &:first-child {
        padding-top: 5px;
    }
`;

const DropDownList = styled.ul`
    padding: 0;
    margin: 0;

    width: 65px;

    background: var(--dark3);

    box-sizing: border-box;

    color: rgba(204, 204, 204);
    font-size: 13px;

    border: 1px solid #434c58;
    box-sizing: border-box;

    cursor: pointer;
`;

const ListItem = styled.ul<{
    backgroundColor: string | undefined;
}>`
    padding: 5px 10px 5px 10px;

    background: ${({ backgroundColor }) =>
        backgroundColor ? backgroundColor : 'transparent'};

    display: flex;

    align-items: center;
    justify-content: center;

    &:hover {
        background: #434c58;
    }
`;

const CheckboxContainer = styled.div`
    display: flex;

    align-items: center;
    justify-content: center;

    vertical-align: middle;
`;

const Icon = styled.svg`
    fill: none;
    stroke: white;
    stroke-width: 2px;
`;

const StyledCheckbox = styled.div<{
    checked: boolean | undefined;
    disabled: boolean | undefined;
}>`
    width: 17px;
    height: 17px;
    background: ${({ checked, disabled }) =>
        checked ? (disabled ? '#434c58' : '#2196F3') : '#f0f0f8'};

    border-radius: 2px;
    transition: all 50ms;

    box-shadow: 0 1px 2px 1px
        ${({ disabled }) => (disabled ? 'transparent' : 'rgba(0, 0, 0, 0.7)')};

    ${Icon} {
        visibility: ${({ checked }) => (checked ? 'visible' : 'hidden')};
    }

    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

    &:hover {
        filter: ${({ disabled }) =>
            disabled ? 'brightness(1)' : 'brightness(1.2)'};
    }
`;

const LineWidthOptions = styled.div<{
    backgroundColor: string | undefined;
}>`
    border: 0 solid
        ${({ backgroundColor }) =>
            backgroundColor ? backgroundColor : '#8b98a5'};
    height: 0;
    width: 20px;
`;

export {
    FloatingToolbarSettingsContainer,
    LineSettings,
    OptionColorContainer,
    OptionStyleContainer,
    ColorPickerTab,
    LineContainer,
    LevelTitle,
    InfoLabel,
    LineSettingsLeft,
    LineSettingsRight,
    OptionColor,
    FibLineSettings,
    FibLineOptions,
    ExtendSettings,
    LabelStyleContainer,
    StyledLabel,
    DropDownContainer,
    DropDownHeader,
    DropDownListContainer,
    DropDownList,
    ListItem,
    StyledCheckbox,
    CheckboxContainer,
    Icon,
    LineWidthOptions,
};
