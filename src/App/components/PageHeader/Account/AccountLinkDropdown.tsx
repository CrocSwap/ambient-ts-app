import { Link } from 'react-router-dom';
import { AccountDropdownWrapper } from '../../../../styled/Components/Header';
import { Text } from '../../../../styled/Common';

export default function AccountLinkDropdown() {
    return (
        <AccountDropdownWrapper>
            <Link to='account' style={{ cursor: 'pointer' }}>
                <Text
                    color={location.pathname === '/account' ? 'text1' : 'text2'}
                >
                    My Portfolio
                </Text>
            </Link>
            <Link to='account/xp' style={{ cursor: 'pointer' }}>
                <Text
                    color={
                        location.pathname === '/account/xp' ? 'text1' : 'text2'
                    }
                >
                    My XP
                </Text>
            </Link>
            <Link to='account/ranks' style={{ cursor: 'pointer' }}>
                <Text
                    color={
                        location.pathname === '/account/ranks'
                            ? 'text1'
                            : 'text2'
                    }
                >
                    Ranks
                </Text>
            </Link>
        </AccountDropdownWrapper>
    );
}
