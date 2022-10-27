import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

// interface for props
interface PoolInfoPropsIF {
    foo: boolean;
}

// react functional component
export default function PoolInfo(props: PoolInfoPropsIF) {
    const { foo } = props;

    console.log({ foo });

    const tradeData = useAppSelector((state) => state.tradeData);

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;

    return (
        <main>
            <p>{baseTokenAddress}</p>
            <p>{quoteTokenAddress}</p>
        </main>
    );
}
