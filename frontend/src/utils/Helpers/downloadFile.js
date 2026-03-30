/**
 * Trigger a browser download for blob response data.
 *
 * @param {BlobPart} data - File content to download
 * @param {string} filename - Target filename
 * @returns {void}
 */
function downloadFile(data, filename) {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export default downloadFile;