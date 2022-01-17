import { DOMParser } from '@xmldom/xmldom'
import { VNode } from '../vnode'

export const xmlParser = (source: string): VNode => {
    const document = new DOMParser().parseFromString(source, 'application/xml')

    return processNode(document.documentElement)
}

const hasAttributes = (node: Node): node is Node & { attributes: NamedNodeMap } => {
    return node.nodeType === node.ELEMENT_NODE
}

const processNode = (node: Node): VNode => {
    if (node.nodeType === node.TEXT_NODE) {
        return {
            type: '$text',
            attributes: {},
            children: [],
            text: node.nodeValue ?? '',
        }
    }

    if (node.nodeType === node.CDATA_SECTION_NODE) {
        return {
            type: '$text',
            attributes: {},
            children: [],
            text: node.nodeValue ?? '',
        }
    }

    let attributes: Record<string, string> = {}

    if (hasAttributes(node)) {
        for (const attribute of Array.from(node.attributes)) {
            attributes[attribute.name] = attribute.value
        }
    }

    let children: Array<VNode> = []

    if (node.hasChildNodes()) {
        for (const child of Array.from(node.childNodes)) {
            const result = processNode(child)

            if (result) {
                if (result.type !== '$text' || (result.type === '$text' && result.text?.trim() !== '')) {
                    children.push(result)
                }
            }
        }
    }

    return {
        type: node.nodeName,
        attributes: attributes,
        children: children,
    }
}
