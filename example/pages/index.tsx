import React from 'react';
import * as scrub from '@framed/scrub';
import { Form, form } from '@framed/forms';

const schema = scrub.object({
  textFieldWithCustomLabel: form({ formId: 'abc', formLabel: 'Text field with custom label' })(scrub.string()),
  textFieldWithDefaultValue: scrub.string({ empty: true }),
  disabledField: form({ enabled: false })(scrub.string({ empty: true })),
  fieldWithHelp: form({ formLabel: 'Field with help', helpText: 'Field with more information' })(
    scrub.string({ empty: true })
  ),
  fieldWithPlaceholder: form({ formLabel: 'Field with placeholder', placeholder: "I'm a placeholder" })(
    scrub.string({ empty: true })
  ),
  dropdown: form({ selectFrom: ['a', 'b'] })(scrub.string({ choices: ['a', 'b'] })),
  number: scrub.number({ allowTypes: 'string' }),
  password: scrub.password({
    requireLowerCase: true,
    requireNumber: true,
    requireSymbol: true,
    ignoreRequirementsIfLengthIsAtLeast: 10,
  }),
  email: scrub.email(),
  date: form({ helpText: 'Dates are displayed localized and automatically converted to a date object' })(
    scrub.date({ allowTypes: 'string' })
  ),
  checkbox: scrub.boolean({ choices: [true], allowTypes: ['string'] }),
  uri: scrub.uri(),
});

type SchemaType = scrub.GetType<typeof schema>;

export default function Home() {
  return (
    <>
      <p>
        <a href="/customForm">Custom form demo</a>
      </p>

      <h2>Horizontal form demo</h2>
      <p>This demo demonstrates all the different field types in a horizontal form layout</p>
      <p>
        <strong>Please open your JavaScript console to see the output.</strong>
      </p>
      <Form
        schema={schema}
        defaults={{ textFieldWithDefaultValue: 'default value' }}
        onValidated={(e) => console.log('validated', e)}
        onValidationError={(e) => console.error('validation error', e)}
        horizontal={{ labelClass: 'col-sm-2', valueClass: 'col-sm-10' }}
      />
    </>
  );
}
