import Button from '../../Global/Button/Button';

interface IRemoveRangeButtonProps {
    removeFn: () => void;
}

export default function RemoveRangeButton(props: IRemoveRangeButtonProps) {
    const { removeFn } = props;

    return (
        <div>
            <Button title='Remove Liquidity' disabled={false} action={removeFn} />
        </div>
    );
}
