import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

export default {
  title: 'Example/Button',
  component: Button,
} as Meta;

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  render: () => <Button label="Button" primary={true} />,
}

export const Secondary: Story = {
  render: () => <Button label="Button" primary={false} />,
}

export const Large: Story = {
  render: () => <Button label="Button" size="large" />,
}

export const Small: Story = {
  render: () => <Button label="Button" size="small" />,
}
