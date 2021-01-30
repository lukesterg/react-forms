import { useState } from 'react';
import { normalizedChoices } from './choices';
import * as types from './types';
// @ts-ignore
import * as scrub from '@framed/scrub';

const fromEntries = <ValueType extends {}>(entries: [string, ValueType][]) =>
  entries.reduce((last, [key, value]) => {
    last[key] = value;
    return last;
  }, {} as any) as { [key: string]: ValueType };

const upperCaseFirst = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const normalizeLabel = (label: string) => {
  const underscoreToCamelCase = label.replace(/_(\S)/g, (_, match) => match.toUpperCase());
  const camelCaseToSpace = underscoreToCamelCase.replace(/[A-Z]/g, (match) => ` ${match}`).trim();
  return upperCaseFirst(camelCaseToSpace);
};

const appendOptionalLabelIfRequired = (label: string, field: any) => {
  return (field as scrub.StringOptions).empty === true &&
    (field as types.FieldDeclarationOptions).enabled !== false &&
    (field as types.FieldDeclarationOptions).hideOptional !== true
    ? `${label} (optional)`
    : label;
};

export const form = (value: types.FieldDeclarationOptions = {}) => <Type extends scrub.Field>(instance: Type) => {
  const selectFrom = normalizedChoices(instance, value.selectFrom);
  return Object.assign(instance, value, { selectFrom }) as Type & types.FieldDeclarationOptions;
};

const useFormInputs = (formDefaults: () => any): types.FormInput => {
  const [form, setForm] = useState<any>(formDefaults);
  const [errors, setErrors] = useState<types.FormStateErrorType>({});
  const clearErrors = () => setErrors({});

  const reset = () => {
    setForm({});
    clearErrors();
  };

  const getFieldValue = (field: string) => form[field];

  const setFieldValue = (value: any, field: string) => setForm({ ...form, [field]: value });

  const setFieldError = (error: string, field: string) => setErrors({ ...errors, [field]: error });

  const getFieldError = (field: string) => errors[field];

  const removeFieldError = (field: string) => {
    const errorClone = { ...errors };
    delete errorClone[field];
  };

  return {
    form,
    errors,
    reset,
    getFieldValue,
    setFieldValue,
    setFieldError,
    getFieldError,
    removeFieldError,
    clearErrors,
    setErrors,
  };
};

interface FormOptions<SchemaType extends types.ScrubObject> extends Partial<types.FormEvents>, types.FieldOptions {
  schema: SchemaType;
  generator?: types.FieldGenerator;
  defaults?: { [key in types.SchemaKeys<SchemaType>]?: string };
}

const validateOneField = <SchemaType extends types.ScrubObject>(
  options: FormOptions<SchemaType>,
  form: any,
  field: keyof SchemaType
) => {
  const validationField: scrub.Field | undefined = options.schema.fields[field];
  if (!validationField) {
    throw new Error('could not find entry');
  }

  return validationField.validate(form, { throwOnFailure: false });
};

const eventPrecedence: { [key in types.FormEventType]: number } = {
  submit: 0,
  blur: 1,
  change: 2,
};

const sanitizeFormEvents = (value: Partial<types.FormEvents>): types.FormEvents => {
  const result: types.FormEvents = {
    validateFieldEvent: 'submit',
    validateFieldErrorEvent: 'change',
    ...value,
  };

  if (eventPrecedence[result.validateFieldErrorEvent] < eventPrecedence[result.validateFieldEvent]) {
    result.validateFieldErrorEvent = 'submit';
  }

  return result;
};

const generateFormDefaults = (keys: string[]) =>
  keys.reduce((obj, keys) => {
    obj[keys] = '';
    return obj;
  }, {} as any);

export const generateFields = <SchemaType extends types.ScrubObject>(
  options: types.BaseFormProperties<SchemaType> & types.FieldOptions
): { [key in keyof SchemaType]: types.UserGeneratedField } => {
  return Object.keys(options.form.schema.fields).reduce((current, key) => {
    // because typing is stuffed because of peerDependencies and Typescript this needs to be any
    const field: any = options.form.schema.fields[key];

    const component = options.generator!(field);

    current[key] = (props: Partial<types.FieldGeneratorOptions>) =>
      component({
        ...options,
        fieldId: key,
        formId: field.formId || key,
        formLabel: appendOptionalLabelIfRequired(field.formLabel || normalizeLabel(key), field),
        value: options.form.form[key],
        error: options.form.errors[key],
        field: field as scrub.Field,
        form: options.form,
        selectFrom: (field.selectFrom as any) as types.NormalizedChoice[],
        horizontal: options.horizontal,
        helpText: field.helpText || '',
        placeholder: field.placeholder || '',
        hideOptional: field.hideOptional || false,
        enabled: field.enabled!,
        customInput: options.customInput,
        ...props,
      });
    return current;
  }, {} as any);
};

export const useForm = <SchemaType extends types.ScrubObject>(
  options: FormOptions<SchemaType>
): types.UseFormReturn<SchemaType> => {
  const state = useFormInputs(() => ({
    ...generateFormDefaults(Object.keys(options.schema.fields)),
    ...options.defaults,
  }));

  const formEvents = sanitizeFormEvents(options);

  const validateField = (field: keyof SchemaType, value: any) => {
    const result = validateOneField(options, value, field);
    state.setFieldError(result.error || '', field as string);
  };

  const triggerEvent = (field: types.SchemaKeys<SchemaType>, value: any, event: types.FormEventType) => {
    state.setFieldValue(value, field as string);

    if (
      formEvents.validateFieldEvent !== event &&
      (formEvents.validateFieldErrorEvent !== event || !state.errors[field as string])
    ) {
      return;
    }

    validateField(field, value);
  };

  const result = {
    ...state,
    schema: options.schema,
    triggerEvent,
    validate: (throwOnError: boolean = false) => {
      try {
        state.clearErrors();
        return options.schema.validate(state.form, { throwOnFailure: true }) as scrub.GetType<SchemaType>;
      } catch (e) {
        console.error(e);

        if (!(e instanceof scrub.ObjectValidatorError)) {
          if (throwOnError) {
            throw e;
          }

          return;
        }

        const errors = fromEntries(
          Object.entries(e.objectError || {})
            .filter(([_, error]) => error)
            .map(([key, value]) => [key, value as string])
        );
        state.setErrors(errors as any);

        if (throwOnError) {
          throw e;
        }
      }
    },
  };

  const fields = generateFields({
    form: result,
    ...options,
  });

  return {
    ...result,
    fields: fields as any,
  };
};

export interface FormComponentOptions<SchemaType extends types.ScrubObject>
  extends FormOptions<SchemaType>,
    Omit<types.BaseFormProperties<SchemaType>, 'form'>,
    types.FieldOptions {
  onValidated: (value: scrub.GetType<SchemaType>) => void;
  onValidationError?: (error: scrub.ObjectValidatorError<SchemaType>) => void;
  fields?: string[];
  htmlFormTags?: boolean;
}
