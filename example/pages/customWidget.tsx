import React from 'react';
import { render } from 'react-dom';
import * as scrub from '@framed/scrub';
import { useForm } from '@framed/forms';

const schema = scrub.object({
  amount: scrub.number({ min: 1, allowTypes: ['string'] }),
});

const currencyWidget = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  const isInvalid = /is-invalid/.test(props.className);
  return (
    <div className={`input-group mb-3 ${isInvalid ? 'is-invalid' : ''}`}>
      <span className="input-group-text">$</span>
      <input aria-label="Amount (to the nearest dollar)" {...props} />
      <span className="input-group-text">.00</span>
    </div>
  );
};

const App = () => {
  const form = useForm({ schema });

  const validate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = form.validate();
    if (result) {
      alert('Form accepted');
    }
  };

  return (
    <div>
      <form noValidate={true} onSubmit={validate}>
        {form.fields.amount({
          customInput: currencyWidget,
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
