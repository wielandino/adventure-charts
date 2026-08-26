import type { ReactNode, SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

function Icon({ size = 18, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  )
}

export function LinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M8 16 5.6 18.4a3 3 0 0 1-4.24-4.24L4 11.75" />
      <path d="M16 8l2.4-2.4a3 3 0 0 1 4.24 4.24L20 12.25" />
    </Icon>
  )
}

export function UnlinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7.5 16 5.6 17.9a3 3 0 0 1-4.24-4.24L3.3 11.7" />
      <path d="M16.5 8 18.4 6.1a3 3 0 0 1 4.24 4.24L20.7 12.3" />
      <path d="M9 15 15 9" strokeDasharray="2.5 2.5" />
    </Icon>
  )
}

export function WarningIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <path d="M10 11v6M14 11v6" />
    </Icon>
  )
}

export function SunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
    </Icon>
  )
}

export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />
    </Icon>
  )
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </Icon>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  )
}

export function SaveIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 4h11.5L20 7.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M8 4v5h7V4" />
      <path d="M7.5 14h9v6h-9z" />
    </Icon>
  )
}

export function NotesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 3.5h9l3 3V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14.5 3.5V7h3.5" />
      <path d="M8 12h8M8 15.5h8M8 8.5h4" />
    </Icon>
  )
}

export function CompassIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 6-4-1 2-6z" />
    </Icon>
  )
}

export function EyeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  )
}

export function EyeOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 12s3.6-7 10-7c1.9 0 3.5.5 4.9 1.3M22 12s-3.6 7-10 7c-1.9 0-3.5-.5-4.9-1.3" />
      <path d="M9.5 9.5a3 3 0 0 0 4.2 4.2" />
      <path d="M3 3l18 18" />
    </Icon>
  )
}

export function GroupIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" strokeDasharray="3 3" />
    </Icon>
  )
}

export function TagIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20.5 12.4 12.6 20.3a1.5 1.5 0 0 1-2.12 0l-6.78-6.78a1.5 1.5 0 0 1 0-2.12L11.6 3.5H19a1.5 1.5 0 0 1 1.5 1.5v7.4Z" />
      <circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" />
    </Icon>
  )
}
