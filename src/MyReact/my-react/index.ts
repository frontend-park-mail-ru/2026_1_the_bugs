import type {
    ComponentPropsType, 
    JSXElement, 
    JSXComponent, 
    JSXElementType, 
    KeyType
} from '../types/jsx'
import type {
    DOMElement,
    DOMTextNode
} from '../types/dom'

import {
    _setActiveInstance,
    _setActiveStateIndex
} from '../hooks/index'

/**
 * Обновляет атрибуты DOM-элемента согласно новой карте атрибутов JSX.
 * Сравнивает старые и новые атрибуты, удаляет устаревшие, добавляет новые,
 * обрабатывает события и специальные атрибуты (style, value).
 * @param repr - DOM-представление элемента.
 * @param newAttrs - Новые атрибуты из JSX-дерева.
 */
const patchAttributes = (repr: DOMElement, newAttrs: Map<string, any>) => {
    repr.attrs.forEach((_, k) => {
        if (!newAttrs.has(k)) {
            repr.attrs.delete(k);
            repr.elem.removeAttribute(k);
        }
    })

    repr.attrs.forEach((v, k) => {
        if (newAttrs.get(k) !== v) {
            repr.attrs.set(k, newAttrs.get(k))
            repr.elem.setAttribute(k, newAttrs.get(k));
        }
    })
    repr.eventListeners.forEach((l) => {
        repr.elem.removeEventListener(l.type, l.callback)
    })
    repr.eventListeners = []

    newAttrs.forEach((v, k) => {
        if (k.startsWith("on") && k[2] == k[2].toUpperCase()) {
            const typeEvent = k.slice("on".length).toLocaleLowerCase()
            repr.elem.addEventListener(typeEvent, v as () => void);
            repr.eventListeners.push({type: typeEvent, callback: v})
        } else if (k === "value" && repr.elem instanceof HTMLInputElement) {
            repr.elem.value = v;
            repr.attrs.set(k, v)
        } else if (k === "style" && typeof v === "object" && v !== null) {
            const oldStyle = repr.attrs.get("style") || {};
            for (const prop in oldStyle) {
                if (!(prop in v)) {
                    (repr.elem as any).style[prop] = "";
                }
            }
            Object.assign((repr.elem as any).style, v);
            repr.attrs.set(k, v);
        } else if(!repr.attrs.has(k)) {
            // Обычные атрибуты
            repr.attrs.set(k, v)
            repr.elem.setAttribute(k, v)
        }
    })
}

/** Массив очередей "грязных" компонентов по уровням глубины */
const dirtyInstances: Set<ComponentInstance<any>>[] = [];
let isUpdateScheduled = false;

/**
 * Глубокое сравнение двух значений с поддержкой функций и вложенных объектов.
 * @param val1 - Первое значение для сравнения.
 * @param val2 - Второе значение для сравнения.
 * @returns true если значения равны.
 */
function deepEqual(val1: any, val2: any): boolean {
    if (val1 === val2) return true;

    if (typeof val1 === 'function' && typeof val2 === 'function') {
        return true
    }

    if (val1 == null || val2 == null || typeof val1 !== 'object' || typeof val2 !== 'object') {
        return val1 === val2;
    }
    
    if (Array.isArray(val1) && Array.isArray(val2)) {
        if (val1.length !== val2.length) return false;
        for (let i = 0; i < val1.length; i++) {
            if (!deepEqual(val1[i], val2[i])) return false;
        }
        return true;
    }

    const keys1 = Object.keys(val1);
    const keys2 = Object.keys(val2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!Object.prototype.hasOwnProperty.call(val2, key) || !deepEqual(val1[key], val2[key])) {
            return false;
        }
    }
    return true;
}

/**
 * Помечает компонент как "грязный" для обновления и планирует raf-обновление.
 * @param instance - Компонент для обновления.
 */
