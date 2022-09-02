import Button from '../../Global/Button/Button';

interface IRemoveRangeButtonProps {
    removeFn: () => void;
    disabled?: boolean;
}

export default function RemoveRangeButton(props: IRemoveRangeButtonProps) {
    const { removeFn } = props;

    return (
        <div>
            <Button title='Remove Liquidity' disabled={props.disabled} action={removeFn} />
        </div>
    );
}
