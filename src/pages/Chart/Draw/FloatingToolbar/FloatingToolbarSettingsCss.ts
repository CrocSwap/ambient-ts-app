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
`;

const InfoLabel = styled.div`
    display: flex;
    font-size: 12px;

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

const FibLineSettings = styled.div`
    background: #242f3f;
    align-items: center;

    padding: 5px;
    gap: 12px;

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
};