export const markDirty = (instance: ComponentInstance<any>) => {
    while (dirtyInstances.length <= instance.depth) {
        dirtyInstances.push(new Set());
    }
    dirtyInstances[instance.depth].add(instance);
    if (!isUpdateScheduled) {
        window.requestAnimationFrame(() => {
            schedUpdate();
        })
    }
}

/**
 * Планировщик обновлений - обрабатывает "грязные" компоненты по уровням глубины.
 * Использует requestAnimationFrame для батчинга обновлений.
 */
const schedUpdate = () => {
    isUpdateScheduled = true;
    for (let i = 0; i < dirtyInstances.length; i++) {
        if (dirtyInstances[i].size === 0) {
            continue
        }
        dirtyInstances[i].forEach((instance) => {
            instance.update();
            dirtyInstances[i].delete(instance);
        });
        window.requestAnimationFrame(() => {
            schedUpdate();
        })
        return
    }
    
    isUpdateScheduled = false;
};

/**
 * Структура эффекта useEffect с зависимостями и cleanup функцией.
 */
type Effect = {
    execute: () => void | (() => void);
    deps?: any[];
    prevDeps?: any[];
    cleanup?: () => void;
};

/**
 * Экземпляр компонента React, управляющий жизненным циклом и DOM-патчингом.
 * Содержит VTree, состояние, эффекты, дочерние компоненты и DOM-представление.
 */
export class ComponentInstance<PropsType extends ComponentPropsType> {
    /** Функция рендера компонента */
    func: (props: PropsType) => any;
    /** Карта дочерних компонентов по ключам */
    instanceMap: Map<KeyType, ComponentInstance<any>>;
    /** DOM-представление корневого элемента */
    domElement: DOMElement | undefined;
    /** Виртуальное дерево JSX */
    vTree: JSXElement | undefined;
    /** Пропсы компонента */
    props: PropsType;
    /** Массив состояний useState */
    states: any[] = [];
    /** Уровень глубины в дереве компонентов */
    depth: number;
    /** Родительский компонент */
    parent: ComponentInstance<any> | undefined;
    /** Массив эффектов useEffect */
    effects: Effect[] = [];
    /** Индекс текущего эффекта */
    
    effectIndex: number = 0;     

    /**
     * Создает новый экземпляр компонента.
     * @param func - Функция рендера компонента.
     * @param props - Пропсы компонента.
     * @param parent - Родительский компонент.
     */
    constructor(
        func: (props: PropsType) => any, 
        props: PropsType, 
        parent: ComponentInstance<any> | undefined
    ) {
        this.func = func;
        this.props = props;
        this.instanceMap = new Map();
        this.parent = parent;
        this.depth = (parent?.depth ?? 1) + 1;

        this.update();
    }

    /** Полный цикл обновления компонента */
    update() {
        this.updateVTree();
        if (this.vTree !== null){
            this.patchInstances();
            this.patchDOMNodes();
            this.flushEffects();
        }else{
            this.destroy()
        }

    }

    /** Пересоздает виртуальное дерево JSX */
    updateVTree() {
        _setActiveInstance(this)
        _setActiveStateIndex(0)
        this.effectIndex = 0;
        this.vTree = this.func(this.props)
        _setActiveInstance(undefined)
    }

    /**
     * Извлекает виртуальные компоненты из JSX-дерева в карту.
     * @param branch - Текущая ветка JSX-дерева.
     * @param mapToAdd - Карта для добавления компонентов.
     */
    extractVirtualComponents(
        branch: JSXElement, 
        mapToAdd: Map<KeyType, JSXComponent<any>>
    ) {
        branch.children.forEach((ch) => {
            if (typeof ch === "string") {
                return;
            }
            if (ch === undefined || ch === null) {
                return;
            }
            if (ch.type == "element") {
                this.extractVirtualComponents(ch, mapToAdd)
            } else {
                if (ch.key !== undefined) {
                    mapToAdd.set(ch.key, ch);
                }
            }
        })
    }

