import React from 'react';
import * as scrub from '@framed/scrub';
import { form, useForm } from '@framed/forms';

const australianStates = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];

const schema = scrub.object({
  addressLine1: form({ label: 'Address Line 1' })(scrub.string()),
  addressLine2: form({ label: 'Address Line 2' })(scrub.string({ empty: true })),
  city: scrub.string(),
  state: form({ selectFrom: [''].concat(australianStates) })(scrub.string({ choices: australianStates })),
  postcode: scrub.string(),
});

export default function Home() {
  const form = useForm({ schema });

  const validate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = form.validate();
    if (result) {
      alert('Address accepted');
    }
  };

  return (
    <>
      <p>
        <a href="/">Home</a>
      </p>

      <h2>Custom form demo</h2>
      <p>This demo demonstrates crating a form with a custom layout</p>
      <form noValidate={true} onSubmit={validate}>
        {form.fields.addressLine1()}
        {form.fields.addressLine2()}

        <div className="row">
          <div className="col-sm-6">{form.fields.city()}</div>
          <div className="col-sm-4">{form.fields.state()}</div>
          <div className="col-sm-2">{form.fields.postcode()}</div>
        </div>

        <button type="submit" className="btn btn-primary">
          Continue
        </button>
      </form>
    </>
  );
}
