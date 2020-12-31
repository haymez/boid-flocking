import React, { FC } from 'react'

const css = require('./styles.scss')

interface OwnProps {
  children: React.ReactNode
  onClick: () => void
}

const Button: FC<OwnProps> = ({ children, onClick }: OwnProps) => {
  return (
    <button onClick={onClick} className={css.container}>
      {children}
    </button>
  )
}

export default Button
