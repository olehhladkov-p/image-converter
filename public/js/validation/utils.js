const CHECKBOX = 'checkbox';
const CHECKBOX_ERROR_MESSAGE = 'Please select at least one checkbox';
const ERROR_TAG = 'div';
const ERROR_CLASS_NAME = 'error-message';
const IS_INVALID = 'is-invalid';
const FIELDSET_CLASS_NAME = 'fieldset';
const REQUIRED_FIELDS_SELECTOR = 'input[required]';

const getFieldsByGroups = ([...fields]) =>
  fields.reduce((acc, field) => {
    const { name, type } = field;

    if (!acc[type]) {
      acc[type] = {};
    }

    if (!acc[type][name]) {
      acc[type][name] = [];
    }

    acc[type][name].push(field);

    return acc;
  }, {});

const setError = (field) => {
  if (!field.errorMessage) {
    return;
  }

  const parent = field.closest(FIELDSET_CLASS_NAME);
  const errorElement = parent.querySelector(`.${ERROR_CLASS_NAME}`);

  if (errorElement) {
    errorElement.remove();
  }

  const error = document.createElement(ERROR_TAG);

  error.classList.add(ERROR_CLASS_NAME);
  error.textContent = field.errorMessage;

  parent.classList.add(IS_INVALID);
  parent.append(error);
};

const clearError = (field) => {
  const parent = field.closest(FIELDSET_CLASS_NAME);
  const errorElement = parent.querySelector(`.${ERROR_CLASS_NAME}`);

  if (errorElement) {
    errorElement.remove();
  }

  field.errorMessage = null;
  parent.classList.remove(IS_INVALID);
};

const validate = (field) => {
  clearError(field);

  const isValid = field.checkValidity();

  if (isValid) {
    return;
  }

  const fieldValidity = field.validity;

  for (const validityType in fieldValidity) {
    if (fieldValidity[validityType]) {
      field.errorMessage = field.validationMessage;

      setError(field);
    }
  }
};

const validateCheckbox = (fields) => {
  const field = fields[0];
  const isSomeChecked = fields.some(({ checked }) => checked);

  if (isSomeChecked) {
    return clearError(field);
  }

  field.errorMessage = CHECKBOX_ERROR_MESSAGE;

  return setError(field);
};

export const validateFields = (form) => {
  const fields = form.querySelectorAll(REQUIRED_FIELDS_SELECTOR);
  const fieldsByGroups = getFieldsByGroups(fields);

  Object.entries(fieldsByGroups).forEach(([type, entry]) => {
    const fields = Object.values(entry).flat();
    const isCheckbox = type === CHECKBOX;

    fields.forEach((field) => {
      isCheckbox ? validateCheckbox(fields) : validate(field);

      field.addEventListener('change', () => {
        isCheckbox ? validateCheckbox(fields) : validate(field);
      });
    });
  });

  return (
    form.querySelectorAll(`.${FIELDSET_CLASS_NAME}.${IS_INVALID}`).length === 0
  );
};
