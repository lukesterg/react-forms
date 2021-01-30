# React Forms

React forms is a simple form creation library which supports:

- Form layouts: vertical, horizontal or custom.
- Validation using the scrub library.
- Customizing fields attributes such as id, label, placeholder, disabled and much more.

```js
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
```

[Edit on StackBlitz](https://stackblitz.com/edit/react-ts-vlkmva?file=index.tsx)

![Running through a form](docs/simple-demo.gif)

# Documentation

To install run `npm i @framed/forms @framed/scrub`. You will need to be load Bootstrap 5 to render the forms correctly.

For validation please refer to [scrub documentation](https://scrub.readthedocs.io/en/latest/).

Documentation is a work in progress, please see examples.

# Editable examples

- [Simple Example](https://stackblitz.com/edit/react-ts-vlkmva?file=index.tsx)
- [Horizontal form with all field types](https://stackblitz.com/edit/react-ts-kgv6k5?file=index.tsx)
- [Custom form layout](https://stackblitz.com/edit/react-ts-ur6dkr?file=index.tsx)

# Using the code

To setup the project for the first time run `npm i && npm i --prefix example`.

Once the project is setup `npm run build` will build the project into lib and `npm run dev` will start a webserver on port 3000 for development.

```

```
