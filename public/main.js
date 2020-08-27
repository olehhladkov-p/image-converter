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

const handleForm = (form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = `${location.origin}${form.getAttribute('action')}`;
    const formData = new FormData(form);

    try {
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
    }
  });
};

const handleSizeRows = (form) => {
  const addRowButton = form.querySelector('[data-add-sizes-row]');
  const row = form.querySelector('[data-sizes-row]');

  if (!addRowButton || !row) {
    return;
  }

  let counter = 1;

  addRowButton.addEventListener('click', () => {
    const newRow = row.cloneNode(true);
    const inputs = newRow.querySelectorAll('input[type="number"]');

    inputs.forEach((input) => {
      const newName = input.name.replace('[0]', `[${counter}]`);

      input.setAttribute('name', newName);
      input.value = null;
    });

    counter = counter + 1;

    addRowButton.before(newRow);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#form');

  if (!form) {
    return;
  }

  handleForm(form);
  handleSizeRows(form);
});
