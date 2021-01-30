import React from 'react';

export interface StandardControlOptions {
  generatorOptions: FieldGeneratorOptions;
  additionalClasses: string;
  onAdd?: (value: any) => any;
}

export const useStandardControl = (options: StandardControlOptions) => {
  const ref = React.useRef<any>();
  const refCallback = React.useCallback(
    (node) => {
      if (!ref.current && node) {
        options?.onAdd?.(node);
      }

      ref.current = node;

      if (!node) {
        return;
      }

      ref.current.setCustomValidity(options.generatorOptions.error || '');
    },
    [options.generatorOptions.error]
  );

  return {
    id: options.generatorOptions.formId,
    className: `${options.additionalClasses} ${options.generatorOptions.error ? ' is-invalid' : ''}`,
    value: options.generatorOptions.value,
    disabled: options.generatorOptions.enabled === false,
    ref: refCallback,
  };
};
