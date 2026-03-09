import type { JSXElement } from "@my-react/types/jsx"

interface IButtonComponent {
    text: string
    icon: JSXElement
    contentType: 'Icon' | 'Left+Text' | 'Text+Right' | 'Text'
    kind: 'contained' | 'outlined' | 'ghost'
    view: 'primary' | 'secondary' | 'negative'
}

export const Button = (props: IButtonComponent) => {

    const {text, icon, contentType, kind,view} = props

    const s = 2

    return(
        <button className={`
        ${kind === 'ghost'}
        `}>
            {props}
        </button>
    )
}