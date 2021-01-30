import React from 'react';
import * as types from '../types';

export const StandardFormLayout: React.FC<types.FieldGeneratorOptions> = (props) => {
  if (props.horizontal) {
    return (
      <div className="row mb-3">
        <label htmlFor={props.formId} className={`col-form-label ${props.horizontal.labelClass}`}>
          {props.formLabel}
        </label>
        <div className={props.horizontal.valueClass}>
          {props.children}
          {props.helpText && <div className="invalid-form-text text-muted">{props.helpText}</div>}
          {props.error && <div className="invalid-feedback">{props.error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <label htmlFor={props.formId} className="form-label">
        {props.formLabel}
      </label>
      {props.children}
      {props.helpText && <div className="invalid-form-text text-muted">{props.helpText}</div>}
      {props.error && <div className="invalid-feedback">{props.error}</div>}
    </div>
  );
};
