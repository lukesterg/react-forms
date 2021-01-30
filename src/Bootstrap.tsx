import React from 'react';
import * as form from './form';
import { SelectWidget } from './components/SelectWidget';
import { InputWidget } from './components/InputWidget';
export { form } from './form';
// @ts-ignore
import * as scrub from '@framed/scrub';

const widgetSelectors: { [key: string]: GeneratedField } = {
  number: InputWidget({ type: 'text', inputMode: 'numeric' }),
  email: InputWidget({ type: 'email' }),
  password: InputWidget({ type: 'password' }),
  date: InputWidget({ type: 'date' }),
  boolean: InputWidget({ type: 'checkbox', className: 'form-check-input' }),
  uri: InputWidget({ type: 'url' }),
};
const defaultWidget = InputWidget({ type: 'text' });

const BootstrapWidgetSelector: React.FC<FieldGeneratorOptions> = (props) => {
  if (props.selectFrom) {
    return SelectWidget(props);
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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
