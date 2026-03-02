type any1 = any;
export type KeyType = string;

export namespace JSX{
    export interface IntrinsicAttributes extends any1{
        key?: KeyType;
    }
    export type SVGAttributes = any;
    export type HTMLAttributes = any;
    export interface IntrinsicElements extends any1{}
}
export interface ComponentPropsType {
    key: KeyType;
    onClick: ()=>any | undefined;
}

export interface JSXElement {
    type: "element"
    tagName: string;
    attributes: Map<string, any>;
    children: NormalizedChildrenType;
}
export interface JSXComponent<PropsType extends ComponentPropsType>{
    type: "component";
    func: (props: any) => JSXElementType;
    key: KeyType;
    props: PropsType;
    children: NormalizedChildrenType;
}

export type JSXElementType = JSXElement | JSXComponent<any> ;

export type ChildrenType =  
    | JSXElementType 
    | string 
    | (JSXElementType | string)[] 
    | undefined;

export type NormalizedChildrenType = (JSXElementType | string)[];