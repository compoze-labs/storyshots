import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';

export default {
  title: 'Example/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

type Story = StoryObj<typeof Header>

export const LoggedIn: Story = {
  render: () => <Header onCreateAccount={() => {}} user={{ name: 'Jane Doe' }} onLogin={() => {}} onLogout={() => {}} />,
};

export const LoggedOut: Story = {
  render: () => <Header onCreateAccount={() => {}} onLogin={() => {}} onLogout={() => {}} />,
};