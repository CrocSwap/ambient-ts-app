import { css } from 'styled-components';
export type AnimationProps = {
    animation?: 'flicker' | 'pulse' | undefined | '';
};

export const Animations = css<AnimationProps>`
    ${({ animation }) => {
        switch (animation) {
            case 'flicker':
                return FlickerAnimation;
            case 'pulse':
                return PulseAnimation;
            default:
                return '';
        }
    }}
`;

export const PulseAnimation = css`
    animation: shadow-pulse 1s 6;
    @keyframes shadow-pulse {
        0% {
            box-shadow: 0 0 0 0px rgba(131, 119, 220, 0.8);
            border-radius: var(--border-radius);
        }

        100% {
            box-shadow: 0 0 0 12px rgba(0, 0, 0, 0);
            border-radius: var(--border-radius);
        }
    }
`;

export const FlickerAnimation = css`
    animation: flicker 2s 3 alternate;
    @keyframes flicker {
        0%,
        18%,
        22%,
        25%,
        53%,
        57%,
        100% {
            text-shadow: 0 0 7px rgb(144, 132, 216), 0 0 10px rgb(86, 153, 212),
                0 0 21px rgb(83, 157, 222), 0 0 42px rgb(40, 160, 179),
                0 0 82px rgb(84, 91, 220), 0 0 92px rgb(67, 99, 175),
                0 0 102px rgb(75, 67, 213), 0 0 151px rgb(61, 108, 207);
        }
        20%,
        24%,
        55% {
            text-shadow: none;
        }
    }
`;
