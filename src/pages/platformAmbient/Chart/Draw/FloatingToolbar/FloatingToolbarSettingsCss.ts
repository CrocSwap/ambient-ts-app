import styled from 'styled-components';

const FloatingToolbarSettingsContainer = styled.div`
    background: #242f3f;
    border-radius: 3px;
    box-shadow: 4px 4px 6px #0d1117;

    padding: 4px;

    width: 100%;

    transform: translateX(-9%);

    min-width: 310px;
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
    isFibColor?: boolean;
}>`
    ${({ backgroundColor, isFibColor, disabled }) => {
        if (backgroundColor) {
            const rgbaValues = backgroundColor.match(/\d+(\.\d+)?/g);

            if (rgbaValues && rgbaValues.length > 3 && isFibColor) {
                const fibLevelColor =
                    'rgba(' +
                    rgbaValues[0] +
                    ',' +
                    rgbaValues[1] +
                    ',' +
                    rgbaValues[2] +
                    ',' +
                    (disabled ? 0.4 : 1.2) +
                    ')';
                return 'background: ' + fibLevelColor.toString() + ';';
            } else {
                return 'background: ' + backgroundColor + ';';
            }
        }
    }}

    align-items: center;
    justify-content: center;

    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

    border-radius: 1.5px;

    border-width: 0.5px;
    border-style: solid;
    border-color: ${({ disabled }) =>
        disabled ? 'rgba(121, 133, 148, 0.2)' : 'rgba(121, 133, 148, 0.7)'};

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

    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

    border-radius: 2px;

    border-width: 1.5px;
    border-style: solid;
    border-color: ${({ disabled }) =>
        disabled ? 'rgba(121, 133, 148, 0.7)' : 'rgba(121, 133, 148, 1)'};

    height: 20px;
    width: 32px;

    padding: 1px;
    display: flex;
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

    cursor: pointer;

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
    grid-template-columns: 48% 50%;
`;

const LineSettingsLeft = styled.div`
    align-items: center;
    justify-content: center;
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    gap: 10px;
`;

const LineSettingsRight = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;

    align-items: center;
    justify-content: center;

    position: relative;

    gap: 10px;
`;

const ExtendSettings = styled.div`
    align-items: center;
    display: grid;
    grid-template-columns: 28% 72%;
`;

const FibLineSettings = styled.div`
    background: #242f3f;
    align-items: center;

    padding: 4px;
    gap: 10px;

    display: grid;
    grid-template-columns: repeat(2, 1fr);
`;

const FibLineOptions = styled.div`
    position: relative;
    align-items: center;
    justify-content: center;
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    gap: 10px;
`;

const StyledLabel = styled.div`
    color: rgba(204, 204, 204);
    padding-top: 2px;
    font-size: 13px;
`;

const DropDownContainer = styled.div`
    position: relative;

    align-items: center;
    justify-content: center;

    margin: 0 auto;

    z-index: 99;
`;

const DropDownHeader = styled.div`
    padding: 4px;

    grid-template-columns: repeat(2, 1fr);
    justify-content: space-around;

    display: flex;

    border-radius: 3px;

    border-width: 1.5px;
    border-style: solid;
    border-color: rgba(121, 133, 148, 0.7);

    font-size: 13px;
    color: rgba(204, 204, 204);
    background: #2f3d52;

    align-items: center;

    cursor: pointer;

    width: 75px;

    &:hover {
        border-color: rgba(121, 133, 148, 1);
    }
`;

const DropDownListContainer = styled.div`
    position: absolute;
    &:first-child {
        padding-top: 5px;
    }
`;

const DropDownList = styled.ul<{
    width: number;
}>`
    padding: 0;
    margin: 0;

    width: ${({ width }) => width + 'px'};

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
    width: 16px;
    height: 16px;
    background: ${({ checked, disabled }) =>
        checked ? (disabled ? '#434c58' : '#2196F3') : '#f0f0f8'};

    border-radius: 2px;

    ${Icon} {
        opacity: ${({ checked }) => (checked ? 1 : 0)};
    }

    cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

    &:hover {
        filter: ${({ disabled }) =>
            disabled ? 'brightness(1)' : 'brightness(1.2)'};
    }
`;

const LineWidthOptionsCont = styled.div<{
    disabled: boolean;
}>`
    display: flex;
    align-items: center;
    justify-content: center;

    background: ${({ disabled }) => (disabled ? '#242f3f' : '#2f3d52')};

    width: 100%;
    height: 100%;

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

const LabelSettingsContainer = styled.div`
    background: #242f3f;
    align-items: center;

    padding: 0 5px 0 0;
    gap: 5px;

    display: grid;
    grid-template-columns: 1fr 1fr 0.5fr;
