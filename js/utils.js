// utils.js
export function showModal(title, content, onSave) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center';
    modal.innerHTML = `
        <div class="bg-white p-5 rounded-lg shadow-xl w-96">
            <h3 class="text-xl font-semibold mb-4">${title}</h3>
            <div id="modalContent"></div>
            <div class="mt-4 flex justify-end">
                <button id="saveButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">저장</button>
                <button id="cancelButton" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">취소</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('modalContent').appendChild(content);

    document.getElementById('saveButton').onclick = () => {
        onSave();
        document.body.removeChild(modal);
    };
    document.getElementById('cancelButton').onclick = () => {
        document.body.removeChild(modal);
    };
}

export function showMessage(message, isError = false) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = `mt-4 p-4 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    messageElement.style.display = 'block';
    setTimeout(() => messageElement.style.display = 'none', 3000);
}
