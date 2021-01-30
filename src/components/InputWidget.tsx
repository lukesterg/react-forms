import React from 'react';
import { BooleanFormLayout } from './BooleanFormLayout';
import { useStandardControl } from './standardControl';
import * as types from '../types';
import { StandardFormLayout } from './StandardFormLayout';
// @ts-ignore
import * as scrub from '@framed/scrub';

export const InputWidget = (inputProps: React.InputHTMLAttributes<HTMLInputElement>): types.GeneratedField => (
  props
) => {
  const isCheckbox = inputProps.type === 'checkbox';
  let { value } = props;

  if (isCheckbox && value === '') {
    value = false;
    props.form.triggerEvent(props.fieldId, value, 'change');
  }

  const defaultInputOptions = useStandardControl({
    generatorOptions: props,
    additionalClasses: isCheckbox ? 'form-check-input' : 'form-control',
  });

  const stringField = (props.field as unknown) as Partial<scrub.StringOptions>;
  const checkboxHtmlAttributes = isCheckbox ? { checked: props.value === true, value: 'true' } : {};
  const getValue = (e: React.ChangeEvent<HTMLInputElement>) =>
    isCheckbox ? e.currentTarget.checked : e.currentTarget.value;

  const inputOptions: React.InputHTMLAttributes<HTMLInputElement> = {
    ...defaultInputOptions,
    id: props.formId,
    maxLength: stringField.maxLength,
    minLength: stringField.minLength,
    required: !stringField.empty,
    onChange: (e) => props.form.triggerEvent(props.fieldId, getValue(e), 'change'),
    onBlur: (e) => props.form.triggerEvent(props.fieldId, getValue(e), 'blur'),
    value: props.value,
    disabled: props.enabled === false,
    placeholder: props.placeholder,
    ...checkboxHtmlAttributes,
    ...inputProps,
    className: [defaultInputOptions.className, inputProps.className].filter((i) => i).join(' '),
  };

  const inputElement = props.customInput ? <props.customInput {...inputOptions} /> : <input {...inputOptions} />;

  if (props.inputOnly === true) {
    return inputElement;
  }

  if (isCheckbox) {
    return <BooleanFormLayout {...props}>{inputElement}</BooleanFormLayout>;
  }

  return <StandardFormLayout {...props}>{inputElement}</StandardFormLayout>;
};
