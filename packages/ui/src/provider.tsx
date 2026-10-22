'use client';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { Direction, Tooltip as TooltipPrimitive } from 'radix-ui';
export type Theme = 'light' | 'dark';
export type DirectionValue = 'ltr' | 'rtl';
const UIContext = createContext<{ theme: Theme; direction: DirectionValue }>({
  theme: 'light',
  direction: 'ltr',
});
export function useUI() {
  return useContext(UIContext);
}
export function UIProvider({
  theme = 'light',
  direction = 'ltr',
  children,
}: {
  theme?: Theme;
  direction?: DirectionValue;
  children: ReactNode;
}) {
  return (
    <UIContext.Provider value={{ theme, direction }}>
      <Direction.Provider dir={direction}>
        <TooltipPrimitive.Provider delayDuration={250}>
          <div className="tv-root" data-theme={theme} dir={direction}>
            {children}
          </div>
        </TooltipPrimitive.Provider>
      </Direction.Provider>
    </UIContext.Provider>
  );
}
