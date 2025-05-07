import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { SUPPORTED_LANGUAGES } from '../../config/languages';

@ValidatorConstraint({ name: 'isSupportedLanguage', async: false })
export class IsSupportedLanguageConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (typeof value !== 'string') return false;
    return SUPPORTED_LANGUAGES.includes(value as typeof SUPPORTED_LANGUAGES[number]);
  }

  defaultMessage(args: ValidationArguments): string {
    return `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`;
  }
}