`;

const LabelSettingsArrow = styled.span<{
    isActive: boolean;
    width: number;
    height: number;
}>`
    ${({ isActive }) => {
        if (isActive) {
            return `
                margin-top: 2.5px;
                transform: rotate(315deg);
            `;
        } else {
            return `
            margin-top: -2.5px;
            transform: rotate(135deg);
            `;
        }
    }}

    display: inline-block;

    width: ${({ width }) => width + 'px'};
    height: ${({ height }) => height + 'px'};

    border-top: 1px solid #dbdbdb;
    border-right: 1px solid #dbdbdb;
    transition: all 600ms;
`;

const SliderContainer = styled.div`
    position: relative;

    display: flex;

    align-items: center;
    justify-content: center;

    width: 110px;
    height: 12px;

    margin: 0 auto;
`;

const AlphaSlider = styled.input`
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 110px;
    background-color: transparent;

    &:focus-visible {
        outline-color: #f8b195;
    }

    &::-webkit-slider-runnable-track {
        -webkit-appearance: none;
        appearance: none;
        height: 6px;
        background: #f67280;

        background: -webkit-linear-gradient(
            left,
            rgba(60, 79, 94, 0.5) 0%,
            rgba(118, 116, 255, 1) 100%
        );

        background: linear-gradient(
            to right,
            rgba(60, 79, 94, 0.5) 0%,
            rgba(118, 116, 255, 1) 100%
        );

        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#f67280", endColorstr="#355c7d", GradientType=1);
    }

    &::-moz-range-track {
        -moz-appearance: none;
        appearance: none;
        height: 6px;
        background: #f67280;

        background: -webkit-linear-gradient(
            left,
            rgba(60, 79, 94, 0.5) 0%,
            rgba(118, 116, 255, 1) 100%
        );

        background: linear-gradient(
            to right,
            rgba(60, 79, 94, 0.5) 0%,
            rgba(118, 116, 255, 1) 100%
        );

        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#f67280", endColorstr="#355c7d", GradientType=1);
    }

    &::-ms-track {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        height: 6px;
        background: #f67280;

        background: -webkit-linear-gradient(
            left,
            rgba(60, 79, 94, 0.5) 0%,
            rgba(118, 116, 255, 1) 100%
        );

        background: linear-gradient(
            to right,
            rgba(60, 79, 94, 0.5) 0%,
            rgba(118, 116, 255, 1) 100%
        );

        filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#f67280", endColorstr="#355c7d", GradientType=1);
    }

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;

        border-radius: 50%;
        height: 16px;
        width: 16px;

        position: relative;
        bottom: 5px;

        background: #efedf2;

        background-size: 50%;
        box-shadow: 0px 3px 5px 0px rgba(0, 0, 0, 0.4);
        cursor: pointer;
    }

    &::-webkit-slider-thumb:active {
        cursor: grabbing;
    }

    &::-moz-range-thumb {
        -moz-appearance: none;
        appearance: none;

        border-radius: 50%;
        height: 16px;
        width: 16px;

        position: relative;
        bottom: 6px;

        background: #efedf2;

        background-size: 50%;
        box-shadow: 0px 3px 5px 0px rgba(0, 0, 0, 0.4);
        cursor: pointer;
    }

    &::-moz-range-thumb:active {
        cursor: grabbing;
    }

    &::-ms-thumb {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;

        border-radius: 50%;
        height: 16px;
        width: 16px;

        position: relative;
        bottom: 6px;

        background: #efedf2;

        background-size: 50%;
        box-shadow: 0px 3px 5px 0px rgba(0, 0, 0, 0.4);
        cursor: pointer;
    }

    &:::-ms-thumb:active {
        cursor: grabbing;
    }
`;

export {
    AlphaSlider,
    CheckboxContainer,
    ColorPickerTab,
    DropDownContainer,
    DropDownHeader,
    DropDownList,
    DropDownListContainer,
    ExtendSettings,
    FibLineOptions,
    FibLineSettings,
    FloatingToolbarSettingsContainer,
    Icon,
    InfoLabel,
    LabelSettingsArrow,
    LabelSettingsContainer,
    LabelStyleContainer,
    LevelTitle,
    LineContainer,
    LineSettings,
    LineSettingsLeft,
    LineSettingsRight,
    LineWidthOptions,
    LineWidthOptionsCont,
    ListItem,
    OptionColor,
    OptionColorContainer,
    OptionStyleContainer,
    SliderContainer,
    StyledCheckbox,
    StyledLabel,
};
