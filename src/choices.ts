import * as types from './types';
// @ts-ignore
import type * as scrub from '@framed/scrub';

export const normalizedChoices = (
  validator: scrub.Field,
  choices: types.UserChoices | undefined
): types.NormalizedChoice[] | undefined => {
  if (!choices) {
    return;
  }

  const result = calculateNormalizedValues(validator, choices);
  if (result && Object.values(result).some(([_, choices]) => !choices)) {
    throw new Error('invalid choices');
  }

  return result;
};

const calculateNormalizedValues = (
  validator: scrub.Field,
  choices: types.UserChoices
): types.NormalizedChoice[] | undefined => {
  if (choices === undefined || choices === true) {
    choices = (validator as scrub.StringValidator).choices as string[];
  }
  if (choices === undefined || choices === false) {
    return;
  }

  let normalizedChoices = attemptToNormalizeStandardChoices(choices);
  if (normalizedChoices) {
    return normalizedChoices.length > 0 ? [['', normalizedChoices]] : [];
  }

  let optGroups = Array.isArray(choices) ? choices : Object.entries(choices);
  if (optGroups.length === 0) {
    return [];
  }

  return (optGroups as [string, types.StandardChoices][]).map(
    ([key, value]) => [key, attemptToNormalizeStandardChoices(value)] as types.NormalizedChoice
  );
};

const attemptToNormalizeStandardChoices = (choices: types.UserChoices): [string, any][] | undefined => {
  if (!Array.isArray(choices)) {
    // Must be an object. It can only be StandardChoices if every value is a string.
    if (Object.values(choices).some((choice) => typeof choice !== 'string')) {
      return undefined;
    }

    return Object.entries(choices);
  }

  if (choices.length === 0) {
    return [];
  }

  // Either [string, any][] or string[]
  return Array.isArray(choices[0])
    ? (choices as [string, any][])
    : (choices as string[]).map((choice) => [choice, choice] as [string, string]);
};
