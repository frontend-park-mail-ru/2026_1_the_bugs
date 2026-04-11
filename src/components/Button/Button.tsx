import type { JSXElementType } from "the-react"
import styles from "./Button.module.css"

type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'none' | 'menu'
type ButtonType = 'button' | 'submit' | 'reset'
type IconPosition = 'left' | 'right'
type ButtonShape = 'default' | 'round'

interface ButtonProps {
    children?: JSXElementType | string | (JSXElementType | string)[]
    text?: string
    icon?: JSXElementType
    iconPosition?: IconPosition
    variant?: ButtonVariant
    shape?: ButtonShape
    id?: string
    'aria-label'?: string
    'aria-hidden'?: boolean
    className?: string
    style?: Record<string, string | number>
    tabIndex?: number
    disabled?: boolean
    type?: ButtonType
    onClick?: (e: any) => void
    [key: string]: any
}

/** Универсальная кнопка проекта с тремя визуальными вариантами. */
export const Button = ({
    children,
    text,
    icon,
    iconPosition = 'left',
    variant = 'primary',
    shape = 'default',
    id,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    className = '',
    style,
    tabIndex,
    disabled = false,
    type = 'button',
    onClick,
    ...restProps
}: ButtonProps) => {
    const content = children ?? text
    const isMenuVariant = variant === 'menu'
    const classes = [styles.button, styles[variant], shape === 'round' ? styles.round : '', className].filter(Boolean).join(' ')

    return (
        <button
            id={id}
            aria-label={ariaLabel}
            aria-hidden={ariaHidden}
            className={classes}
            style={style}
            tabIndex={tabIndex}
            type={type}
            disabled={disabled}
            onClick={onClick}
            {...restProps}
        >
            {icon && iconPosition === 'left' ? <span className={styles.icon}>{icon}</span> : null}
            {isMenuVariant ? content : content ? <span className={styles.label}>{content}</span> : null}
            {icon && iconPosition === 'right' ? <span className={styles.icon}>{icon}</span> : null}
        </button>
    )
}