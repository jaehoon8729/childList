// ui.js
import { state, addClass } from './data.js';
import { deleteClass, deleteStudent, editStudent, addStudent, updatePickupStatus } from './data.js';
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

        state.currentData.classes.forEach((classData, index) => {
            const classDiv = document.createElement('div');
            classDiv.className = 'mb-6 p-4 bg-gray-50 rounded shadow';

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
            deleteClassButton.onclick = () => handleDeleteClass(index);
            classDiv.appendChild(deleteClassButton);

            const studentsTable = document.createElement('table');
            studentsTable.className = 'w-full border-collapse border border-gray-300';
            studentsTable.innerHTML = `
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
                    ${classData.students.map((student, studentIndex) => `
                        <tr>
                            <td class="border border-gray-300 px-4 py-2">${student.name}</td>
                            <td class="border border-gray-300 px-4 py-2">${student.gender}</td>
                            <td class="border border-gray-300 px-4 py-2">${student.birthdate}</td>
                            <td class="border border-gray-300 px-4 py-2">${student.bloodType}</td>
                            <td class="border border-gray-300 px-4 py-2">${student.note}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                <label class="inline-flex items-center cursor-pointer">
                                    <input type="checkbox" class="hidden" ${student.pickedUp ? 'checked' : ''} onchange="updatePickupStatus(${index}, ${studentIndex}, this.checked)">
                                    <div class="relative">
                                        <div class="w-14 h-8 bg-gray-300 rounded-full shadow-inner transition-colors duration-300 ease-in-out ${student.pickedUp ? 'bg-green-400' : ''}"></div>
                                        <div class="absolute w-6 h-6 bg-white rounded-full shadow inset-y-1 left-1 transition-transform duration-300 ease-in-out ${student.pickedUp ? 'transform translate-x-6' : ''}"></div>
                                    </div>
                                    <span class="ml-2 text-sm font-medium text-gray-900">${student.pickedUp ? '하원' : '등원'}</span>
                                </label>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <button onclick="editStudent(${index}, ${studentIndex})" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm mr-1">수정</button>
                                <button onclick="deleteStudent(${index}, ${studentIndex})" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm">삭제</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            classDiv.appendChild(studentsTable);

            const addStudentButton = document.createElement('button');
            addStudentButton.className = 'mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded';
            addStudentButton.textContent = '학생 추가';
            addStudentButton.onclick = () => handleAddStudent(index);
            classDiv.appendChild(addStudentButton);

            dataView.appendChild(classDiv);
        });
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

    // Expose necessary functions to the global scope for inline event handlers
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
        displayData(); // 변경 사항을 즉시 반영하기 위해 화면을 다시 그립니다.
        showMessage(`${state.currentData.classes[classIndex].students[studentIndex].name}의 하원 상태가 ${isPickedUp ? '하원' : '등원'}으로 변경되었습니다.`);
    };
}

