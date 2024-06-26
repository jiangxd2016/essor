import { insertChild, removeChild, replaceChild } from './utils';
import { isJsxElement } from './template';

type AnyNode = Node | JSX.Element;

export function patchChildren(
  parent: Node,
  childrenMap: Map<string, AnyNode>,
  nextChildren: AnyNode[],
  before: Node | null,
): Map<string, AnyNode> {
  const result = new Map<string, AnyNode>();
  const children = childrenMap.values();
  const parentChildNodesLength = parent.childNodes.length;

  if (childrenMap.size > 0 && nextChildren.length === 0) {
    if (parentChildNodesLength === childrenMap.size + (before ? 1 : 0)) {
      const parentElement = parent as Element;
      parentElement.innerHTML = '';
      if (before) {
        insertChild(parent, before);
      }
    } else {
      const range = document.createRange();
      const child = children.next().value;
      const start = isJsxElement(child) ? child.firstChild : child;
      range.setStartBefore(start);
      if (before) {
        range.setEndBefore(before);
      } else {
        range.setEndAfter(parent);
      }
      range.deleteContents();
    }

    childrenMap.forEach(node => {
      if (isJsxElement(node)) {
        node.unmount();
      }
    });

    return result;
  }

  const replaces: [Comment, AnyNode][] = [];
  const nextChildrenMap = mapKeys(nextChildren);

  for (let [i, child] of nextChildren.entries()) {
    let currChild = children.next().value;
    let currKey = getKey(currChild, i);

    while (currChild && !nextChildrenMap.has(currKey)) {
      removeChild(currChild);
      childrenMap.delete(currKey);
      currChild = children.next().value;
      currKey = getKey(currChild, i);
    }

    const key = getKey(child, i);
    const origChild = childrenMap.get(key);

    if (origChild) {
      child = patch(parent, origChild, child);
    }

    if (currChild) {
      if (currChild) {
        const placeholder = document.createComment('');
        insertChild(parent, placeholder, currChild);
        replaces.push([placeholder, child]);
      } else {
        insertChild(parent, child, before);
      }
    } else {
      insertChild(parent, child, before);
    }

    result.set(key, child);
  }

  replaces.forEach(([placeholder, child]) => replaceChild(parent, child, placeholder));

  childrenMap.forEach((child, key) => {
    if (child.isConnected && !result.has(key)) {
      removeChild(child);
    }
  });

  return result;
}

export function patch(parent: Node, node: AnyNode, next: AnyNode): AnyNode {
  if (node === next) {
    return node;
  }
  if (isJsxElement(node) && isJsxElement(next) && node.template === next.template) {
    next.inheritNode(node);
    return next;
  }
  if (node instanceof Text && next instanceof Text) {
    if (node.textContent !== next.textContent) {
      node.textContent = next.textContent;
    }
    return node;
  }
  replaceChild(parent, next, node);
  return next;
}

export function mapKeys(children: AnyNode[]): Map<string, AnyNode> {
  const result = new Map();
  for (const [i, child] of children.entries()) {
    const key = getKey(child, i);
    result.set(key, child);
  }
  return result;
}

export function getKey(node, index): string {
  const id = node instanceof Element ? node.id : undefined;
  const result = id === '' ? undefined : id;
  return result ?? `_$${index}$`;
}