    /** Синхронизирует дочерние компоненты с новым VTree */
    patchInstances() {
        if (this.vTree === undefined) {
            throw new Error("vTree is undefined")
        }
        const newInstanceMap = new Map<KeyType, JSXComponent<any>>();
        this.extractVirtualComponents(this.vTree, newInstanceMap);
        
        this.instanceMap.forEach((v, k) => {
            if (!newInstanceMap.has(k)) {
                v.destroy();
                this.instanceMap.delete(k);
            }
        });

        this.instanceMap.forEach((v, k) => {
            const newProps = (newInstanceMap.get(k) as JSXComponent<any>).props
            if (!deepEqual(v.props, newProps)) {
                v.props = newProps
                v.update();
            }
        });

        newInstanceMap.forEach((v, k) => {
            if (!this.instanceMap.has(k)) {
                this.instanceMap.set(k, new ComponentInstance<any>(v.func, v.props, this));
            }
        });
    }

    /** Выполняет эффекты useEffect с проверкой зависимостей */
    flushEffects() {
        for (const eff of this.effects) {
            if (!eff) continue;

            const depsChanged = 
                !eff.prevDeps ||
                eff.deps?.length !== eff.prevDeps.length ||
                eff.deps?.some((dep, i) => !deepEqual(dep, eff.prevDeps?.[i]));

            if (depsChanged) {
                if (eff.cleanup) {
                    eff.cleanup();
                }
                const cleanup = eff.execute();
                if (typeof cleanup === 'function') {
                    eff.cleanup = cleanup;
                } else {
                    eff.cleanup = undefined;
                }
                eff.prevDeps = eff.deps ? [...eff.deps] : undefined;
            }
        }
    }

    /** Патчит DOM согласно новому VTree */
    patchDOMNodes() {
        if (this.vTree === undefined) {
            throw new Error()
        }
        const parentElem = this.domElement?.elem.parentElement;
        if (this.domElement?.elem.tagName.toLowerCase() !== this.vTree.tagName) {
            const prevChild = this.domElement?.elem
            this.domElement = {
                type: "element",
                elem: document.createElement(this.vTree?.tagName),
                attrs: new Map<string, any>(),
                children: [],
                eventListeners: [],
            };
            
            if (parentElem) {
                parentElem.replaceChild(this.domElement.elem, prevChild as Node);
            }
        }
        patchAttributes(this.domElement, this.vTree.attributes)
        this.patchDOMNodesImpl(this.vTree.children, this.domElement.children, this.domElement.elem)
    }

