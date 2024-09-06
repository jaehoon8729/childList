// ui.js
import { state, addClass, deleteClass, addStudent, deleteStudent, editStudent, updatePickupStatus, moveClass, moveStudent } from './data.js';
import { showModal, showMessage } from './utils.js';

export function displayData() {
    const dataView = document.getElementById('dataView');
    dataView.innerHTML = '';

    if (state.currentData.kindergartenName && state.currentData.year && state.currentData.classes) {
        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-4';
        title.textContent = `${state.currentData.kindergartenName} (${state.currentData.year}년)`;
        dataView.appendChild(title);

        const addClassButton = document.createElement('button');
        addClassButton.className = 'mb-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded';
        addClassButton.textContent = '반 추가';
        addClassButton.onclick = addClassHandler;
        dataView.appendChild(addClassButton);

        const classesList = document.createElement('div');
        classesList.id = 'classesList';
        classesList.className = 'space-y-4';

        state.currentData.classes.forEach((classData, classIndex) => {
            const classDiv = document.createElement('div');
            classDiv.className = 'p-4 bg-gray-50 rounded shadow';
            classDiv.dataset.classIndex = classIndex;

            const dragHandle = document.createElement('div');
            dragHandle.className = 'drag-handle float-left mr-2';
            dragHandle.innerHTML = '☰';
            dragHandle.draggable = true;
            dragHandle.ondragstart = (e) => dragStart(e, 'class', classIndex);
            classDiv.appendChild(dragHandle);

            const classTitle = document.createElement('h3');
            classTitle.className = 'text-xl font-semibold mb-2';
            classTitle.textContent = `${classData.className} (${classData.ageGroup})`;
            classDiv.appendChild(classTitle);

            const teacherInfo = document.createElement('p');
            teacherInfo.className = 'mb-2 text-gray-600';
            teacherInfo.textContent = `담임: ${classData.teacher}`;
            classDiv.appendChild(teacherInfo);

            const deleteClassButton = document.createElement('button');
            deleteClassButton.className = 'mb-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm';
            deleteClassButton.textContent = '반 삭제';
            deleteClassButton.onclick = () => handleDeleteClass(classIndex);
            classDiv.appendChild(deleteClassButton);

            const studentsTable = document.createElement('table');
            studentsTable.className = 'w-full border-collapse border border-gray-300';
            studentsTable.innerHTML = `
                <thead>
                    <tr class="bg-gray-200">
                        <th class="border border-gray-300 px-4 py-2"></th>
                        <th class="border border-gray-300 px-4 py-2">이름</th>
                        <th class="border border-gray-300 px-4 py-2">성별</th>
                        <th class="border border-gray-300 px-4 py-2">생년월일</th>
                        <th class="border border-gray-300 px-4 py-2">혈액형</th>
                        <th class="border border-gray-300 px-4 py-2">특이사항</th>
                        <th class="border border-gray-300 px-4 py-2">하원 여부</th>
                        <th class="border border-gray-300 px-4 py-2">작업</th>
                    </tr>
                </thead>
                <tbody>
                    ${classData.students.map((student, studentIndex) => `
                        <tr data-student-index="${studentIndex}">
                            <td class="border border-gray-300 px-4 py-2">
                                <div class="drag-handle cursor-move" draggable="true" data-class-index="${classIndex}" data-student-index="${studentIndex}">☰</div>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">${student.name}</td>
                            <td class="border border-gray-300 px-4 py-2">${student.gender}</td>
                            <td class="border border-gray-300 px-4 py-2">${student.birthdate}</td>
                            <td class="border border-gray-300 px-4 py-2">${student.bloodType}</td>
                            <td class="border border-gray-300 px-4 py-2">${student.note}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                <label class="pickup-toggle">
                                    <input type="checkbox" ${student.pickedUp ? 'checked' : ''} onchange="updatePickupStatus(${classIndex}, ${studentIndex}, this.checked)">
                                    <span class="pickup-slider"></span>
                                </label>
                                <span class="pickup-status">${student.pickedUp ? '하원' : '등원'}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <button onclick="editStudent(${classIndex}, ${studentIndex})" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm mr-1">수정</button>
                                <button onclick="deleteStudent(${classIndex}, ${studentIndex})" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm">삭제</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            classDiv.appendChild(studentsTable);

            const addStudentButton = document.createElement('button');
            addStudentButton.className = 'mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded';
            addStudentButton.textContent = '학생 추가';
            addStudentButton.onclick = () => handleAddStudent(classIndex);
            classDiv.appendChild(addStudentButton);

            classesList.appendChild(classDiv);
        });

        dataView.appendChild(classesList);
    }

    // 드래그 앤 드롭 이벤트 핸들러
    function dragStart(e, type, classIndex, studentIndex) {
        e.dataTransfer.setData('text/plain', JSON.stringify({
            type,
            classIndex,
            studentIndex
        }));
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const targetClassDiv = e.target.closest('[data-class-index]');
        const targetClassIndex = targetClassDiv ? parseInt(targetClassDiv.dataset.classIndex) : null;

        if (data.type === 'class' && targetClassIndex !== null) {
            const fromIndex = parseInt(data.classIndex);
            if (fromIndex !== targetClassIndex) {
                moveClass(fromIndex, targetClassIndex);
                displayData();
                showMessage('반 순서가 변경되었습니다.');
            }
        } else if (data.type === 'student') {
            const fromClassIndex = parseInt(data.classIndex);
            const fromStudentIndex = parseInt(data.studentIndex);
            const targetStudentRow = e.target.closest('[data-student-index]');

            if (targetClassIndex !== null && targetStudentRow) {
                const toStudentIndex = parseInt(targetStudentRow.dataset.studentIndex);
                moveStudent(fromClassIndex, fromStudentIndex, targetClassIndex, toStudentIndex);
                displayData();
                showMessage('학생 순서가 변경되었습니다.');
            }
        }
    }

    // 드래그 앤 드롭 이벤트 리스너 추가
    document.querySelectorAll('#classesList > div').forEach(classDiv => {
        classDiv.ondragover = dragOver;
        classDiv.ondrop = drop;
    });

    document.querySelectorAll('tr [draggable="true"]').forEach(handle => {
        handle.ondragstart = (e) => dragStart(e, 'student', handle.dataset.classIndex, handle.dataset.studentIndex);
    });

    // 전역 스코프에 필요한 함수들을 노출
    window.editStudent = (classIndex, studentIndex) => {
        const student = state.currentData.classes[classIndex].students[studentIndex];
        const form = document.createElement('form');
        form.innerHTML = `
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="name">이름:</label>
                <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" value="${student.name}">
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="gender">성별:</label>
                <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="gender">
                    <option value="남" ${student.gender === '남' ? 'selected' : ''}>남</option>
                    <option value="여" ${student.gender === '여' ? 'selected' : ''}>여</option>
                </select>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="birthdate">생년월일:</label>
                <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="birthdate" type="date" value="${student.birthdate}">
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="bloodType">혈액형:</label>
                <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="bloodType">
                    <option value="A" ${student.bloodType === 'A' ? 'selected' : ''}>A</option>
                    <option value="B" ${student.bloodType === 'B' ? 'selected' : ''}>B</option>
                    <option value="O" ${student.bloodType === 'O' ? 'selected' : ''}>O</option>
                    <option value="AB" ${student.bloodType === 'AB' ? 'selected' : ''}>AB</option>
                </select>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="note">특이사항:</label>
                <textarea class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="note">${student.note}</textarea>
            </div>
        `;

        showModal('학생 정보 수정', form, () => {
            const updatedStudent = {
                name: document.getElementById('name').value,
                gender: document.getElementById('gender').value,
                birthdate: document.getElementById('birthdate').value,
                bloodType: document.getElementById('bloodType').value,
                note: document.getElementById('note').value
            };
            editStudent(classIndex, studentIndex, updatedStudent);
            displayData();
            showMessage('학생 정보가 수정되었습니다.');
        });
    };

    window.deleteStudent = (classIndex, studentIndex) => {
        if (confirm('정말로 이 학생을 삭제하시겠습니까?')) {
            deleteStudent(classIndex, studentIndex);
            displayData();
            showMessage('학생이 삭제되었습니다.');
        }
    };

    window.updatePickupStatus = (classIndex, studentIndex, isPickedUp) => {
        updatePickupStatus(classIndex, studentIndex, isPickedUp);
        displayData();
        showMessage(`${state.currentData.classes[classIndex].students[studentIndex].name}의 하원 상태가 ${isPickedUp ? '하원' : '등원'}으로 변경되었습니다.`);
    };
}

