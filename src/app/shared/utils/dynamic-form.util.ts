import { DynamicFormField, DynamicFormFieldValue } from 'src/app/models/dynamic-form';
import { FormlyFieldConfig } from '@ngx-formly/core';

const FIELD_TYPE_MAP: Record<string, string> = {
  text: 'input',
  select: 'combobox',
  wysiwyg: 'wysiwyg',
  date: 'date',
  radio: 'radio',
};

export function mapDynamicFieldsToFormly(fields: DynamicFormField[]): FormlyFieldConfig[] {
  return fields.map(field => ({
    key: field.name,
    type: FIELD_TYPE_MAP[field.type] ?? field.type,
    hide: field.visible === false,
    props: {
      label: field.label,
      required: !!field.required,
      disabled: !!field.disabled,
      options: field.options,
      // 'combobox' (mtx-select) needs to know which option keys hold the label/value.
      ...(field.type === 'select' ? { labelProp: 'label', valueProp: 'value' } : {}),
    },
  }));
}

export function mapDynamicModelToFormValues(
  fields: DynamicFormField[],
  model: Record<string, unknown>
): DynamicFormFieldValue[] {
  return fields.map(field => {
    const value = model[field.name];
    const option = field.options?.find(o => o.value === value);

    return {
      id: field.id,
      name: field.name,
      value,
      value_text: option?.label,
    };
  });
}
