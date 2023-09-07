import { ButtonBase } from './Button.styles';

interface propsIF {
    disabled?: boolean;
    title: string;
    action: () => void;
    flat?: boolean;
    customAriaLabel?: string;
}

export default function Toggle(props: propsIF) {
    const { disabled, action, title, flat, customAriaLabel } = props;

    const ariaLabelToDisplay = disabled
        ? `Button is disabled. ${title}`
        : customAriaLabel
        ? customAriaLabel
        : '';
    return (
        <ButtonBase
            onClick={action}
            disabled={disabled}
            aria-label={ariaLabelToDisplay}
            tabIndex={0}
            flat={!!flat}
        >
            {title}
        </ButtonBase>
    );
}
