// main.js
import { handleFileUpload, saveData, exportData, initializeApp } from './fileHandler.js';
import { displayData } from './ui.js';

// 이벤트 핸들러를 전역에 연결
window.handleFileUpload = handleFileUpload;
window.saveData = saveData;
window.exportData = exportData;
window.displayData = displayData;

// 초기화
window.onload = async function() {
    await initializeApp();

    // 파일 입력 요소에 이벤트 리스너 추가
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    } else {
        console.error('File input element not found');
    }

    // 저장하기 버튼에 이벤트 리스너 추가
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', saveData);
    } else {
        console.error('Save button not found');
    }

    // 내보내기 버튼에 이벤트 리스너 추가
    const exportButton = document.getElementById('exportButton');
    if (exportButton) {
        exportButton.addEventListener('click', exportData);
    } else {
        console.error('Export button not found');
    }
};