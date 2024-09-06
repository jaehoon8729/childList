// fileHandler.js
import { state, addClass, addStudent } from './data.js';
import { displayData } from './ui.js';
import { showMessage } from './utils.js';

export function handleFileUpload() {
    let file = document.getElementById('fileInput').files[0];
    if (file) {
        state.currentFileName = "test";
        state.currentFileName = file.name.toString();
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                state.currentData = JSON.parse(e.target.result);
                displayData();
                showMessage('파일이 성공적으로 로드되었습니다.');
            } catch (error) {
                showMessage('파일을 읽는 중 오류가 발생했습니다.', true);
            }
        };
        reader.readAsText(file);
    }
}

export function saveData() {
    if (state.currentData) {
        localStorage.setItem(state.currentFileName || 'unnamed_data', JSON.stringify(state.currentData));
        showMessage('데이터가 로컬 저장소에 저장되었습니다.');
    } else {
        showMessage('저장할 데이터가 없습니다.', true);
    }
}

export function exportData() {
    if (state.currentData) {
        const blob = new Blob([JSON.stringify(state.currentData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = state.currentFileName || 'exported_data.json';
        a.click();
        showMessage('데이터가 파일로 내보내졌습니다.');
    } else {
        showMessage('내보낼 데이터가 없습니다.', true);
    }
}

export function initializeApp() {
    const savedFiles = Object.keys(localStorage);
    if (savedFiles.length > 0) {
        state.currentFileName = savedFiles[0];
        try {
            state.currentData = JSON.parse(localStorage.getItem(state.currentFileName));
            displayData();
            showMessage('저장된 데이터를 불러왔습니다.');
        } catch (error) {
            showMessage('저장된 데이터를 불러오는 중 오류가 발생했습니다.', true);
        }
    }
}
