// utils.js
export function showModal(title, content, onSave) {
    // 기존 모달 제거 (중복 생성 방지)
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center';
    modal.innerHTML = `
        <div class="modal-content bg-white p-5 rounded-lg shadow-xl w-96">
            <h3 class="text-xl font-semibold mb-4">${title}</h3>
            <div id="modalContent"></div>
            <div class="mt-4 flex justify-end">
                <button id="saveButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">저장</button>
                <button id="cancelButton" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">취소</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const modalContent = modal.querySelector('#modalContent');
    modalContent.appendChild(content);

    const saveButton = modal.querySelector('#saveButton');
    const cancelButton = modal.querySelector('#cancelButton');

    saveButton.addEventListener('click', () => {
        onSave();
        document.body.removeChild(modal);
    });

    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

export function showMessage(message, isError = false) {
    Swal.fire({
        text: message,
        icon: isError ? 'error' : 'success',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
}