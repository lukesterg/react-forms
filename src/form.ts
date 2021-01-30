import { useState } from 'react';
import { normalizedChoices } from './choices';
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

export const form = (value: FieldDeclarationOptions = {}) => <Type extends scrub.Field>(instance: Type) => {
  const selectFrom = normalizedChoices(instance, value.selectFrom);
  return Object.assign(instance, value, { selectFrom }) as Type & FieldDeclarationOptions;
};

const useFormInputs = (formDefaults: () => any): FormInput => {
  const [form, setForm] = useState<any>(formDefaults);
  const [errors, setErrors] = useState<FormStateErrorType>({});
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

interface FormOptions<SchemaType extends ScrubObject> extends Partial<FormEvents>, FieldOptions {
  schema: SchemaType;
  generator?: FieldGenerator;
  defaults?: { [key in SchemaKeys<SchemaType>]?: string };
}

const validateOneField = <SchemaType extends ScrubObject>(
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

const eventPrecedence: { [key in FormEventType]: number } = {
  submit: 0,
  blur: 1,
  change: 2,
};

const sanitizeFormEvents = (value: Partial<FormEvents>): FormEvents => {
  const result: FormEvents = {
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

export const generateFields = <SchemaType extends ScrubObject>(
  options: BaseFormProperties<SchemaType> & FieldOptions
): { [key in keyof SchemaType]: UserGeneratedField } => {
  return Object.keys(options.form.schema.fields).reduce((current, key) => {
    const field = options.form.schema.fields[key] as FieldDeclarationOptions;
    const component = options.generator!(field);

    current[key] = (props: Partial<FieldGeneratorOptions>) =>
      component({
        ...options,
        fieldId: key,
        formId: field.formId || key,
        formLabel: field.formLabel || normalizeLabel(key),
        value: options.form.form[key],
        error: options.form.errors[key],
        field,
        form: options.form,
        selectFrom: (field.selectFrom as any) as NormalizedChoice[],
        horizontal: options.horizontal,
        enabled: field.enabled!,
        customInput: options.customInput,
        ...props,
      });
    return current;
  }, {} as any);
};

export const useForm = <SchemaType extends ScrubObject>(
  options: FormOptions<SchemaType>
): UseFormReturn<SchemaType> => {
  const state = useFormInputs(() => ({
    ...generateFormDefaults(Object.keys(options.schema.fields)),
    ...options.defaults,
  }));

  const formEvents = sanitizeFormEvents(options);

  const validateField = (field: keyof SchemaType, value: any) => {
    const result = validateOneField(options, value, field);
    state.setFieldError(result.error || '', field as string);
  };

  const triggerEvent = (field: SchemaKeys<SchemaType>, value: any, event: FormEventType) => {
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
    validate: () => {
      try {
        state.clearErrors();
        return options.schema.validate(state.form, { throwOnFailure: true }) as scrub.GetType<SchemaType>;
      } catch (e) {
        if (!(e instanceof scrub.ObjectValidatorError)) {
          throw e;
        }

        const errors = fromEntries(
          Object.entries(e.objectError || {})
            .filter(([_, error]) => error)
            .map(([key, value]) => [key, value as string])
        );
        state.setErrors(errors as any);
        throw e;
      }
    },
  };

  const fields = generateFields({
    form: result,
    ...options,
  });

  return {
    ...result,
    fields,
  };
};

export interface FormComponentOptions<SchemaType extends ScrubObject>
  extends FormOptions<SchemaType>,
    Omit<BaseFormProperties<SchemaType>, 'form'>,
    FieldOptions {
  onValidated: (value: scrub.GetType<SchemaType>) => void;
  onValidationError?: (error: scrub.ObjectValidatorError<SchemaType>) => void;
  fields?: string[];
  htmlFormTags?: boolean;
}
