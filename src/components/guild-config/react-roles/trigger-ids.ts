import type { ButtonComponent, MenuComponent } from '@/lib/sdk';

export function isMenuComponent(
  component: ButtonComponent | MenuComponent | undefined,
): component is MenuComponent {
  return Boolean(component && 'options' in component);
}

export function selectTriggerId(menuId: string, optionValue: string): string {
  return `${menuId}-${optionValue}`;
}

export function selectOptionValueFromTrigger(
  triggerId: string,
  menuId: string,
): string | null {
  const prefix = `${menuId}-`;
  if (!triggerId.startsWith(prefix)) return null;
  return triggerId.slice(prefix.length);
}
