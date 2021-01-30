import React from 'react';
import * as scrub from '@framed/scrub';
import { form, useForm } from '@framed/forms';

const schema = scrub.object({
  fields: {
    subscribe: scrub.boolean({ allowTypes: 'all' }),
    email: form({ hideOptional: true })(scrub.email({ empty: true })),
  },
  customValidation: (state) => {
    if (!state.cleanedFields.subscribe) {
      state.cleanedFields.email = '';
    } else if (state.cleanedFields.email === '') {
      state.addError('Email is required', 'email');
    }
  },
});

const App = () => {
  const form = useForm({ schema });

  const validate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = form.validate();
    if (!result) {
      return;
    }

    alert(result.email === '' ? 'No subscription' : `${result.email} subscribed`);
  };

  return (
    <div>
      {form.form.subscribe}
      <form noValidate={true} onSubmit={validate}>
        {form.fields.subscribe()}
        {form.form.subscribe &&
          form.fields.email({
            horizontal: {
              labelClass: 'col-sm-2',
              valueClass: 'col-sm-10',
            },
          })}

        <button type="submit" className="btn btn-primary">
          Continue
        </button>
      </form>
    </div>
  );
};

export default App;
//render(<App />, document.getElementById('root'));
