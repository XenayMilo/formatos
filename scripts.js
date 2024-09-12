document.getElementById('convert-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('file-input').files[0];
    const formatSelect = document.getElementById('format-select').value;
    
    if (!fileInput) {
        alert("Por favor, sube un archivo.");
        return;
    }

    const resultMessage = document.getElementById('result-message');
    resultMessage.textContent = `El archivo ${fileInput.name} será convertido a ${formatSelect.toUpperCase()}...`;
    
    // Simula el proceso de conversión
    setTimeout(() => {
        resultMessage.textContent = `¡Conversión completada! Descarga tu archivo en formato ${formatSelect.toUpperCase()}.`;
    }, 2000);
});
