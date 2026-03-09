export interface DOMElement{
    type: "element";
    elem: Element;
    attrs: Map<string, any>;
    children: (DOMElement | DOMTextNode)[];
    eventListeners: {type: string, callback: ()=>void}[];
}

export interface DOMTextNode{
    type: "textNode";
    text: string;
    node: Node;
}