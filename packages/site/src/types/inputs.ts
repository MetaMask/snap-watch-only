import type React from 'react';

export enum InputType {
  Dropdown = 'dropdown',
  TextField = 'text-field',
}

export type InputField = {
  id: string;
  title: string;
  type: InputType;
  placeholder: string;
  value?: any;
  options?: { value: string }[];
  onChange: (event: React.ChangeEvent) => void | Promise<void>;
};

export type Action = {
  callback: () => Promise<any>;
  label: string;
  disabled?: boolean;
  enabled?: boolean;
};

export type ManagementMethod = {
  name: string;
  description: string;
  inputs?: InputField[];
  action: Action;
  successMessage?: string;
};
