import React from 'react';
// @ts-ignore
import * as scrub from '@framed/scrub';
import * as form from './form';
import { ChangeEvent, FormEvent, useCallback, useRef } from 'react';
export { form } from './form';

const StandardFormLayout: React.FC<FieldGeneratorOptions> = (props) => {
  if (props.horizontal) {
    return (
      <div className="row mb-3">
        <label htmlFor={props.formId} className={`col-form-label ${props.horizontal.labelClass}`}>
          {props.formLabel}
        </label>
        <div className={props.horizontal.valueClass}>
          {props.children}
          {props.error && <div className="invalid-feedback">{props.error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <label htmlFor={props.formId} className="form-label">
        {props.formLabel}
      </label>
      {props.children}
      {props.error && <div className="invalid-feedback">{props.error}</div>}
    </div>
  );
};

const BooleanFormLayout: React.FC<FieldGeneratorOptions> = (props) => {
  if (props.horizontal) {
    return (
      <div className="row mb-3">
        <div className={`${props.horizontal.labelClass}`}></div>
        <div className={props.horizontal.valueClass}>
          <div className="form-check">
            {props.children}
            <label htmlFor={props.formId} className="form-check-label">
              {props.formLabel}
            </label>
            {props.error && <div className="invalid-feedback">{props.error}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 form-check">
      {props.children}
      <label htmlFor={props.formId} className="form-check-label">
        {props.formLabel}
      </label>
      {props.error && <div className="invalid-feedback">{props.error}</div>}
    </div>
  );
};

interface StandardControlOptions {
  generatorOptions: FieldGeneratorOptions;
  additionalClasses: string;
  onAdd?: (value: any) => any;
}

const useStandardControl = (options: StandardControlOptions) => {
  const ref = useRef<any>();
  const refCallback = useCallback(
    (node) => {
      if (!ref.current && node) {
        options?.onAdd?.(node);
      }

      ref.current = node;

      if (!node) {
        return;
      }

      ref.current.setCustomValidity(options.generatorOptions.error || '');
    },
    [options.generatorOptions.error]
  );

  return {
    id: options.generatorOptions.formId,
    className: `${options.additionalClasses} ${options.generatorOptions.error ? ' is-invalid' : ''}`,
    value: options.generatorOptions.value,
    disabled: options.generatorOptions.enabled === false,
    ref: refCallback,
  };
};

const selectWidget: React.FC<FieldGeneratorOptions> = (props) => {
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

const inputWidget = (inputProps: React.InputHTMLAttributes<HTMLInputElement>): GeneratedField => (props) => {
  const defaultInputOptions = useStandardControl({
    generatorOptions: props,
    additionalClasses: 'form-control',
  });

  const stringField = (props.field as unknown) as Partial<scrub.StringOptions>;
  const isCheckbox = inputProps.type === 'checkbox';
  const checkboxHtmlAttributes = isCheckbox ? { checked: props.value === true, value: 'true' } : {};
  const getValue = (e: ChangeEvent<HTMLInputElement>) => (isCheckbox ? e.currentTarget.checked : e.currentTarget.value);

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
    ...checkboxHtmlAttributes,
    ...inputProps,
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

const widgetSelectors: { [key: string]: GeneratedField } = {
  number: inputWidget({ type: 'text', inputMode: 'numeric' }),
  email: inputWidget({ type: 'email' }),
  password: inputWidget({ type: 'password' }),
  date: inputWidget({ type: 'date' }),
  boolean: inputWidget({ type: 'checkbox', className: 'form-check-input' }),
  uri: inputWidget({ type: 'url' }),
};
const defaultWidget = inputWidget({ type: 'text' });

const BootstrapWidgetSelector: React.FC<FieldGeneratorOptions> = (props) => {
  if (props.selectFrom) {
    return selectWidget(props);
  }

  // Do not add any React use statements in this class
  for (const key of props.field.type()) {
    const widget = widgetSelectors[key];
    if (widget) {
      return widget(props);
    }
  }

  return defaultWidget(props);
};

const bootstrapGenerator: GeneratedField = (props) => <BootstrapWidgetSelector {...props} />;

export const useForm: typeof form.useForm = (options) =>
  form.useForm({
    ...options,
    generator: (field) => options.generator?.(field) || bootstrapGenerator,
  });

export const Form = <SchemaType extends ScrubObject>(options: form.FormComponentOptions<SchemaType>) => {
  const form = useForm(options);

  const submitButton =
    options.onValidated || options.onValidationError ? (
      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    ) : undefined;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      options.onValidated(form.validate());
    } catch (e) {
      if (!(e instanceof scrub.ObjectValidatorError)) {
        console.error('unexpected error', e);
        return;
      }

      options.onValidationError?.(e.objectError as any);
    }
  };

  const fields = (options.fields || Object.keys(form.fields)).map((key) =>
    ((form.fields as any)[key] as UserGeneratedField)({ key })
  );
  const innerContent = (
    <>
      {fields}
      {submitButton}
    </>
  );

  if (options.htmlFormTags === false) {
    return innerContent;
  }

  return (
    <form noValidate={true} onSubmit={onSubmit}>
      {innerContent}
    </form>
  );
};
