import React, { KeyboardEventHandler, MouseEventHandler } from 'react';
import styled, { keyframes, css } from 'styled-components';

const switchAnimation = keyframes`
  0% {
    left: 100%;
  }
  100% {
    left: 0%;
  }
`;

const switchOffAnimation = keyframes`
  0% {
    right: 100%;
  }
  100% {
    right: 0%;
  }
`;

const borderRadius = '25px';
interface SwitchContainerProps {
    switcherType: 'switcher-1' | 'switcher-2'; // Define the type here
    onLabel: string; // Prop for the ON label
    offLabel: string; // Prop for the OFF label
    isOn: boolean;
    handleToggle:
        | MouseEventHandler<HTMLDivElement>
        | KeyboardEventHandler<HTMLDivElement>
        | undefined
        // eslint-disable-next-line
        | any;
    id: string;
}
const SwitchContainer = styled.span<SwitchContainerProps>`
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: ${borderRadius};

    input {
        appearance: none;
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: ${borderRadius};
        background-color: var(--dark3);
        outline: none;
        cursor: pointer;

        &:before,
        &:after {
            z-index: 2;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
        }
        &:before {
            content: '${(props) => props.onLabel}';

            left: 20px;
        }
        &:after {
            content: '${(props) => props.offLabel}';

            right: 20px;
        }
    }

    label {
        z-index: 1;
        position: absolute;
        top: 10px;
        bottom: 10px;
        border-radius: ${borderRadius};
    }

    ${(props) =>
        props.switcherType === 'switcher-1' &&
        css`
            input:checked {
                background-color: var(--dark3);

                &:before {
                    color: ${props.isOn ? 'var(--text2)' : 'var(--text3)'};

                    transition: color 0.5s 0.2s;
                }
                &:after {
                    color: ${props.isOn ? 'var(--text2)' : 'var(--text3)'};
                    transition: color 0.5s;
                }
                & + label {
                    left: 10px;
                    right: 50%;
                    background: var(--dark2);
                    transition: left 0.5s, right 0.4s 0.2s;
                }
            }
            input:not(:checked) {
                background: var(--dark3);
                transition: background 0.5s -0.1s;
                &:before {
                    color: var(--text3);
                    transition: color 0.5s;
                }
                &:after {
                    color: var(--text1);
                    transition: color 0.5s 0.2s;
                }
                & + label {
                    left: 50%;
                    right: 10px;
                    background: var(--accent1);
                    transition: left 0.4s 0.2s, right 0.5s,
                        background 0.35s -0.1s;
                }
            }
        `}

    ${(props) =>
        props.switcherType === 'switcher-2' &&
        css`
            overflow: hidden;
            input {
                transition: background-color 0s 0.5s;

                &:before {
                    color: ${props.isOn ? 'var(--text2)' : 'var(--text1)'};
                }
                &:after {
                    color: ${props.isOn ? 'var(--text1)' : 'var(--text2)'};
                }
                &:checked {
                    background-color: var(--accent1);
                    & + label {
                        background: var(--accent1);
                        animation: ${switchOffAnimation} 0.5s ease-out;
                    }
                }
                &:not(:checked) {
                    background: var(--dark3);
                    & + label {
                        background: var(--dark3);
                        animation: ${switchAnimation} 0.5s ease-out;
                    }
                }
            }
            label {
                top: 0px;
                width: 50%;
                height: 100%;
                border-radius: ${borderRadius};
            }
        `}
`;

interface ButtonSwitchProps {
    fullSwitch?: boolean;
    onLabel: string; // Prop for the ON label
    offLabel: string; // Prop for the OFF label
    isOn: boolean;
    handleToggle:
        | MouseEventHandler<HTMLDivElement>
        | KeyboardEventHandler<HTMLDivElement>
        | undefined
        // eslint-disable-next-line
        | any;
    id: string;
}
const ButtonSwitch = (props: ButtonSwitchProps) => {
    const { fullSwitch, onLabel, offLabel, isOn, handleToggle, id } = props;
    const switchToShow = fullSwitch ? 'switcher-2' : 'switcher-1';

    return (
        <SwitchContainer
            switcherType={switchToShow}
            onLabel={onLabel}
            offLabel={offLabel}
            isOn={isOn}
            handleToggle={handleToggle}
            id={id}
        >
            <input
                type='checkbox'
                id={id}
                checked={isOn}
                onClick={handleToggle}
            />
            <label htmlFor={switchToShow}></label>
        </SwitchContainer>
    );
};

export default ButtonSwitch;
