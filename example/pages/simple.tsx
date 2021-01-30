import React from 'react';
import * as scrub from '@framed/scrub';
import { Form } from '@framed/forms';

const schema = scrub.object({
  name: scrub.string(),
  age: scrub.number({ min: 18, allowTypes: 'string' }),
});

export default function SimpleExample() {
  return <Form schema={schema} onValidated={(e) => alert(`Thank you for registering ${e.name}`)} />;
}
