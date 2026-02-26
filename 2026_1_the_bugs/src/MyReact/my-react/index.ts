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
}from '../types/dom'

import {
    _setActiveInstance,
    _setActiveStateIndex
} from '../hooks/index'

const patchAttributes = (repr: DOMElement, newAttrs: Map<string, any>)=>{
    repr.attrs.forEach((_, k)=>{
        if (!newAttrs.has(k)){
            repr.attrs.delete(k);
            repr.elem.removeAttribute(k);
        }
    })

    repr.attrs.forEach(
        (v, k)=>{
            if (newAttrs.get(k) !== v){
                repr.elem.setAttribute(k, newAttrs.get(k));
            }
        }
    )
    repr.eventListeners.forEach((l)=>{
        repr.elem.removeEventListener(l.type, l.callback)
    })
    repr.eventListeners = []

    newAttrs.forEach((v, k)=>{
        if (k.startsWith("on_")){
            const typeEvent = k.slice("on_".length)
            repr.elem.addEventListener(typeEvent, v as ()=>void);
            repr.eventListeners.push({type: typeEvent, callback: v})
        }else if(!repr.attrs.has(k)){
            repr.elem.setAttribute(k, v)
        }
    })
}

const dirtyInstances: Set<ComponentInstance<any>> [] = [];
let isUpdateScheduled = false;

