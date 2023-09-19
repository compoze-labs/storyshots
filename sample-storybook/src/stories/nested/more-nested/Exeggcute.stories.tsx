import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { Exeggcute } from './Exeggcute';

export default {
  title: 'Example/Nested/MoreNested/Exeggcute',
  component: Exeggcute,
} as Meta;

type Story = StoryObj<typeof Exeggcute>

export const Example: Story = {
  render: () => <Exeggcute />,
}
