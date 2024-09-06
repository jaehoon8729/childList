// fileHandler.js
function handleFileUpload(event) {
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var content = e.target.result;
                var parsedData = JSON.parse(content);

                // 데이터 유효성 검사
                var validationResult = isValidKindergartenData(parsedData);
                if (validationResult.isValid) {
                    state.currentFileName = file.name;
                    state.currentData = parsedData;
                    displayData();
                    showMessage('파일이 성공적으로 로드되었습니다.');
                } else {
                    throw new Error('유효하지 않은 유치원 데이터 형식입니다: ' + validationResult.error);
                }
            } catch (error) {
                console.error('File reading error:', error);
                showMessage('파일을 읽는 중 오류가 발생했습니다: ' + error.message, true);
            }
        };
        reader.readAsText(file);
    }
}

function isValidKindergartenData(data) {
    if (!data || typeof data !== 'object') {
        return { isValid: false, error: '데이터가 객체가 아닙니다.' };
    }
    if (typeof data.kindergartenName !== 'string') {
        return { isValid: false, error: 'kindergartenName이 문자열이 아닙니다.' };
    }
    if (typeof data.year !== 'number') {
        return { isValid: false, error: 'year가 숫자가 아닙니다.' };
    }
    if (!Array.isArray(data.classes)) {
        return { isValid: false, error: 'classes가 배열이 아닙니다.' };
    }

    for (var i = 0; i < data.classes.length; i++) {
        var classValidation = isValidClass(data.classes[i]);
        if (!classValidation.isValid) {
            return { isValid: false, error: '클래스 ' + (i + 1) + '에서 오류: ' + classValidation.error };
        }
    }

    return { isValid: true };
}

function isValidClass(classData) {
    if (!classData || typeof classData !== 'object') {
        return { isValid: false, error: '클래스 데이터가 객체가 아닙니다.' };
    }
    if (typeof classData.className !== 'string') {
        return { isValid: false, error: 'className이 문자열이 아닙니다.' };
    }
    if (typeof classData.ageGroup !== 'string') {
        return { isValid: false, error: 'ageGroup이 문자열이 아닙니다.' };
    }
    if (typeof classData.teacher !== 'string') {
        return { isValid: false, error: 'teacher가 문자열이 아닙니다.' };
    }
    if (!Array.isArray(classData.students)) {
        return { isValid: false, error: 'students가 배열이 아닙니다.' };
    }

    for (var i = 0; i < classData.students.length; i++) {
        var studentValidation = isValidStudent(classData.students[i]);
        if (!studentValidation.isValid) {
            return { isValid: false, error: '학생 ' + (i + 1) + '에서 오류: ' + studentValidation.error };
        }
    }

    return { isValid: true };
}

function isValidStudent(student) {
    if (!student || typeof student !== 'object') {
        return { isValid: false, error: '학생 데이터가 객체가 아닙니다.' };
    }
    if (typeof student.name !== 'string') {
        return { isValid: false, error: 'name이 문자열이 아닙니다.' };
    }
    if (typeof student.gender !== 'string') {
        return { isValid: false, error: 'gender가 문자열이 아닙니다.' };
    }
    if (typeof student.birthdate !== 'string') {
        return { isValid: false, error: 'birthdate가 문자열이 아닙니다.' };
    }
    if (typeof student.bloodType !== 'string') {
        return { isValid: false, error: 'bloodType이 문자열이 아닙니다.' };
    }
    if (typeof student.note !== 'string') {
        return { isValid: false, error: 'note가 문자열이 아닙니다.' };
    }
    if (typeof student.pickedUp !== 'boolean') {
        return { isValid: false, error: 'pickedUp이 불리언이 아닙니다.' };
    }

    return { isValid: true };
}

function saveData() {
    if (state.currentData) {
        localStorage.setItem('kindergartenData', JSON.stringify(state.currentData));
        showMessage('데이터가 로컬 스토리지에 성공적으로 저장되었습니다.');
    } else {
        showMessage('저장할 데이터가 없습니다.', true);
    }
}

function exportData() {
    if (state.currentData) {
        var dataStr = JSON.stringify(state.currentData, null, 2);
        var blob = new Blob([dataStr], {type: "application/json"});
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.download = state.currentFileName || "kindergarten_data.json";
        link.href = url;
        link.click();
        showMessage('데이터가 파일로 성공적으로 내보내기 되었습니다.');
    } else {
        showMessage('내보낼 데이터가 없습니다.', true);
    }
}

function initializeApp() {
    // 로컬 스토리지에서 데이터 로드
    var savedData = localStorage.getItem('kindergartenData');
    if (savedData) {
        try {
            var parsedData = JSON.parse(savedData);
            var validationResult = isValidKindergartenData(parsedData);
            if (validationResult.isValid) {
                state.currentData = parsedData;
                state.currentFileName = 'local_storage_data.json';
                displayData();
                showMessage('저장된 데이터를 불러왔습니다.');
            } else {
                throw new Error('저장된 데이터가 유효하지 않습니다: ' + validationResult.error);
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
            showMessage('저장된 데이터를 불러오는 중 오류가 발생했습니다: ' + error.message, true);
            state.currentData = null;
            state.currentFileName = '';
        }
    } else {
        // 저장된 데이터가 없는 경우
        state.currentData = null;
        state.currentFileName = '';
        displayData(); // 빈 상태로 UI 초기화
    }
}