import { LevelWrapper } from '../../../../../styled/Components/Header';

import UserProfileCard from '../UserProfileCard';
import { UserXpDataIF } from '../../../../../contexts/UserDataContext';
import UserLevelDisplay from '../../../../../components/Global/LevelsCard/UserLevelDisplay';
interface LevelDropdownPropsIF {
    ensName: string;
    accountAddress: string;
    handleCopyAddress: () => void;
    accountAddressFull: string;
    connectedUserXp?: UserXpDataIF;
}

export default function LevelDropdown(props: LevelDropdownPropsIF) {
    const { ensName, handleCopyAddress, connectedUserXp, accountAddressFull } =
        props;

    return (
        <LevelWrapper>
            <UserProfileCard
                ensName={ensName !== '' ? ensName : ''}
                accountAddress={props.accountAddress}
                handleCopyAddress={handleCopyAddress}
                accountAddressFull={props.accountAddressFull}
                padding='0 2rem'
            />

            <UserLevelDisplay
                currentLevel={connectedUserXp?.data?.currentLevel}
                globalPoints={connectedUserXp?.data?.globalPoints}
                user={ensName ?? accountAddressFull}
            />
        </LevelWrapper>
    );
}
