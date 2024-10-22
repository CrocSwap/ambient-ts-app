import { memo } from 'react';
import { Navigate, useParams } from 'react-router-dom';

function Vanity() {
    const { params } = useParams();

    let destination = '/';

    switch (params) {
        case 'SCRETH':
            destination =
                '/trade/market/chain=0x82750&tokenA=0x0000000000000000000000000000000000000000&tokenB=0xd29687c813d741e2f938f4ac377128810e217b1b';
            break;
        case 'ETHSCR':
            destination =
                '/trade/market/chain=0x82750&tokenA=0x0000000000000000000000000000000000000000&tokenB=0xd29687c813d741e2f938f4ac377128810e217b1b';
            break;
    }

    return <Navigate to={destination} replace />;
}

export default memo(Vanity);
