// data.js

var state = {
    currentFileName: '',
    currentData: null
};

function addClass(newClass) {
    if (!state.currentData.classes) {
        state.currentData.classes = [];
    }
    state.currentData.classes.push(newClass);
    saveData(); // 변경사항 자동 저장
}

function deleteClass(classIndex) {
    console.log('Deleting class at index:', classIndex);
    if (state.currentData && state.currentData.classes && state.currentData.classes.length > classIndex) {
        state.currentData.classes.splice(classIndex, 1);
        saveData(); // 변경사항 자동 저장
        console.log('Class deleted. New state:', state.currentData);
        return true;
    }
    console.error('Failed to delete class. Invalid state or class index.');
    return false;
}

function addStudent(classIndex, newStudent) {
    if (!state.currentData.classes[classIndex].students) {
        state.currentData.classes[classIndex].students = [];
    }
    state.currentData.classes[classIndex].students.push(newStudent);
    saveData(); // 변경사항 자동 저장
}

function deleteStudent(classIndex, studentIndex) {
    if (state.currentData &&
        state.currentData.classes &&
        state.currentData.classes[classIndex] &&
        state.currentData.classes[classIndex].students) {

        state.currentData.classes[classIndex].students.splice(studentIndex, 1);
        saveData(); // 변경사항 자동 저장
        return true;
    }
    return false;
}

function editStudent(classIndex, studentIndex, updatedStudent) {
    console.log('Editing student:', classIndex, studentIndex, updatedStudent);
    console.log('Current state:', state.currentData);

    if (state.currentData &&
        state.currentData.classes &&
        state.currentData.classes[classIndex] &&
        state.currentData.classes[classIndex].students &&
        state.currentData.classes[classIndex].students[studentIndex]) {

        state.currentData.classes[classIndex].students[studentIndex] = {
            ...state.currentData.classes[classIndex].students[studentIndex],
            ...updatedStudent
        };
        console.log('Updated student:', state.currentData.classes[classIndex].students[studentIndex]);
        saveData(); // 변경사항 자동 저장
        return true;
    } else {
        console.error('Failed to edit student. Invalid state or indices.');
        return false;
    }
}

function updatePickupStatus(classIndex, studentIndex, isPickedUp) {
    state.currentData.classes[classIndex].students[studentIndex].pickedUp = isPickedUp;
    saveData(); // 변경사항 자동 저장
}

function saveData() {
    if (state.currentData) {
        localStorage.setItem('kindergartenData', JSON.stringify(state.currentData));
        console.log('Data saved:', state.currentData);
    } else {
        console.error('No data to save');
    }
}

function loadData() {
    var savedData = localStorage.getItem('kindergartenData');
    if (savedData) {
        try {
            state.currentData = JSON.parse(savedData);
            console.log('데이터를 불러왔습니다:', state.currentData);
            return true;
        } catch (error) {
            console.error('저장된 데이터를 불러오는 중 오류가 발생했습니다:', error);
        }
    }
    return false;
}

// 전역 스코프에 함수 노출
window.addClass = addClass;
window.deleteClass = deleteClass;
window.addStudent = addStudent;
window.deleteStudent = deleteStudent;
window.editStudent = editStudent;
window.updatePickupStatus = updatePickupStatus;
window.saveData = saveData;
window.loadData = loadData;