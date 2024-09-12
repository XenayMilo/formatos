document.getElementById('convert-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const fileInput = document.getElementById('file-input').files[0];
    const formatSelect = document.getElementById('format-select').value;
    
    if (!fileInput) {
        alert("Por favor, sube un archivo.");
        return;
    }

    const resultMessage = document.getElementById('result-message');
    resultMessage.textContent = `Convirtiendo el archivo ${fileInput.name} a ${formatSelect.toUpperCase()}...`;

    // Token de CloudConvert
    const apiKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZDVjZjc5ZmZlYjZlOTFlNDdlNDJmMDA5Y2QwNWFiMzE2OGVkZDI1MzU5MTliYzlhMmU1ODZiYzFmOTkzMDlmZDdiMmJmMDViZjMyZDZhZjciLCJpYXQiOjE3MjYxMDQzNzYuOTc2MTg3LCJuYmYiOjE3MjYxMDQzNzYuOTc2MTg4LCJleHAiOjQ4ODE3Nzc5NzYuOTcxMTQzLCJzdWIiOiI2OTU2MjM4OCIsInNjb3BlcyI6WyJ0YXNrLndyaXRlIiwidGFzay5yZWFkIl19.ebh3kp4NY8hLozpBj57-NrUw5lV1a79_E8AM0_bel3bgPK9Px3w5cCRtswn4wbDwSs0NBbwCTz6eARrLM7Iw4uLoQeHXieKbY91n8T12nD20kn9bh2cpeXmYBUZM165Qwgo2H4hmyqSd62sJoPEsVG0d7QryFdMy2t4nG9fRHUqXcGVOJr9uBsSl35Ben3B-3NoHy9QJcWiTgy_mWzKEHyxYn1qXVv_N0DZYmWgiVgTSxfOUPPwolQFTZbs7hVDS3N6eUINpwNLIxmR2PTQpA-l-18SfnkAuKTxZt8hu6L2LJpvt4q-eGcUD-R_20fkszpjIkxkhwzd-baZVlEMKAmhoD0ighr38WDC6PCYw5NuU3kjorQs5kG91VEwBuaQyUUYX1my4IRl9MnXrcn7eXFqbkFiqeYqQOkIaJRRS6GlvpAFF4m9Kj-BZK3qrt9ViD5it0yWCdwggCuD18VB2AJY8COLdfmb1l4qac2_3qHDJW0duqglGIR0YTvj6JAiSYV60OrVQAd6CLwB8s16D8CQxXqK3sbC6vIBNYsQwhenuX2TLOG-05yKtRmXbk5DmJO1TGeWb--Dub6A4pZzB4mwT7uY2Sxnxf3887ubGRMBD55cJhtolzCnp9M7ntP9vvfFk-aRQquBm8D15WEa4KXXh7JLKirVHRHcZQHVQSiU'; // Reemplaza con tu token de CloudConvert

    // Paso 1: Crear una tarea de conversión en CloudConvert
    fetch('https://api.cloudconvert.com/v2/import/url', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "tasks": {
                "import-my-file": {
                    "operation": "import/upload"
                },
                "convert-my-file": {
                    "operation": "convert",
                    "input": "import-my-file",
                    "output_format": formatSelect,
                    "input_format": fileInput.type.split('/')[1]
                },
                "export-my-file": {
                    "operation": "export/url",
                    "input": "convert-my-file"
                }
            }
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.data && data.data.tasks) {
            const uploadUrl = data.data.tasks['import-my-file'].result.form.url;
            
            // Paso 2: Subir el archivo a CloudConvert
            const formData = new FormData();
            formData.append('file', fileInput);

            fetch(uploadUrl, {
                method: 'POST',
                body: formData
            })
            .then(() => {
                resultMessage.textContent = `¡Archivo cargado correctamente! Convirtiendo a ${formatSelect.toUpperCase()}...`;
                
                // Monitorear el progreso de la conversión
                const taskId = data.data.id;
                const checkStatusInterval = setInterval(() => {
                    fetch(`https://api.cloudconvert.com/v2/tasks/${taskId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`
                        }
                    })
                    .then(response => response.json())
                    .then(taskData => {
                        if (taskData.data.status === 'finished') {
                            clearInterval(checkStatusInterval);
                            resultMessage.innerHTML = `¡Conversión completada! <a href="${taskData.data.result.files[0].url}" download>Descarga tu archivo convertido aquí.</a>`;
                        }
                    });
                }, 5000); // Revisar cada 5 segundos

            })
            .catch(error => {
                resultMessage.textContent = "Error al subir el archivo.";
                console.error(error);
            });

        } else {
            resultMessage.textContent = "Error al crear la tarea de conversión.";
        }
    })
    .catch(error => {
        resultMessage.textContent = "Error al crear la tarea de conversión.";
        console.error(error);
    });
});
