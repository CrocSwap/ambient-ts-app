declare module 'react-swipeable-views' {
    import * as React from 'react';
  
    interface SwipeableViewsProps {
      index?: number;
      onChangeIndex?: (index: number, indexLatest: number) => void;
      children?: React.ReactNode;
      enableMouseEvents?: boolean;
      resistance?: boolean;
    }
  
    const SwipeableViews: React.ComponentType<SwipeableViewsProps>;
  
    export default SwipeableViews;
  }
  