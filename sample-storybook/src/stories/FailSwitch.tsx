import React from 'react'

interface FailSwitchProps {
  fail?: boolean
}

export const FailSwitch = ({
  fail = false,
}: FailSwitchProps) => {
  if (fail) {
    throw new Error('FailSwitch was forced to fail.')
  }

  return (
    <p>Hello</p>
  )
}
