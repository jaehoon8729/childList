// main.js

window.onload = function() {
    if (loadData()) {
        displayData();
        showMessage('저장된 데이터를 불러왔습니다.');
    } else {
        showMessage('저장된 데이터가 없습니다. 새로운 데이터를 생성하거나 파일을 업로드하세요.', true);
    }

    // 파일 입력 요소에 이벤트 리스너 추가
    var fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    } else {
        console.error('File input element not found');
    }
};

// 전역 스코프에 필요한 함수들을 노출
window.handleFileUpload = handleFileUpload;
window.displayData = displayData;
window.showMessage = showMessage;
window.handleDeleteClass = handleDeleteClass;
window.deleteClass = deleteClass;
window.saveData = saveData;
window.exportData = exportData;