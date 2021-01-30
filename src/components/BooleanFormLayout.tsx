import React from 'react';

export const BooleanFormLayout: React.FC<FieldGeneratorOptions> = (props) => {
  if (props.horizontal) {
    return (
      <div className="row mb-3">
        <div className={`${props.horizontal.labelClass}`}></div>
        <div className={props.horizontal.valueClass}>
          <div className="form-check">
            {props.children}
            <label htmlFor={props.formId} className="form-check-label">
              {props.formLabel}
            </label>
            {props.error && <div className="invalid-feedback">{props.error}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 form-check">
      {props.children}
      <label htmlFor={props.formId} className="form-check-label">
        {props.formLabel}
      </label>
      {props.error && <div className="invalid-feedback">{props.error}</div>}
    </div>
  );
};
