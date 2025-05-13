import type { FC, PropsWithChildren, HTMLAttributes } from 'react'

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
    <label className={className} {...props}>
      <span className='font-bold'>{label}</span>

      {children}
    </label>
  )
}
