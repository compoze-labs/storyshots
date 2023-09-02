import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

export default {
  title: 'BigBox',
} as Meta;

type Story = StoryObj<typeof Button>

export const ABigBox: Story = {
  render: () => 
    <div style={{
        width: "400px",
        height: "400px",
        backgroundColor: "black",
      }} 
    />,
}