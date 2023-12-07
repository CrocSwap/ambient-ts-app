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
}>`
    background: ${({ backgroundColor }) =>
        backgroundColor ? backgroundColor : '#242f3f'};
    align-items: center;
    justify-content: center;
    cursor: pointer;

    border-radius: 3px;

    border-width: 1.5px;
    border-style: solid;
    border-color: #434c58;

    height: 20px;
    width: 20px;

    display: flex;
`;

const OptionStyleContainer = styled.div`
    background: #242f3f;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    border-radius: 3px;

    border-width: 1.5px;
    border-style: solid;
    border-color: #434c58;

    height: 20px;
    width: 25px;

    padding: 4px;
    display: flex;

    &:hover {
        border-color: #949ead;
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
    grid-template-columns: repeat(2, 1fr);

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
    align-items: center;
    justify-content: center;

    margin: 0 auto;
`;

const DropDownHeader = styled.div`
    padding: 4px;
    box-shadow: 0 3px 4px rgba(0, 0, 0, 0.7);

    border-radius: 3px;

    font-size: 13px;
    color: var(--dark4);
    background: var(--text1);

    align-items: center;
    justify-content: center;

    cursor: pointer;

    width: 65px;

    &:hover {
        color: var(--text1);
        background: var(--dark4);
    }
`;

const DropDownListContainer = styled.div`
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

const ListItem = styled.ul`
    padding: 5px 10px 5px 10px;

    &:hover {
        background: #434c58;
    }
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
};
