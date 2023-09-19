import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { Egg } from './Egg';

export default {
  title: 'Example/Nested/Egg',
  component: Egg,
} as Meta;

type Story = StoryObj<typeof Egg>

export const Example: Story = {
  render: () => <Egg />,
}
