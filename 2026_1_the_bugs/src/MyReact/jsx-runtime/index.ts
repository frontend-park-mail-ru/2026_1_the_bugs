type any1 = any
namespace JSX{
    export interface IntrinsicAttributes extends any1{
        key?: any;
    }
    export type SVGAttributes = any;
    export type HTMLAttributes = any;
    export interface IntrinsicElements extends any1{}
}

interface JSXElement {
    tagName: string;
    attributes: Map<string, any>;
    children: NormalizedChildrenType;
}
interface JSXComponent<PropsType>{
    func: (props: any) => JSXElementType
    props: PropsType;
    children: NormalizedChildrenType;

}
type JSXElementType = JSXElement | JSXComponent<any> | string ;

type ChildrenType =  JSXElementType | string | (JSXElementType | string)[] | undefined;
type NormalizedChildrenType = (JSXElementType | string)[];


const normalizedChildren = (children: ChildrenType) :NormalizedChildrenType => {
    if (children === undefined){
        return []
    }
    if (!Array.isArray(children)){
        return [children]
    }
    return children.flat()
}

function jsx<PropsType>(
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
            tagName: type,
            attributes: attributes,
            children: normalizedChildren(props.children)

        } as JSXElement
    }else{
        return {
            func: type,
            props,
            children: normalizedChildren(props.children)
        }

    }
}

export type {JSX};
export {jsx, jsx as jsxs, jsx as jsxDEV};