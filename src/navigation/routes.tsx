import type { ComponentType, JSX } from 'react';
import { TodoApp } from '@/components/TodoApp';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: TodoApp }
];

export const getPath = (path: string) => path;
