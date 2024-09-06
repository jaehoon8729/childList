// utils.js

function showModal(title, content, onSave) {
    // 기존 모달 제거 (중복 생성 방지)
    var existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }

    var modal = document.createElement('div');
    modal.className = 'modal-overlay fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center';
    modal.innerHTML = '<div class="modal-content bg-white p-5 rounded-lg shadow-xl w-96">' +
        '<h3 class="text-xl font-semibold mb-4">' + title + '</h3>' +
        '<div id="modalContent"></div>' +
        '<div class="mt-4 flex justify-end">' +
        '<button id="saveButton" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">저장</button>' +
        '<button id="cancelButton" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">취소</button>' +
        '</div>' +
        '</div>';
    document.body.appendChild(modal);

    var modalContent = modal.querySelector('#modalContent');
    modalContent.appendChild(content);

    var saveButton = modal.querySelector('#saveButton');
    var cancelButton = modal.querySelector('#cancelButton');

    function closeModal() {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }

    saveButton.addEventListener('click', function() {
        onSave();
        closeModal();
    });

    cancelButton.addEventListener('click', closeModal);

    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function showMessage(message, isError) {
    Swal.fire({
        text: message,
        icon: isError ? 'error' : 'success',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: function(toast) {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
}