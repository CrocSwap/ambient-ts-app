This is an extremely reusable component so it requires a few things to work accordingly.

1. Create a local state in the parent component that represents a value of On or Off.
   Ex: const [isChecked, setIsChecked] = useState(false);

2. The Toggle component takes a prop of isOn. Assign that prop to the local state value.
   Ex: <Toggle isOn={isChecked} />

3. The Toggle component takes a function as prop for handleToggle. HandleToggle simply toggles between the state values.
   Ex: <Toggle handleToggle={() => setIsChecked(!isChecked)} />

4. Since this is a reusable component, we can assign a color for the "On Value". (Usecase: Deleting something should be red)
   Ex: <Toggle onColor="#EF476f" />

5. Lasty, the Toggle component is easily resizeable. Pass in a NUMBER value as "Width" and everything else will be calculated.
   Ex: <Toggle Width={50} />

Full example of Toggle component: <Toggle isOn={isChecked} handleToggle={() => setIsChecked(!isChecked)} onColor="#EF476f" Width={50} />
