import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button";

function ChangesColorsUntilOneSecondPasses() {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => c + 1);
    }, 10);
    return () => clearInterval(interval);
  }, []);
  // change the color every 10ms until 0.5 second passes
  const color =
    count < 100 ? `rgb(${count * 3}, ${255 - (count * 3)}, ${(count % 10)})` : "black";
  return (
    <div
      style={{
        width: "400px",
        height: "400px",
        backgroundColor: color,
      }}
    />
  );
}

export default {
  title: "WaitForStable",
  component: ChangesColorsUntilOneSecondPasses,
} as Meta;

type Story = StoryObj<typeof Button>;

export const WaitForStable: Story = {
  render: () => <ChangesColorsUntilOneSecondPasses />,
};
