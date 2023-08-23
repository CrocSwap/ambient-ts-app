import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import PropTypes from 'prop-types';

// Define your colors
const colors = {
    black: '#1E1E1E',
    grey: '#CCCCCC',
    white: '#FFFFFF',
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
}
const SwitchContainer = styled.span<SwitchContainerProps>`
    position: relative;
    width: 200px;
    height: 50px;
    border-radius: 25px;
    margin: 20px 0;

    input {
        appearance: none;
        position: relative;
        width: 200px;
        height: 50px;
        border-radius: 25px;
        background-color: ${colors.black};
        outline: none;
        font-family: 'Oswald', sans-serif;

        &:before,
        &:after {
            z-index: 2;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            color: ${colors.white};
        }
        &:before {
            content: 'ON';
            left: 20px;
        }
        &:after {
            content: 'OFF';
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
                background-color: ${colors.white};
                &:before {
                    color: ${colors.white};
                    transition: color 0.5s 0.2s;
                }
                &:after {
                    color: ${colors.grey};
                    transition: color 0.5s;
                }
                & + label {
                    left: 10px;
                    right: 100px;
                    background: ${colors.black};
                    transition: left 0.5s, right 0.4s 0.2s;
                }
            }
            input:not(:checked) {
                background: ${colors.black};
                transition: background 0.5s -0.1s;
                &:before {
                    color: ${colors.grey};
                    transition: color 0.5s;
                }
                &:after {
                    color: ${colors.black};
                    transition: color 0.5s 0.2s;
                }
                & + label {
                    left: 100px;
                    right: 10px;
                    background: ${colors.white};
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
}
const ButtonSwitch = (props: ButtonSwitchProps) => {
    const { fullSwitch } = props;
    const switchToShow = fullSwitch ? 'switcher-2' : 'switcher-1';

    return (
        <SwitchContainer switcherType={switchToShow}>
            <input type='checkbox' id={switchToShow} />
            <label htmlFor={switchToShow}></label>
        </SwitchContainer>
    );
};

export default ButtonSwitch;
