/**
 * Представление DOM-элемента в виртуальном DOM.
 * Содержит реальный DOM-узел, атрибуты, дочерние элементы и обработчики событий.
 */
export interface DOMElement {
    /** Тип узла */
    type: "element";
    /** Реальный DOM-элемент браузера */
    elem: Element;
    /** Карта атрибутов элемента (ключ-значение) */
    attrs: Map<string, any>;
    /** Массив дочерних DOM-узлов */
    children: (DOMElement | DOMTextNode)[];
    /** Массив обработчиков событий элемента */
    eventListeners: { type: string; callback: () => void; }[];
}

/**
 * Представление текстового DOM-узла в виртуальном DOM.
 * Используется для рендера строкового контента между элементами.
 */
export interface DOMTextNode {
    /** Тип узла */
    type: "textNode";
    /** Текстовое содержимое */
    text: string;
    /** Реальный DOM текстовый узел */
    node: Node;
}
