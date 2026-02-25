type any1 = any;
type KeyType = string;

namespace JSX{
    export interface IntrinsicAttributes extends any1{
        key?: KeyType;
    }
    export type SVGAttributes = any;
    export type HTMLAttributes = any;
    export interface IntrinsicElements extends any1{}
}
interface ComponentPropsType {
    key: KeyType;
}

interface JSXElement {
    type: "element"
    tagName: string;
    attributes: Map<string, any>;
    children: NormalizedChildrenType;
}
interface JSXComponent<PropsType extends ComponentPropsType>{
    type: "component";
    func: (props: any) => JSXElementType;
    key: KeyType;
    props: PropsType;
    children: NormalizedChildrenType;
}

type JSXElementType = JSXElement | JSXComponent<any> ;

type ChildrenType =  
    | JSXElementType 
    | string 
    | (JSXElementType | string)[] 
    | undefined;

type NormalizedChildrenType = (JSXElementType | string)[];


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

const markDirty = (instance: ComponentInstance<any> ) =>{
    while (dirtyInstances.length <= instance.depth){
        dirtyInstances.push(new Set());
    }
    dirtyInstances[instance.depth].add(instance);
    if (!isUpdateScheduled){
        isUpdateScheduled = true;
        window.requestAnimationFrame(()=>{
            schedUpdate();
        })
    }

};

const schedUpdate = () => {
    for (let i=0; i<dirtyInstances.length; i++){
        dirtyInstances[i].forEach((instance)=>{
            instance.update();
            dirtyInstances[i].delete(instance);
        });
        window.requestAnimationFrame(()=>{
            schedUpdate();
        });
        return
    }
    isUpdateScheduled = false;
};

const normalizedChildren = (children: ChildrenType) :NormalizedChildrenType => {
    if (children === undefined){
        return []
    }
    if (!Array.isArray(children)){
        return [children]
    }
    return children.flat()
}

function jsx<PropsType extends ComponentPropsType>(
    type: string | ((props: PropsType)=>any),
    props: PropsType & {children?:ChildrenType}
): JSXElementType{
    if (typeof type === 'string'){
        const attributes = new Map<string, any>();
        Object.entries(props).forEach(
            ([k, v])=>{
                if (k !== "children"){
                    attributes.set(k, v)
                }
            }
        )
        return {
            type: "element",
            tagName: type,
            attributes: attributes,
            children: normalizedChildren(props.children)

        } as JSXElement
    }else{
        return {
            type: "component",
            key: props.key,
            func: type,
            props,
            children: normalizedChildren(props.children)
        }

    }
}




interface DOMElement{
    type: "element";
    elem: Element;
    attrs: Map<string, any>;
    children: (DOMElement | DOMTextNode)[];
}

interface DOMTextNode{
    type: "textNode";
    text: string;
    node: Node;
}

class ComponentInstance<PropsType extends ComponentPropsType>{
    func: (props: PropsType)=>any;
    instanceMap: Map<KeyType, ComponentInstance<any>>;
    domElement: DOMElement | undefined;
    vTree: JSXElement | undefined;
    props: PropsType;
    depth: number;
    parent: ComponentInstance<any>;

    constructor(func: (props: PropsType)=>any, props: PropsType, parent: ComponentInstance<any>){
        this.func = func;
        this.props = props;
        this.instanceMap = new Map();
        this.parent = parent;
        this.depth = parent.depth + 1;

        this.updateVTree();
        this.patchInstances();
        this.patchDOMNodes();
    }

    update(){
        this.updateVTree();
        this.patchInstances();
        this.patchDOMNodes();
    }
    updateVTree(){
        this.vTree = this.func(this.props)
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

        newInstanceMap.forEach(
            (v, k)=>{
                if (!this.instanceMap.has(k)){
                    this.instanceMap.set(k, new ComponentInstance<any>(v.func, v.props, this));
                }
        });




    }
    patchDOMNodes(){
        
    }
    patchDOMNodesImpl(){

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

export type {JSX};
export {jsx, jsx as jsxs, jsx as jsxDEV};