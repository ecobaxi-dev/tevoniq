import { Children, cloneElement, createElement, isValidElement } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

const editorialHeadings: Record<string, string> = {
  'One vision. Every layer of technology.': 'One vision across every layer of technology',
  'The right technologies. Working together.': 'The right technologies working together',
  'A considered approach. From the first conversation onward.':
    'A considered approach from the first conversation',
  'رؤية واحدة. تشمل كل طبقات التقنية.': 'رؤية متكاملة لكل طبقات التقنية',
  'نهج مدروس. منذ المحادثة الأولى.': 'نهج مدروس يبدأ من المحادثة الأولى',
  'Useful to people. Purposeful for business.': 'Built around people and business',
  'Useful to people. Purposeful for business': 'Built around people and business',
  'مفيد للأشخاص. هادف للأعمال.': 'قيمة للأشخاص وأثر للأعمال',
  'مفيد للأشخاص. هادف للأعمال': 'قيمة للأشخاص وأثر للأعمال',
};

export function editorialHeading(text: string) {
  if (/[çğıöşüÇĞİÖŞÜ]/u.test(text)) return text;
  const rewritten = editorialHeadings[text.trim()];
  if (rewritten) return rewritten;
  // A title is a label, not a paragraph. Keep technical names and abbreviations intact.
  return text.replace(/([a-z\u0600-\u06ff])\.$/u, '$1');
}

function headingChildren(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === 'string') return editorialHeading(child);
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children !== undefined)
      return cloneElement(child, {}, headingChildren(child.props.children));
    return child;
  });
}

export function Heading({
  as = 'h2',
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}) {
  return createElement(as, props, headingChildren(children));
}
