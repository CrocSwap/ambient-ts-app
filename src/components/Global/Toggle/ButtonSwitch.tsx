import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import PropTypes from 'prop-types';

// Define your colors
const colors = {
    black: '#1E1E1E',
    grey: '#CCCCCC',
    white: '#FFFFCE',
    accent: '#yourAccentColorHere',
};

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
interface SwitchContainerProps {
    switcherType: 'switcher-1' | 'switcher-2'; // Define the type here
    onLabel: string; // Prop for the ON label
    offLabel: string; // Prop for the OFF label
}
const SwitchContainer = styled.span<SwitchContainerProps>`
    position: relative;
    width: 100%;
    height: 50px;
    border-radius: 25px;
    margin: 20px 0;

    input {
        appearance: none;
        position: relative;
        width: 100%;
        height: 50px;
        border-radius: 25px;
        background-color: var(--dark3);
        outline: none;

        &:before,
        &:after {
            z-index: 2;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            color: red;
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
        border-radius: 20px;
    }

    ${(props) =>
        props.switcherType === 'switcher-1' &&
        css`
            input:checked {
                background-color: var(--dark3);
                &:before {
                    color: var(--text3);
                    transition: color 0.5s 0.2s;
                }
                &:after {
                    color: var(--text1);
                    transition: color 0.5s;
                }
                & + label {
                    left: 10px;
                    right: 100px;
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
                    left: 100px;
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
                    color: ${colors.black};
                }
                &:after {
                    color: ${colors.white};
                }
                &:checked {
                    background-color: ${colors.white};
                    & + label {
                        background: ${colors.white};
                        animation: ${switchAnimation} 0.5s ease-out;
                    }
                }
                &:not(:checked) {
                    background: ${colors.black};
                    & + label {
                        background: ${colors.black};
                        animation: ${switchOffAnimation} 0.5s ease-out;
                    }
                }
            }
            label {
                top: 0px;
                width: 200px;
                height: 50px;
                border-radius: 25px;
            }
        `}
`;

interface ButtonSwitchProps {
    fullSwitch?: boolean;
    onLabel: string; // Prop for the ON label
    offLabel: string; // Prop for the OFF label
}
const ButtonSwitch = (props: ButtonSwitchProps) => {
    const { fullSwitch, onLabel, offLabel } = props;
    const switchToShow = fullSwitch ? 'switcher-2' : 'switcher-1';

    return (
        <SwitchContainer
            switcherType={switchToShow}
            onLabel={onLabel}
            offLabel={offLabel}
        >
            <input type='checkbox' id={switchToShow} />
            <label htmlFor={switchToShow}></label>
        </SwitchContainer>
    );
};

export default ButtonSwitch;
