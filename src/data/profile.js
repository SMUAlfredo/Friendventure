export const profileFields = [
  ['name', 'Name', 'text'],
  ['age', 'Age', 'number'],
  ['email', 'SMU email', 'email'],
  ['studentNumber', 'Student number', 'text'],
  ['program', 'Program of studies', 'text'],
];

export function validateProfile(profile) {
  const errors = {};
  for (const [key, label] of profileFields) {
    if (!String(profile[key] ?? '').trim()) errors[key] = `Please enter your ${label.toLowerCase()}.`;
  }
  if (profile.age && (!/^\d+$/.test(String(profile.age)) || Number(profile.age) < 1)) {
    errors.age = 'Please enter your age as a positive whole number.';
  }
  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  } else if (profile.email && !/^[^\s@]+@(?:[a-z0-9-]+\.)*smu\.ca$/i.test(profile.email.trim())) {
    errors.email = 'Please use your SMU email address ending in @smu.ca.';
  }
  // The reference does not specify a student-number pattern or account-verification service.
  return errors;
}

export function deleteHobbies(state, selected) {
  if (!state.hobbies.some(name => selected.includes(name))) return state;
  return {
    ...state,
    hobbies: state.hobbies.filter(name => !selected.includes(name)),
    details: Object.fromEntries(Object.entries(state.details).filter(([name]) => !selected.includes(name))),
  };
}
