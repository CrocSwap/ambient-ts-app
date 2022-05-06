import { useRive, useStateMachineInput } from '@rive-app/react-canvas';

export default function HamburgerMenuIcon() {
  const { rive, RiveComponent } = useRive({
    // src: 'https://cdn.rive.app/animations/vehicles.riv',
    src: 'hamburger.riv',
    stateMachines: 'Basic State Machine',
    autoplay: true,
  });

  const switchInput = useStateMachineInput(
    rive,
    'Basic State Machine',
    'Switch'
  );

  return (
    <RiveComponent
      style={{ height: '50px' }}
      onClick={() => switchInput && switchInput.fire()}
    />
  );
}
