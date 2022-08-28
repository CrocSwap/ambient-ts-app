import Button from '../../Global/Button/Button';

interface IRemoveRangeButtonProps {
    removalPercentage: number;
}

export default function RemoveRangeButton(props: IRemoveRangeButtonProps) {
    const { removalPercentage } = props;

    return (
        <div>
            <Button
                title='Remove Liquidity'
                action={() => console.log(`${removalPercentage}% to be removed.`)}
            />
        </div>
    );
}
