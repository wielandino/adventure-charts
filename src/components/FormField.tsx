import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  children: ReactNode
  /**
   * Native <label> elements forward clicks anywhere inside them to the first
   * labelable descendant. That's desired for simple controls (input/select/
   * textarea) but breaks composite widgets with their own internal trigger
   * button + popover (e.g. ColorPicker): every click inside the popover also
   * re-fires the trigger button's click, toggling it shut. Pass as="div" for
   * those fields to opt out of implicit label association.
   */
  as?: 'label' | 'div'
}

export function FormField({ label, children, as = 'label' }: FormFieldProps) {
  const Tag = as
  return (
    <Tag className="node-inspector-field">
      <span>{label}</span>
      {children}
    </Tag>
  )
}
