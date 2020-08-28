import validateForm from './validation/index.js';

const downloadFile = (blob, archiveType = 'zip') => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `images.${archiveType}`;

  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(link);
};

const handleFormSubmit = (form) => {
  form.noValidate = true;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isFormValid = validateForm(form);

    if (!isFormValid) {
      return;
    }

    const submitButton = [...form.elements].find(
      ({ type }) => type === 'submit'
    );
    const url = `${location.origin}${form.getAttribute('action')}`;
    const formData = new FormData(form);

    try {
      submitButton.setAttribute('disabled', true);

      const { success, download_url: downloadUrl, error } = await (
        await fetch(url, {
          method: form.getAttribute('method'),
          body: formData,
        })
      ).json();

      if (!success) {
        alert(error);

        return;
      }

      const blob = await (
        await fetch(`${location.origin}${downloadUrl}`, {
          method: 'POST',
        })
      ).blob();

      downloadFile(blob);
    } catch (error) {
      alert(error.message);
    } finally {
      submitButton.removeAttribute('disabled');
    }
  });
};

const handleSizeRows = (form) => {
  const addRowButton = form.querySelector('[data-add-sizes-row]');
  const removeRowButton = form.querySelector('[data-remove-sizes-row]');

  const addSizesRow = () => {
    if (!addRowButton) {
      return;
    }

    const rows = form.querySelectorAll('[data-sizes-row]');
    const currentRowIndex = rows.length - 1;
    const row = rows[currentRowIndex];

    const currentIputs = row.querySelectorAll('input[type="number"]');
    const isSomeInputFilled = [...currentIputs].some(({ value }) => value);

    if (!isSomeInputFilled) {
      return;
    }

    const newRow = row.cloneNode(true);
    const newInputs = newRow.querySelectorAll('input[type="number"]');

    newInputs.forEach((input) => {
      const newName = input.name.replace(
        `[${currentRowIndex}]`,
        `[${currentRowIndex + 1}]`
      );

      input.setAttribute('name', newName);
      input.value = null;
    });

    addRowButton.before(newRow);
    removeRowButton.removeAttribute('hidden');
  };

  const removeSizesRow = () => {
    if (!removeRowButton) {
      return;
    }

    const rows = form.querySelectorAll('[data-sizes-row]');
    const currentRowIndex = rows.length - 1;
    const row = rows[currentRowIndex];

    if (currentRowIndex <= 1) {
      removeRowButton.setAttribute('hidden', true);
    }

    row.parentNode.removeChild(row);
  };

  form.addEventListener('click', (e) => {
    const target = e.target;

    if (target === addRowButton) {
      return addSizesRow();
    }

    if (target === removeRowButton) {
      return removeSizesRow(target);
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#form');

  if (!form) {
    return;
  }

  handleFormSubmit(form);
  handleSizeRows(form);
});
