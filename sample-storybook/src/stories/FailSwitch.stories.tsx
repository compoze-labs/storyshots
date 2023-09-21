import React from 'react'
import { Meta, StoryObj } from '@storybook/react'

import { FailSwitch } from './FailSwitch'

export default {
  title: 'Example/FailSwitch',
  component: FailSwitch,
} as Meta

type Story = StoryObj<typeof FailSwitch>

export const Example: Story = {
  render: () => <FailSwitch />,
}