function addClassHandler() {
    const form = document.createElement('form');
    form.innerHTML = `
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="className">반 이름:</label>
            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="className" type="text">
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="ageGroup">연령대:</label>
            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="ageGroup" type="text">
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="teacher">담임 선생님:</label>
            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="teacher" type="text">
        </div>
    `;

    showModal('새 반 추가', form, () => {
        const newClass = {
            className: document.getElementById('className').value,
            ageGroup: document.getElementById('ageGroup').value,
            teacher: document.getElementById('teacher').value,
            students: []
        };
        addClass(newClass);
        displayData();
        showMessage('새 반이 추가되었습니다.');
    });
}

function handleDeleteClass(classIndex) {
    if (confirm('정말로 이 반을 삭제하시겠습니까? 모든 학생 정보가 함께 삭제됩니다.')) {
        deleteClass(classIndex);
        deleteClass(classIndex);
        displayData();
        showMessage('반이 삭제되었습니다.');
    }
}

function handleAddStudent(classIndex) {
    const form = document.createElement('form');
    form.innerHTML = `
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="name">이름:</label>
            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text">
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="gender">성별:</label>
            <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="gender">
                <option value="남">남</option>
                <option value="여">여</option>
            </select>
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="birthdate">생년월일:</label>
            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="birthdate" type="date">
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="bloodType">혈액형:</label>
            <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="bloodType">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="O">O</option>
                <option value="AB">AB</option>
            </select>
        </div>
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="note">특이사항:</label>
            <textarea class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="note"></textarea>
        </div>
    `;

    showModal('새 학생 추가', form, () => {
        const newStudent = {
            id: Date.now(),
            name: document.getElementById('name').value,
            gender: document.getElementById('gender').value,
            birthdate: document.getElementById('birthdate').value,
            bloodType: document.getElementById('bloodType').value,
            note: document.getElementById('note').value,
            pickedUp: false
        };
        addStudent(classIndex, newStudent);
        displayData();
        showMessage('새 학생이 추가되었습니다.');
    });
}

