// import { useContext } from 'react';
// import { BrandContext } from '../../contexts/BrandContext';

import { useState } from 'react';
import SwipeableTabs from '../../TestPage/SwipeableTabs';

export default function TestPage() {
    const [activeTab, setActiveTab] = useState(0);

    const tabData = [
        { label: 'Trade', content: <div>Content for Trade</div> },
        { label: 'Explore', content: <div>Content for Explore</div> },
        { label: 'Account', content: <div>Content for Account</div> },
        { label: 'Chat', content: <div>Content for Chat</div> },
    ];

    return (
        <div>
            {/* Control buttons in another component */}
            <div>
                <button onClick={() => setActiveTab(0)}>Go to Trade</button>
                <button onClick={() => setActiveTab(1)}>Go to Explore</button>
                <button onClick={() => setActiveTab(2)}>Go to Account</button>
                <button onClick={() => setActiveTab(3)}>Go to Chat</button>
            </div>

            {/* Pass activeTab and setActiveTab to SwipeableTabs */}
            <SwipeableTabs
                tabs={tabData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
        </div>
    );
}
