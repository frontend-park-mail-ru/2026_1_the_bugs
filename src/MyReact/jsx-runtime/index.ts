import type {
    ChildrenType, 
    NormalizedChildrenType, 
    ComponentPropsType, 
    JSX, 
    JSXElement, 
    JSXElementType
} from "./../types/jsx"


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
    props: PropsType & {children?:ChildrenType},
    key: string | undefined
): JSXElementType{
    if (typeof type === 'string'){
        const attributes = new Map<string, any>();
        Object.entries(props).forEach(
            ([k, v])=>{
                if (k !== "children" ){
                    if (k === "disabled" && !v){
                        return
                    }
                    if (k === "className"){
                        attributes.set("class", v)
                    }
                    else{
                        attributes.set(k, v)
                    }
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
        if (key === undefined){
            key = props.key
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



export type {JSX};
export {jsx, jsx as jsxs};