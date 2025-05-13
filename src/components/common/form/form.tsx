import type { FC, PropsWithChildren, HTMLAttributes } from 'react'
import clsx from 'clsx/lite'

interface FormLabelProps extends HTMLAttributes<HTMLLabelElement> {
  label: string
}

export const FormLabel: FC<PropsWithChildren<FormLabelProps>> = ({
  label,
  children,
  className,
  ...props
}) => {
  return (
    <label className={clsx('flex flex-col gap-1', className)} {...props}>
      <span className='font-bold lg:text-lg'>{label}</span>
      {children}
    </label>
  )
}
