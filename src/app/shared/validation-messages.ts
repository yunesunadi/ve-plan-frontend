export const VALIDATION_MESSAGES: Record<string, (label: string, err: any) => string> = {
  required: (l) => `${l} is required.`,
  email: () => 'Please enter a valid email address.',
  minlength: (l, e) => `${l} must be at least ${e.requiredLength} characters.`,
  maxlength: (l, e) => `${l} must be at most ${e.requiredLength} characters.`,
  passwordMismatch: () => 'Passwords do not match.',
  emailMismatch: () => 'The email does not match your account email.',
  commonPassword: () => 'This password is too common. Choose a stronger one.',
  invalidTime: () => "End time mustn't be ahead of start time.",
  eventEnded: () => 'This event has already ended.',
  pastDate: () => "You can't create an event on a past day.",
};
