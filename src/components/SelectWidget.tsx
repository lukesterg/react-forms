import React from 'react';
import { useStandardControl } from './standardControl';
import { StandardFormLayout } from './StandardFormLayout';

export const SelectWidget: React.FC<FieldGeneratorOptions> = (props) => {
  const defaultInputOptions = useStandardControl({
    generatorOptions: props,
    additionalClasses: 'form-select',
    onAdd: (node: HTMLSelectElement) => {
      const currentValue = (node as HTMLSelectElement).value;
      if (currentValue !== props.value) {
        props.form.triggerEvent(props.fieldId, currentValue, 'change');
      }
    },
  });

  let itemCounter = 0;
  const generateOption: (params: [string, string]) => JSX.Element = ([key, text]) => (
    <option value={key} key={++itemCounter}>
      {text}
    </option>
  );

  const generateOptionGroup: (params: NormalizedChoice) => JSX.Element | JSX.Element[] = ([name, options]) => {
    if (name === '') {
      return options.map(generateOption);
    }

    return (
      <optgroup label={name} key={++itemCounter}>
        {options.map(generateOption)}
      </optgroup>
    );
  };

  const inputOptions: React.SelectHTMLAttributes<HTMLSelectElement> = {
    ...defaultInputOptions,
    onChange: (e) => props.form.triggerEvent(props.fieldId, e.currentTarget.value, 'change'),
    onBlur: (e) => props.form.triggerEvent(props.fieldId, e.currentTarget.value, 'blur'),
  };

  return (
    <StandardFormLayout {...props}>
      <select {...inputOptions} value={props.value}>
        {props.selectFrom.map(generateOptionGroup)}
      </select>
    </StandardFormLayout>
  );
};
