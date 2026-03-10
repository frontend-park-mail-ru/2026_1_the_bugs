import type {
    ChildrenType, 
    NormalizedChildrenType, 
    ComponentPropsType, 
    JSX, 
    JSXElement, 
    JSXElementType
} from "./../types/jsx"

/**
 * Нормализует children в плоский массив JSX-элементов и строк.
 * Преобразует undefined → [], одиночные элементы → [element], массивы → flat().
 * @param children - Исходные children из JSX.
 * @returns Нормализованный массив для reconciler'а.
 */
const normalizedChildren = (children: ChildrenType): NormalizedChildrenType => {
    if (children === undefined) {
        return []
    }
    if (!Array.isArray(children)) {
        return [children]
    }
    return children.flat()
}

/**
 * Основная функция создания JSX-элементов и компонентов (jsx).
 * Поддерживает создание DOM-элементов (string tag) и компонентов (function).
 * Автоматически нормализует children и преобразует атрибуты.
 * 
 * @param type - Тип элемента: string (div, span) или функция-компонент.
 * @param props - Пропсы элемента/компонента + опциональные children.
 * @param key - Уникальный ключ для reconciler'а (опционально).
 * @returns JSXElement (DOM) или JSXComponent (компонент).
 * 
 * @example Создание DOM-элемента:
 * ```ts
 * jsx('div', { className: 'container', children: 'Hello' }, 'unique-key')
 * // → { type: 'element', tagName: 'div', attributes: Map, children: ['Hello'] }
 * ```
 * 
 * @example Создание компонента:
 * ```ts
 * const MyButton = (props) => jsx('button', props);
 * jsx(MyButton, { text: 'Click me' }, 'btn-1')
 * // → { type: 'component', func: MyButton, props, key: 'btn-1' }
 * ```
 */
function jsx<PropsType extends ComponentPropsType>(
    type: string | ((props: PropsType) => any),
    props: PropsType & { children?: ChildrenType },
    key: string | undefined
): JSXElementType {
    if (typeof type === 'string') {
        // Создаем DOM-элемент (div, span, button)
        const attributes = new Map<string, any>();
        Object.entries(props).forEach(([k, v]) => {
            if (k !== "children") {
                if (k === "disabled" && !v) {
                    return
                }
                if (k === "className") {
                    attributes.set("class", v)
                } else {
                    attributes.set(k, v)
                }
            }
        })
        return {
            type: "element",
            tagName: type,
            attributes: attributes,
            children: normalizedChildren(props.children)
        } as JSXElement
    } else {
        // Создаем компонент
        if (key === undefined) {
            key = props.key as string
        }
        return {
            type: "component",
            key: key,
            func: type,
            props,
            children: normalizedChildren(props.children)
        }
    }
}

/** Экспорт JSX namespace для глобальной типизации */
export type { JSX };

/** Основная JSX функция и её алиас */
export { jsx, jsx as jsxs };
