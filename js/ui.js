// ui.js
import { state, addClass, deleteClass, addStudent, deleteStudent, editStudent, updatePickupStatus, moveClass, moveStudent } from './data.js';
import { showModal, showMessage } from './utils.js';

let Sortable;

// SortableJS 동적 로드
async function loadSortable() {
    if (!Sortable) {
        Sortable = (await import('../lib/sortable.esm.js')).default;
    }
}

export async function displayData() {
    await loadSortable();  // Sortable 로드 확인

    const dataView = document.getElementById('dataView');
    dataView.innerHTML = '';

    if (!state.currentData) {
        dataView.innerHTML = '<p class="text-center text-gray-500">데이터가 없습니다. 파일을 업로드하거나 새로운 데이터를 생성하세요.</p>';
        return;
    }

    const { kindergartenName, year, classes } = state.currentData;

    if (kindergartenName && year && Array.isArray(classes)) {
        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-4';
        title.textContent = `${kindergartenName} (${year}년)`;
        dataView.appendChild(title);

        const addClassButton = document.createElement('button');
        addClassButton.className = 'mb-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded';
        addClassButton.textContent = '반 추가';
        addClassButton.onclick = addClassHandler;
        dataView.appendChild(addClassButton);

        const classesList = document.createElement('div');
        classesList.id = 'classesList';
        classesList.className = 'space-y-4';

        classes.forEach((classData, classIndex) => {
            const classDiv = createClassElement(classData, classIndex);
            classesList.appendChild(classDiv);
        });

        dataView.appendChild(classesList);

        // SortableJS 초기화
        initializeSortable(classesList);
    } else {
        dataView.innerHTML = '<p class="text-center text-red-500">유효하지 않은 데이터 형식입니다.</p>';
    }

    // 전역 스코프에 필요한 함수들을 노출
    window.editStudent = editStudentHandler;
    window.deleteStudent = deleteStudentHandler;
    window.updatePickupStatus = updatePickupStatusHandler;
}

function createClassElement(classData, classIndex) {
    const classDiv = document.createElement('div');
    classDiv.className = 'p-4 bg-gray-50 rounded shadow';
    classDiv.dataset.classIndex = classIndex;

    const classTitle = document.createElement('h3');
    classTitle.className = 'text-xl font-semibold mb-2 cursor-move';
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

    const studentsTable = createStudentsTable(classData.students, classIndex);
    classDiv.appendChild(studentsTable);

    const addStudentButton = document.createElement('button');
    addStudentButton.className = 'mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded';
    addStudentButton.textContent = '학생 추가';
    addStudentButton.onclick = () => handleAddStudent(classIndex);
    classDiv.appendChild(addStudentButton);

    return classDiv;
}

function createStudentsTable(students, classIndex) {
    const table = document.createElement('table');
    table.className = 'w-full border-collapse border border-gray-300';
    table.innerHTML = `
        <thead>
            <tr class="bg-gray-200">
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
            ${students.map((student, studentIndex) => createStudentRow(student, classIndex, studentIndex)).join('')}
        </tbody>
    `;
    return table;
}

function createStudentRow(student, classIndex, studentIndex) {
    return `
        <tr data-student-index="${studentIndex}">
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
    `;
}

function initializeSortable(classesList) {
    new Sortable(classesList, {
        animation: 150,
        handle: '.text-xl',
        onEnd: function (evt) {
            const fromIndex = evt.oldIndex;
            const toIndex = evt.newIndex;
            if (fromIndex !== toIndex) {
                moveClass(fromIndex, toIndex);
                showMessage('반 순서가 변경되었습니다.');
            }
        },
    });

    state.currentData.classes.forEach((classData, classIndex) => {
        const studentsList = document.querySelector(`[data-class-index="${classIndex}"] tbody`);
        new Sortable(studentsList, {
            animation: 150,
            onEnd: function (evt) {
                const fromIndex = evt.oldIndex;
                const toIndex = evt.newIndex;
                if (fromIndex !== toIndex) {
                    moveStudent(classIndex, fromIndex, classIndex, toIndex);
                    showMessage('학생 순서가 변경되었습니다.');
                }
            },
        });
    });
}

function editStudentHandler(classIndex, studentIndex) {
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
}

function deleteStudentHandler(classIndex, studentIndex) {
    if (confirm('정말로 이 학생을 삭제하시겠습니까?')) {
        deleteStudent(classIndex, studentIndex);
        displayData();
        showMessage('학생이 삭제되었습니다.');
    }
}

function updatePickupStatusHandler(classIndex, studentIndex, isPickedUp) {
    updatePickupStatus(classIndex, studentIndex, isPickedUp);
    const studentName = state.currentData.classes[classIndex].students[studentIndex].name;
    const statusElement = document.querySelector(`[data-class-index="${classIndex}"] [data-student-index="${studentIndex}"] .pickup-status`);
    if (statusElement) {
        statusElement.textContent = isPickedUp ? '하원' : '등원';
    }
    showMessage(`${studentName}의 하원 상태가 ${isPickedUp ? '하원' : '등원'}으로 변경되었습니다.`);
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

// 기존의 함수들 (editStudent, deleteStudent, updatePickupStatus 등)은 제거하고
// 대신 위에서 정의한 handler 함수들을 사용합니다.