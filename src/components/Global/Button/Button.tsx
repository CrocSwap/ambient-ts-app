import { ButtonBase } from './Button.styles';

interface propsIF {
    disabled?: boolean;
    title: string;
    action: () => void;
    flat?: boolean;
    customAriaLabel?: string;
    width?: string;
}

export default function Toggle(props: propsIF) {
    const { disabled, action, title, flat, customAriaLabel, width } = props;

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
            width={width || '100%'}
        >
            {title}
        </ButtonBase>
    );
}
