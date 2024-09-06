// main.js
import { handleFileUpload, saveData, exportData, initializeApp } from './fileHandler.js';
import { displayData } from './ui.js';

// 이벤트 핸들러를 전역에 연결
window.handleFileUpload = handleFileUpload;
window.saveData = saveData;
window.exportData = exportData;
window.displayData = displayData;

// 초기화
window.onload = function() {
    initializeApp();
};
