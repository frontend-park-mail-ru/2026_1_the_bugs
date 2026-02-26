export interface DOMElement{
    type: "element";
    elem: Element;
    attrs: Map<string, any>;
    children: (DOMElement | DOMTextNode)[];
}

export interface DOMTextNode{
    type: "textNode";
    text: string;
    node: Node;
}