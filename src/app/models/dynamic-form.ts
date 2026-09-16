export interface DynamicFormFieldOption {
  label: string;
  value: unknown;
}

export interface DynamicFormField {
  id: number;
  name: string;
  type: 'text' | 'select' | 'wysiwyg' | 'date' | 'radio' | string;
  label: string;
  options?: DynamicFormFieldOption[];
  visible?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export interface DynamicFormSchema {
  name: string;
  fields: DynamicFormField[];
}

export interface DynamicForm {
  form: DynamicFormSchema;
}

export interface DynamicFormFieldValue {
  id: number;
  value: unknown;
  value_text?: string;
  name?: string;
}
