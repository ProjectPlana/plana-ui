'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Save, ChevronDown, ChevronRight, RefreshCw, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface ItemListAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export interface ItemListItem {
  id: string | number;
  title: string;
  /** Inline UI rendered next to the title — e.g. an edit-pencil that swaps to an Input. */
  titleAction?: React.ReactNode;
  subtitle?: string | React.ReactNode;
  status?: string;
  statusVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  content: React.ReactNode;
  actions?: ItemListAction[];
  isExpanded?: boolean;
  searchText?: string;
}

export interface ItemListStat {
  label: string;
  value: number | string;
  tone?: 'default' | 'positive' | 'muted';
}

interface ItemListProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: ItemListItem[];
  onAddItem?: () => void;
  onSaveAll?: () => void;
  addItemLabel?: string;
  saveAllLabel?: string;
  loading?: boolean;
  refreshing?: boolean;
  className?: string;
  showSaveAll?: boolean;
  stats?: ItemListStat[];
  headerContent?: React.ReactNode;
  onRefresh?: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  filteredEmptyMessage?: string;
  onToggleExpand?: (itemId: string | number) => void;
  collapsible?: boolean;
}

export function ItemList({
  title,
  description,
  icon: Icon,
  items,
  onAddItem,
  onSaveAll,
  addItemLabel = 'Add Item',
  saveAllLabel = 'Save All Changes',
  loading = false,
  refreshing = false,
  className,
  showSaveAll = true,
  stats = [],
  headerContent,
  onRefresh,
  searchable = true,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No items found',
  emptyDescription = 'Get started by creating your first item.',
  filteredEmptyMessage = 'No items match this search.',
  onToggleExpand,
  collapsible = true
}: ItemListProps) {
  const [search, setSearch] = React.useState('');
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const normalizedSearch = search.trim().toLowerCase();
  const filteredItems = normalizedSearch
    ? items.filter((item) =>
        [
          item.title,
          typeof item.subtitle === 'string' ? item.subtitle : '',
          item.status ?? '',
          item.searchText ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : items;

  React.useEffect(() => {
    setExpanded((current) => {
      const next = { ...current };
      for (const item of items) {
        const key = String(item.id);
        if (next[key] === undefined) {
          next[key] = item.isExpanded ?? false;
        }
      }
      return next;
    });
  }, [items]);

  function setAllExpanded(value: boolean) {
    setExpanded(Object.fromEntries(items.map((item) => [String(item.id), value])));
  }

  function handleToggle(itemId: string | number, value: boolean) {
    setExpanded((current) => ({ ...current, [String(itemId)]: value }));
    onToggleExpand?.(itemId);
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5" />}
              <div>
                <CardTitle>{title}</CardTitle>
                {description && (
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button variant="outline" onClick={onRefresh} disabled={refreshing || loading}>
                  <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
                  Refresh
                </Button>
              )}
              {onAddItem && (
                <Button onClick={onAddItem} disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {addItemLabel}
                </Button>
              )}
              {showSaveAll && onSaveAll && items.length > 0 && (
                <Button onClick={onSaveAll} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {saveAllLabel}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {(items.length > 0 || stats.length > 0 || headerContent) && (
          <CardContent className="space-y-4">
            {headerContent}
            {stats.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                  <StatCard key={stat.label} stat={stat} />
                ))}
              </div>
            )}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span className="text-sm text-muted-foreground">
                {filteredItems.length} of {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                {searchable && items.length > 0 && (
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="pl-9"
                      placeholder={searchPlaceholder}
                    />
                  </div>
                )}
                {collapsible && items.length > 0 && (
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setAllExpanded(true)}>
                      Expand all
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setAllExpanded(false)}>
                      Collapse all
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Items List */}
      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading...</CardContent>
        </Card>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                {filteredEmptyMessage}
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                index={index}
                isOpen={expanded[String(item.id)] ?? item.isExpanded ?? false}
                onOpenChange={(value) => handleToggle(item.id, value)}
                collapsible={collapsible}
              />
            ))
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground space-y-2">
              {Icon && <Icon className="h-8 w-8 mx-auto opacity-50" />}
              <div>
                <p className="font-medium">{emptyMessage}</p>
                <p className="text-sm">{emptyDescription}</p>
              </div>
              {onAddItem && (
                <Button onClick={onAddItem} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  {addItemLabel}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ stat }: { stat: ItemListStat }) {
  const colour =
    stat.tone === 'positive'
      ? 'text-green-600'
      : stat.tone === 'muted'
      ? 'text-muted-foreground'
      : 'text-foreground';
  return (
    <div className="bg-muted/30 p-4 rounded-lg">
      <div className="text-sm font-medium mb-1">{stat.label}</div>
      <p className={cn('text-2xl font-bold', colour)}>{stat.value}</p>
    </div>
  );
}

interface ItemCardProps {
  item: ItemListItem;
  index: number;
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  collapsible: boolean;
}

function ItemCard({ item, index, isOpen, onOpenChange, collapsible }: ItemCardProps) {
  if (!collapsible) {
    return (
      <Card>
        <CardHeader className="sticky top-0 z-10 border-b bg-card/95 pb-3 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline">{index + 1}</Badge>
              <div>
                <CardTitle className="text-base">{item.title}</CardTitle>
                {item.subtitle && (
                  <CardDescription className="text-sm mt-1">
                    {item.subtitle}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.status && (
                <Badge variant={item.statusVariant || 'default'}>
                  {item.status}
                </Badge>
              )}
              {item.actions?.map((action, actionIndex) => {
                const ActionIcon = action.icon;
                return (
                  <Button
                    key={actionIndex}
                    variant={action.variant || 'ghost'}
                    size="sm"
                    onClick={action.onClick}
                    disabled={action.disabled}
                  >
                    {ActionIcon && <ActionIcon className="h-4 w-4 mr-1" />}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>{item.content}</CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="sticky top-0 z-10 cursor-pointer border-b bg-card/95 pb-3 backdrop-blur transition-colors hover:bg-muted/50 supports-[backdrop-filter]:bg-card/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Badge variant="outline">{index + 1}</Badge>
                </div>
                <div>
                  <div className="flex items-center gap-2 group">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    {item.titleAction && (
                      <span onClick={(e) => e.stopPropagation()}>{item.titleAction}</span>
                    )}
                  </div>
                  {item.subtitle && (
                    <CardDescription className="text-sm mt-1">
                      {item.subtitle}
                    </CardDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {item.status && (
                  <Badge variant={item.statusVariant || 'default'}>
                    {item.status}
                  </Badge>
                )}
                {item.actions?.map((action, actionIndex) => {
                  const ActionIcon = action.icon;
                  return (
                    <Button
                      key={actionIndex}
                      variant={action.variant || 'ghost'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!action.disabled) {
                          action.onClick();
                        }
                      }}
                      disabled={action.disabled}
                    >
                      {ActionIcon && <ActionIcon className="h-4 w-4 mr-1" />}
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">{item.content}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
} 
