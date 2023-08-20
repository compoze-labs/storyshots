import React from "react";
import { Meta, StoryObj } from "@storybook/react";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Example/Animated"
} as Meta;

type Story = StoryObj
export const AnimatedInCircle: Story = {
  render: () => {
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [angle, setAngle] = React.useState(0);
    const [radius] = React.useState(100);
    React.useEffect(() => {
      const interval = setInterval(() => {
        setAngle(angle + 1);
        setPosition({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        });
      }, 1);
      return () => clearInterval(interval);
    }, [angle, radius]);
  
    return (
      <div
        style={{
          width: "400px",
          height: "400px",
          backgroundColor: "white",
          position: "relative"
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            backgroundColor: "red",
            position: "absolute",
            left: `calc(50% + ${position.x}px)`,
            top: `calc(50% + ${position.y}px)`
          }}
        />
      </div>
    );
  }
}