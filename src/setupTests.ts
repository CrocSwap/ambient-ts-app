// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

window.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | null;

  readonly rootMargin: string;

  readonly thresholds: ReadonlyArray<number>;

  constructor() {
    this.root = null;
    this.rootMargin = '';
    this.thresholds = [];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnect() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  observe() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unobserve() {}
};

// jest.mock('@rive-app/canvas', () => ({
//   Rive: jest.fn().mockImplementation(() => ({
//     on: jest.fn(),
//     stop: jest.fn(),
//   })),
//   Layout: jest.fn(),
//   Fit: {
//     Cover: 'cover',
//   },
//   Alignment: {
//     Center: 'center',
//   },
//   EventType: {
//     Load: 'load',
//   },
//   StateMachineInputType: {
//     Number: 1,
//     Boolean: 2,
//     Trigger: 3,
//   },
// }));
