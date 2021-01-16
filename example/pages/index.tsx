import React from 'react';
import * as scrub from '@framed/scrub';
import { Form, useForm, form } from '@framed/forms';

const schema = scrub.object({
  testThis: form({ formId: 'abc', formLabel: 'Hi there', enabled: false })(scrub.string()),
  choices: form()(scrub.string({ choices: ['a', 'b'] })),
  number: scrub.number({ allowTypes: 'string' }),
  password: scrub.password({ empty: true }),
  email: scrub.email(),
  date: scrub.date(),
  checkbox: scrub.boolean({ choices: [true] }),
  uri: scrub.uri(),
});

type SchemaType = scrub.GetType<typeof schema>;

export default function Home() {
  return <div />;
}
