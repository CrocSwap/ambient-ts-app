import { useState } from 'react';

export const useSidebar = () => {
    console.log('called custom hook useSidebar()');
    const [sidebar, setSidebar] = useState(
        JSON.parse(localStorage.getItem('user') as string).sidebar ?? 'open'
    );
    false && sidebar;
    false && setSidebar;
}