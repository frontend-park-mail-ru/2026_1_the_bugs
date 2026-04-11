import type { JSXElementType } from "the-react"
import styles from "./Button.module.css"

type ButtonVariant = 'primary' | 'accent' | 'secondary'
type ButtonType = 'button' | 'submit' | 'reset'
type IconPosition = 'left' | 'right'

interface ButtonProps {
    children?: JSXElementType | string
    text?: string
    icon?: JSXElementType
    iconPosition?: IconPosition
    variant?: ButtonVariant
    id?: string
    'aria-label'?: string
    className?: string
    disabled?: boolean
    type?: ButtonType
    onClick?: () => void
}

/** Универсальная кнопка проекта с тремя визуальными вариантами. */
export const Button = ({
    children,
    text,
    icon,
    iconPosition = 'left',
    variant = 'primary',
    id,
    'aria-label': ariaLabel,
    className = '',
    disabled = false,
    type = 'button',
    onClick,
}: ButtonProps) => {
    const content = children ?? text
    const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ')

    return (
        <button id={id} aria-label={ariaLabel} className={classes} type={type} disabled={disabled} onClick={onClick}>
            {icon && iconPosition === 'left' ? <span className={styles.icon}>{icon}</span> : null}
            {content ? <span className={styles.label}>{content}</span> : null}
            {icon && iconPosition === 'right' ? <span className={styles.icon}>{icon}</span> : null}
        </button>
    )
}