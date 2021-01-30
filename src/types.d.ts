type ScrubObject = import('@framed/scrub').ObjectValidator<any, unknown>;

interface FieldOptions {
  horizontal?: {
    labelClass: string;
    valueClass: string;
  };
  customInput?: (options: React.InputHTMLAttributes<HTMLInputElement>) => JSX.Element;
  inputOnly?: boolean;
}

type FormStateErrorType = { [field: string]: string };

interface FormInput {
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

type FormEventType = 'submit' | 'blur' | 'change';

type TriggerEvent = (event: FormEventType, value: any) => void;

interface UseFormReturn<SchemaType extends ScrubObject> extends FormInput {
  schema: SchemaType;
  validate: (throwOnError: boolean) => scrub.GetType<SchemaType>;
  triggerEvent: (field: SchemaKeys<SchemaType>, value: any, event: FormEventType) => void;
  fields: { [key in keyof SchemaType]: UserGeneratedField };
}

type SchemaKeys<Type extends ScrubObject> = keyof Type['fields'];

type GeneratedField = (options: FieldGeneratorOptions & { key?: string }) => JSX.Element;
type UserGeneratedField = (options?: Partial<FieldGeneratorOptions> & { key?: string }) => JSX.Element;
type FieldGenerator = (options: scrub.Field) => GeneratedField;

interface BaseFormProperties<SchemaType extends ScrubObject> {
  form: Omit<UseFormReturn<SchemaType>, 'fields'>;
  generator?: FieldGenerator;
}

type StandardChoices = { [key: string]: string } | [string, string][] | string[];
type UserChoices = { [key: string]: StandardChoices[] } | [string, StandardChoices[]] | StandardChoices | boolean;
type NormalizedChoice = [string, [string, string][]];

interface FieldDeclarationOptions {
  formLabel?: string;
  formId?: string;
  selectFrom?: UserChoices;
  enabled?: boolean;
  helpText?: string;
  placeholder?: string;
}

interface FieldGeneratorOptions<SchemaType extends ScrubObject = ScrubObject>
  extends BaseFormProperties<SchemaType>,
    Required<FieldDeclarationOptions>,
    FieldOptions {
  field: scrub.Field;
  value: any;
  error?: string;
  fieldId: string;
  selectFrom: NormalizedChoice[];
}

interface FormEvents {
  validateFieldEvent: FormEventType;
  validateFieldErrorEvent: FormEventType;
}