function deepEqual(val1: any, val2: any): boolean{
  if (val1 === val2) return true;

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

export const markDirty = (instance: ComponentInstance<any> ) =>{
    while (dirtyInstances.length <= instance.depth){
        dirtyInstances.push(new Set());
    }
    dirtyInstances[instance.depth].add(instance);
    if (!isUpdateScheduled){
        window.requestAnimationFrame(()=>{
            schedUpdate();
        })
    }

};

const schedUpdate = () => {
    isUpdateScheduled = true;
    for (let i=0; i<dirtyInstances.length; i++){
        dirtyInstances[i].forEach((instance)=>{
            instance.update();
            dirtyInstances[i].delete(instance);
        });
    }
    
    isUpdateScheduled = false;
};


export class ComponentInstance<PropsType extends ComponentPropsType>{
    func: (props: PropsType)=>any;
    instanceMap: Map<KeyType, ComponentInstance<any>>;
    domElement: DOMElement | undefined;
    vTree: JSXElement | undefined;
    props: PropsType;
    states: any[] = [];
    depth: number;
    parent: ComponentInstance<any> | undefined;

    constructor(func: (props: PropsType)=>any, props: PropsType, parent: ComponentInstance<any> | undefined){
        this.func = func;
        this.props = props;
        this.instanceMap = new Map();
        this.parent = parent;
        this.depth = (parent?.depth ?? 1) + 1;

        this.update();
    }

    update(){
        this.updateVTree();
        this.patchInstances();
        this.patchDOMNodes();
    }
    updateVTree(){
        //const {props} = this.props
        _setActiveInstance(this)
        _setActiveStateIndex(0)
        this.vTree = this.func(this.props)
        console.log(this.vTree)
        _setActiveInstance(undefined)
    }
    extractVirtualComponents(
        branch: JSXElement, 
        mapToAdd: Map<KeyType, JSXComponent<any>>
    ){
        branch.children.forEach((ch) => {
            if (typeof ch === "string"){
                return;
            }
            if (ch.type == "element"){
                this.extractVirtualComponents(ch, mapToAdd)
            }else{
                mapToAdd.set(ch.key, ch);
            }
        })
    }
    patchInstances(){
        if (this.vTree === undefined){
            throw new Error("vTree is undefined")
        }
        const newInstanceMap = new Map<KeyType, JSXComponent<any>>();
        this.extractVirtualComponents(this.vTree, newInstanceMap);
        

        this.instanceMap.forEach(
            (v, k)=>{
                if (!newInstanceMap.has(k)){
                    v.destroy();
                    this.instanceMap.delete(k);
                }
        });

        this.instanceMap.forEach(
            (v, k)=>{
                if (!deepEqual(v.props, (this.instanceMap.get(k) as ComponentInstance<any>).props)){
                    markDirty(v);
                }
        });
        console.log("newInstanceMap: ", newInstanceMap)
        newInstanceMap.forEach(
            (v, k)=>{
                if (!this.instanceMap.has(k)){
                    this.instanceMap.set(k, new ComponentInstance<any>(v.func, v.props, this));
                }
        });
        console.log(this.instanceMap)

    }
    patchDOMNodes(){
        if (this.vTree === undefined){
            throw new Error()
        }
        const parentElem = this.domElement?.elem.parentElement;
        if (this.domElement?.elem.tagName !== this.vTree.tagName){
            const prevChild = this.domElement?.elem
            this.domElement = {
                type: "element",
                elem: document.createElement(this.vTree?.tagName),
                attrs: this.vTree.attributes,
                children: this.domElement?.children ?? [],
                eventListeners: this.domElement?.eventListeners ?? [],
            };
            if (parentElem!=null && prevChild!==undefined){
                parentElem?.replaceChild(this.domElement.elem, prevChild);
                
            }
        }
        this.patchDOMNodesImpl(this.vTree.children, this.domElement.children, this.domElement.elem)
    }
    patchDOMNodesImpl(
        branch: (JSXElementType | string)[], 
        domRepr: (DOMElement | DOMTextNode)[],
        parentElement: Element
    ){
        let branchIndex = 0;
        let domReprIndex = 0;

        const nodeArray: Node[] = [];

        while(1){
            if (branch.length <= branchIndex){
                break;
            }
          
            const vNode = branch[branchIndex];

            if (typeof vNode !== "string" && vNode.type === "component"){
                nodeArray.push(
                    ((this.instanceMap.get(vNode.key) as ComponentInstance<any>).domElement as DOMElement ).elem
                );
                branchIndex++;
                continue;
            }
            if (domReprIndex == domRepr.length){
                if (typeof vNode !== "string"){
                    domRepr.push({
                        type:"element",
                        attrs: new Map(),
                        elem: document.createElement(vNode.tagName),
                        children: [],
                        eventListeners: [],
                    })
                }else{
                    domRepr.push({
                        type:"textNode",
                        text: vNode,
                        node: document.createTextNode(vNode),
                    });
                }
                
            }
            const domNode = domRepr[domReprIndex];
            if (typeof vNode === "string" && domNode.type === "element")
            {
                domNode.elem.parentElement?.removeChild(domNode.elem);
                domRepr.splice(domReprIndex, 1);
                continue;

            }
            if (typeof vNode !== "string" && domNode.type === "textNode")
            {
                domNode.node.parentElement?.removeChild(domNode.node);
                domRepr.splice(domReprIndex, 1)
                continue;

            }
            if (typeof vNode === "string" && domNode.type === "textNode")
            {
                domNode.node.textContent = vNode;
                branchIndex ++;
                domReprIndex ++;
                nodeArray.push(domNode.node);
                continue
            }
            if (typeof vNode !== "string" && domNode.type !== "textNode"){
                let elemRepr = domNode
                if (domNode.elem.tagName !== vNode.tagName){
                    const newElemRepr: DOMElement = {
                        type: "element", 
                        attrs: new Map(),
                        elem: document.createElement(vNode.tagName),
                        children: [],
                        eventListeners: []
                    }
                    domRepr.splice(domReprIndex, 1, newElemRepr);
                    elemRepr = newElemRepr
                    
                }
                patchAttributes(elemRepr , vNode.attributes)
                nodeArray.push(elemRepr.elem)
                this.patchDOMNodesImpl(vNode.children, elemRepr.children, elemRepr.elem)
                branchIndex++;
                domReprIndex++;
            }
        }
        while(domRepr.length > domReprIndex){
            const r=domRepr[domReprIndex]
            if (r.type === "element"){
                r.elem.parentElement?.removeChild(r.elem);
            }else{
                r.node.parentElement?.removeChild(r.node);
            }
            domRepr.splice(domReprIndex, 1);
        }
        parentElement.replaceChildren(...nodeArray);

    }

    destroy(){
        this.instanceMap.forEach((v)=>{
            v.destroy();
        });
        if (this.domElement?.elem.parentElement !== null){
            this.domElement?.elem.parentElement.removeChild(this.domElement.elem);
        }
        this.domElement = undefined;

    }

}


const createApp = (elem: Element, fn: ()=>JSXElementType) =>{
    const inst = new ComponentInstance<any>(fn, {}, undefined);
    elem.appendChild(inst.domElement?.elem as Node);
    
}
export {createApp};