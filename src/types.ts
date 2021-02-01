// @ts-ignore
import * as scrub from '@framed/scrub';

export type ScrubObject = scrub.ObjectValidator<any, unknown>;

export interface FieldOptions {
  horizontal?: {
    labelClass: string;
    valueClass: string;
  };
  customInput?: React.FC;
  inputOnly?: boolean;
}

export type FormStateErrorType = { [field: string]: string };

export interface FormInput {
  form: any;
  errors: FormStateErrorType;
  reset: () => void;
  getFieldValue: (field: string) => any;
  setFieldValue: (value: any, field: string) => void;
  setFieldError: (error: string, field: string) => void;
  getFieldError: (field: string) => string;
  removeFieldError: (field: string) => void;
  clearErrors: () => void;
  setErrors: (errors: FormStateErrorType) => void;
}

export type FormEventType = 'submit' | 'blur' | 'change';

type TriggerEvent = (event: FormEventType, value: any) => void;

export interface UseFormReturn<SchemaType extends ScrubObject> extends FormInput {
  schema: SchemaType;
  validate: (throwOnError?: boolean) => scrub.GetType<SchemaType> | undefined;
  triggerEvent: (field: SchemaKeys<SchemaType>, value: any, event: FormEventType) => void;
  fields: {
    [key in keyof scrub.GetType<SchemaType>]: UserGeneratedField;
  };
}

export type SchemaKeys<Type extends ScrubObject> = keyof Type['fields'];

export type GeneratedField = (options: FieldGeneratorOptions & { key?: string }) => JSX.Element;
export type UserGeneratedField = (options?: Partial<FieldGeneratorOptions> & { key?: string }) => JSX.Element;
export type FieldGenerator = (options: scrub.Field) => GeneratedField;

export interface BaseFormProperties<SchemaType extends ScrubObject> {
  form: Omit<UseFormReturn<SchemaType>, 'fields'>;
  generator?: FieldGenerator;
}

export type StandardChoices = { [key: string]: string } | [string, string][] | string[];
export type UserChoices =
  | { [key: string]: StandardChoices[] }
  | [string, StandardChoices[]]
  | StandardChoices
  | boolean;
export type NormalizedChoice = [string, [string, string][]];

export interface FieldDeclarationOptions {
  formLabel?: string;
  formId?: string;
  selectFrom?: UserChoices;
  enabled?: boolean;
  helpText?: string;
  placeholder?: string;
  hideOptional?: boolean;
}

export interface FieldGeneratorOptions<SchemaType extends ScrubObject = ScrubObject>
  extends BaseFormProperties<SchemaType>,
    Required<Omit<FieldDeclarationOptions, 'selectFrom'>>,
    FieldOptions {
  field: scrub.Field;
  value: any;
  error?: string;
  fieldId: string;
  selectFrom: NormalizedChoice[];
}

export interface FormEvents {
  validateFieldEvent: FormEventType;
  validateFieldErrorEvent: FormEventType;
}
