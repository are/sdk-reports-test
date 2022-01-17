export type VNode = {
    type: string
    attributes: Record<string, string>
    children: Array<VNode>
    text?: string
}
