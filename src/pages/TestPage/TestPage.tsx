import { useEffect, useState } from 'react';
import TokenInputQuantity from '../../components/Global/TokenInput/TokenInputQuantity';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { LocalPairDataIF } from '../../utils/state/localPairDataSlice';
import LocalTokenSelect from '../../components/Global/LocalTokenSelect/LocalTokenSelect';
interface TokenSelectorProps {
    index: number;
    selectedTokens: (TokenIF | null)[];
    onTokenSelect: (index: number, token: TokenIF) => void;
}
export default function TestPage() {
    const [tokenModalOpen, setTokenModalOpen] = useState(false);
    const selectedToken: TokenIF = useAppSelector(
        (state) => state.soloTokenData.token,
    );

    const localPair: LocalPairDataIF = useAppSelector(
        (state) => state.localPairData,
    );
    const tokenA = localPair.tokens[0];
    const tokenB = localPair.tokens[1];
    console.log({ localPair });

    console.log({ tokenA });

    return (
        <section>
            <LocalTokenSelect
                tokenAorB={'A'}
                token={tokenA}
                setTokenModalOpen={setTokenModalOpen}
            />
            <p>Test page</p>
            <TokenInputQuantity
                label='Select Token'
                tokenAorB={'A'}
                value={'0'}
                handleTokenInputEvent={() => console.log('yes')}
                disable={false}
                token={tokenA}
                setTokenModalOpen={setTokenModalOpen}
                fieldId='select'
            />
            <TokenInputQuantity
                label='Select Token'
                tokenAorB={'B'}
                value={'0'}
                handleTokenInputEvent={() => console.log('yes')}
                disable={false}
                token={tokenB}
                setTokenModalOpen={setTokenModalOpen}
                fieldId='select'
            />
        </section>
    );
}
