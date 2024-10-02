import React, { useState } from 'react';
import SwipeableViews from 'react-swipeable-views';

const SwipeTabs = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleChangeIndex = (index:number) => {
    setActiveIndex(index);
  };

  return (
    <div>
      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <div
          style={activeIndex === 0 ? styles.activeTab : styles.tab}
          onClick={() => setActiveIndex(0)}
        >
          Tab 1
        </div>
        <div
          style={activeIndex === 1 ? styles.activeTab : styles.tab}
          onClick={() => setActiveIndex(1)}
        >
          Tab 2
        </div>
        <div
          style={activeIndex === 2 ? styles.activeTab : styles.tab}
          onClick={() => setActiveIndex(2)}
        >
          Tab 3
        </div>
      </div>

      {/* Swipeable views */}
      <SwipeableViews index={activeIndex} onChangeIndex={handleChangeIndex}>
        <div style={styles.slide}>
          <h2>Content for Tab 1</h2>
          <p>This is the content for the first tab.</p>
        </div>
        <div style={styles.slide}>
          <h2>Content for Tab 2</h2>
          <p>This is the content for the second tab.</p>
        </div>
        <div style={styles.slide}>
          <h2>Content for Tab 3</h2>
          <p>This is the content for the third tab.</p>
        </div>
      </SwipeableViews>
    </div>
  );
};

// Styles for the component
const styles = {
  tabsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '20px',
  },
  tab: {
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  activeTab: {
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: '2px solid #2196F3', // Highlight active tab
  },
  slide: {
    padding: '20px',
    minHeight: '100px',
    backgroundColor: '#f5f5f5',
  },
};

export default SwipeTabs;