    /**
     * Рекурсивно патчит DOM-дерево согласно JSX-ветке.
     * @param branch - Ветка JSX-дерева.
     * @param domRepr - DOM-представление.
     * @param parentElement - Родительский DOM-элемент.
     */
    patchDOMNodesImpl(
        branch: (JSXElementType | string)[], 
        domRepr: (DOMElement | DOMTextNode)[],
        parentElement: Element
    ) {
        let branchIndex = 0;
        let domReprIndex = 0;

        while(true) {
            if (branch.length <= branchIndex) {
                break;
            }
         
            const vNode = branch[branchIndex];
            if (vNode === null || vNode === undefined) {
                branchIndex++;
                continue;
            }
            if (typeof vNode !== "string" && vNode?.type === undefined) {
                branchIndex++;
                continue
            }

            if (typeof vNode !== "string" && vNode.type === "component") {
                const compInstance = this.instanceMap.get(vNode.key) as ComponentInstance<any>;
                const compDom = compInstance.domElement;
                if (!compDom) { 
                    branchIndex++;
                    continue
                }

                if (domReprIndex >= domRepr.length) {
                    domRepr.push(compDom);
                } else if (domRepr[domReprIndex] !== compDom) {
                    domRepr.splice(domReprIndex, 0, compDom);
                }

                const currentNode = parentElement.childNodes[domReprIndex];
                if (compDom.elem !== currentNode) {
                    if (currentNode) {
                        parentElement.insertBefore(compDom.elem, currentNode);
                    } else {
                        parentElement.appendChild(compDom.elem);
                    }
                }

                branchIndex++;
                domReprIndex++;
                continue;
            }
            if (domReprIndex >= domRepr.length) {
                if (typeof vNode !== "string") {
                    domRepr.push({
                        type: "element",
                        attrs: new Map(),
                        elem: document.createElement(vNode.tagName),
                        children: [],
                        eventListeners: [],
                    })
                } else {
                    domRepr.push({
                        type: "textNode",
                        text: vNode,
                        node: document.createTextNode(vNode),
                    });
                }
            }

            const domNode = domRepr[domReprIndex];
            
            if (typeof vNode === "string" && domNode.type === "element") {
                domNode.elem.parentElement?.removeChild(domNode.elem);
                domRepr.splice(domReprIndex, 1);
                continue;
            }
            
            if (typeof vNode !== "string" && domNode.type === "textNode") {
                domNode.node.parentElement?.removeChild(domNode.node);
                domRepr.splice(domReprIndex, 1)
                continue;
            }

            if (typeof vNode === "string" && domNode.type === "textNode") {
                domNode.node.textContent = vNode;
                const refNode = parentElement.childNodes[domReprIndex];
                if (refNode) {
                    parentElement.insertBefore(domNode.node, refNode);
                } else {
                    parentElement.appendChild(domNode.node);
                }
                branchIndex++;
                domReprIndex++;
                continue;
            }

            if (typeof vNode !== "string" && domNode.type !== "textNode") {
                let elemRepr = domNode
                if (domNode.elem.tagName.toLowerCase() !== vNode.tagName) {
                    const newElemRepr: DOMElement = {
                        type: "element", 
                        attrs: new Map(),
                        elem: document.createElement(vNode.tagName),
                        children: [],
                        eventListeners: []
                    }
                    if (domNode.elem.parentElement === parentElement) {
                        parentElement.insertBefore(newElemRepr.elem, domNode.elem);
                    } else {
                        parentElement.appendChild(newElemRepr.elem);
                    }
                    domRepr.splice(domReprIndex, 0, newElemRepr);
                    elemRepr = newElemRepr
                }
                patchAttributes(elemRepr, vNode.attributes)
                const currentNode = parentElement.childNodes[domReprIndex];
                if (elemRepr.elem !== currentNode) {
                    if (currentNode) {
                        parentElement.insertBefore(elemRepr.elem, currentNode);
                    } else {
                        parentElement.appendChild(elemRepr.elem);
                    }
                }
                
                this.patchDOMNodesImpl(vNode.children, elemRepr.children, elemRepr.elem)
                branchIndex++;
                domReprIndex++;
            }
        }

        while(domRepr.length > domReprIndex) {
            const r = domRepr[domReprIndex]
            if (r.type === "element") {
                r.elem.parentElement?.removeChild(r.elem);
            } else {
                r.node.parentElement?.removeChild(r.node);
            }
            domRepr.splice(domReprIndex, 1);
        }
    }

    /** Разрушает компонент и все дочерние */
    destroy() {
        for (const eff of this.effects) {
            if (eff?.cleanup) {
                eff.cleanup();
            }
        }
        this.instanceMap.forEach((v) => {
            v.destroy();
        });
        this.instanceMap.clear()
        if (this.domElement?.elem.parentElement !== null) {
            this.domElement?.elem.parentElement.removeChild(this.domElement.elem);
        }
        this.domElement = undefined;
    }
}

/**
 * Создает React-приложение и монтирует его в DOM-элемент.
 * @param elem - Контейнер DOM-элемент.
 * @param fn - Функция рендера корневого компонента.
 */
const createApp = (elem: Element, fn: () => JSXElementType) => {
    const inst = new ComponentInstance<any>(fn, {}, undefined);
    elem.appendChild(inst.domElement?.elem as Node);
}

export { createApp };
