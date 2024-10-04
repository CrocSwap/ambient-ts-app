// import { useContext } from 'react';
// import { BrandContext } from '../../contexts/BrandContext';
import { useSwipeable } from 'react-swipeable';

export default function TestPage() {
    const showSidebar = () => {
        alert('Sidebar is shown!');
      };
    
      const handlers = useSwipeable({
        onSwipedLeft: () => console.log('Swiped left!'),
        onSwipedRight: () => showSidebar(),
        onSwiping: (eventData) => {
          if (eventData.event.cancelable) {
            eventData.event.preventDefault();  // Accessing the native event to prevent default behavior
          }
        },
        trackMouse: true, // Enables swipe detection with mouse as well
      });
    
      return (
        <div {...handlers} className="swipe-container">
              <h2>Swipe to open the sidebar</h2>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cupiditate recusandae laborum pariatur quos, deleniti blanditiis qui porro molestias aspernatur necessitatibus accusantium nisi alias earum, animi asperiores doloribus voluptate repudiandae. Doloribus tenetur laboriosam in aspernatur, dolorem modi, blanditiis id, temporibus sint facilis quaerat aliquam eos quo quidem corrupti velit dignissimos ratione.
        </div>
      );
    
}