// 파일 업로드 처리 함수
export function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                state.currentData = data;
                state.currentFileName = file.name;
                displayData();
                showMessage('파일이 성공적으로 업로드되었습니다.');
            } catch (error) {
                showMessage('파일 읽기 오류: 유효한 JSON 파일이 아닙니다.', true);
            }
        };
        reader.readAsText(file);
    }
}

// 데이터 저장 함수
export function saveData() {
    if (state.currentData) {
        const dataStr = JSON.stringify(state.currentData);
        const blob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = state.currentFileName || "kindergarten_data.json";
        link.href = url;
        link.click();
        showMessage('데이터가 성공적으로 저장되었습니다.');
    } else {
        showMessage('저장할 데이터가 없습니다.', true);
    }
}

// 데이터 내보내기 함수
export function exportData() {
    if (state.currentData) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.currentData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", state.currentFileName || "kindergarten_data.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showMessage('데이터가 성공적으로 내보내기 되었습니다.');
    } else {
        showMessage('내보낼 데이터가 없습니다.', true);
    }
}

// 초기 데이터 로드 함수
export function initializeApp() {
    // 로컬 스토리지에서 데이터 로드
    const savedData = localStorage.getItem('kindergartenData');
    if (savedData) {
        try {
            state.currentData = JSON.parse(savedData);
            state.currentFileName = 'local_storage_data.json';
            displayData();
            showMessage('저장된 데이터를 불러왔습니다.');
        } catch (error) {
            showMessage('저장된 데이터를 불러오는 중 오류가 발생했습니다.', true);
        }
    }
}