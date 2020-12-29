import React, { FC } from 'react'

interface OwnProps {
  title: string
  subtitle: string
}

const css = require('./styles.scss')

const SomeComponent: FC<OwnProps> = ({ title, subtitle }: OwnProps) => {
  return (
    <div className={css.container}>
      <div className={css.title}>{title}</div>
      <div className={css.subtitle}>{subtitle}</div>
    </div>
  )
}

export default SomeComponent
