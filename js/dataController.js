import Alpine from '../lib/alpinejs@3.14.1.esm.min.js';
import Sortable from "../lib/sortable.esm.js";

Alpine.data('kindergartenApp', () => ({
    currentData: {},
    currentFileName: '',
    sortableInstances: [],

    init() {
        this.initializeApp();

        this.$nextTick(() => {
            this.initializeSortable();
        });
        this.$watch('currentData.classes', (newValue) => {
            this.initializeSortable();
        })
    },

    initializeApp() {
        const savedData = localStorage.getItem('kindergartenData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                if (this.isValidKindergartenData(parsedData)) {
                    this.setCurrentData(parsedData);
                    this.currentFileName = 'local_storage_data.json';
                    this.showMessage('저장된 데이터를 불러왔습니다.');
                } else {
                    throw new Error('저장된 데이터가 유효하지 않습니다.');
                }
            } catch (error) {
                console.error('Error loading saved data:', error);
                this.showMessage('저장된 데이터를 불러오는 중 오류가 발생했습니다: ' + error.message, true);
                this.setCurrentData(this.getEmptyData());
                this.currentFileName = '';
            }
        } else {
            this.setCurrentData(this.getEmptyData());
            this.currentFileName = '';
        }
    },

    getEmptyData() {
        return {
            kindergartenName: '',
            year: new Date().getFullYear(),
            classes: []
        };
    },

    setCurrentData(data) {
        Object.keys(data).forEach(key => {
            this.currentData[key] = data[key];
        });
    },

    initializeSortable() {
        this.sortableInstances.forEach(instance => instance.destroy());
        this.sortableInstances = [];

        const classesList = document.getElementById('classesList');
        if (classesList) {
            const classesInstance = new Sortable(classesList, {
                animation: 150,
                handle: '.text-xl',
                onEnd: (evt) => {
                    const fromIndex = evt.oldIndex;
                    const toIndex = evt.newIndex;
                    if (fromIndex !== toIndex) {
                        this.moveClass(fromIndex, toIndex);
                        this.showMessage('반 순서가 변경되었습니다.');
                    }
                },
            });
            this.sortableInstances.push(classesInstance);
        }

        if (this.currentData && Array.isArray(this.currentData.classes)) {
            this.currentData.classes.forEach((classData, classIndex) => {
                const studentsList = document.querySelector(`[data-class-index="${classIndex}"] tbody`);
                if (studentsList) {
                    const studentsInstance = new Sortable(studentsList, {
                        animation: 150,
                        onEnd: (evt) => {
                            const fromIndex = evt.oldIndex;
                            const toIndex = evt.newIndex;
                            if (fromIndex !== toIndex) {
                                this.moveStudent(classIndex, fromIndex, toIndex);
                                this.showMessage('학생 순서가 변경되었습니다.');
                            }
                        },
                    });
                    this.sortableInstances.push(studentsInstance);
                }
            });
        }
    },

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    const parsedData = JSON.parse(content);
                    if (this.isValidKindergartenData(parsedData)) {
                        this.currentFileName = file.name;
                        this.currentData = parsedData;
                        this.showMessage('파일이 성공적으로 로드되었습니다.');
                        this.$nextTick(() => this.initializeSortable());
                    } else {
                        throw new Error('유효하지 않은 유치원 데이터 형식입니다.');
                    }
                } catch (error) {
                    console.error('File reading error:', error);
                    this.showMessage('파일을 읽는 중 오류가 발생했습니다: ' + error.message, true);
                }
            };
            reader.readAsText(file);
        }
    },

    saveData() {
        if (this.currentData) {
            localStorage.setItem('kindergartenData', JSON.stringify(this.currentData));
            this.showMessage('데이터가 로컬 스토리지에 성공적으로 저장되었습니다.');
        } else {
            this.showMessage('저장할 데이터가 없습니다.', true);
        }
    },

    exportData() {
        if (this.currentData) {
            const dataStr = JSON.stringify(this.currentData, null, 2);
            const blob = new Blob([dataStr], {type: "application/json"});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = this.currentFileName || "kindergarten_data.json";
            link.href = url;
            link.click();
            this.showMessage('데이터가 파일로 성공적으로 내보내기 되었습니다.');
        } else {
            this.showMessage('내보낼 데이터가 없습니다.', true);
        }
    },

    addClass(newClass) {
        this.currentData.classes.push(newClass);
    },

    deleteClass(classIndex) {
        this.currentData.classes.splice(classIndex, 1);
    },

    addStudent(classIndex, newStudent) {
        this.currentData.classes[classIndex].students.push(newStudent);
    },

    deleteStudent(classIndex, studentIndex) {
        this.currentData.classes[classIndex].students.splice(studentIndex, 1);
    },

    editStudent(classIndex, studentIndex, updatedStudent) {
        this.currentData.classes[classIndex].students[studentIndex] = {
            ...this.currentData.classes[classIndex].students[studentIndex],
            ...updatedStudent
        };
    },

    updateVehicleStatus(classIndex, studentIndex, vehicle) {
        this.currentData.classes[classIndex].students[studentIndex].vehicle = vehicle;
        const studentName = this.currentData.classes[classIndex].students[studentIndex].name;
        this.showMessage(`${studentName}의 등/하원 방식이 ${vehicle ? '보도' : '차량'}으로 변경되었습니다.`);
        localStorage.setItem('kindergartenData', JSON.stringify(this.currentData));
    },

    updatePickupStatus(classIndex, studentIndex, isPickedUp) {
        this.currentData.classes[classIndex].students[studentIndex].pickedUp = isPickedUp;
        const studentName = this.currentData.classes[classIndex].students[studentIndex].name;
        this.showMessage(`${studentName}의 등/하원 여부가 ${isPickedUp ? '하원' : '등원'}으로 변경되었습니다.`);
        localStorage.setItem('kindergartenData', JSON.stringify(this.currentData));
    },

    moveClass(fromIndex, toIndex) {
        const classes = [...this.currentData.classes];
        const [removedClass] = classes.splice(fromIndex, 1);
        classes.splice(toIndex, 0, removedClass);
        this.currentData.classes = classes;
    },

    moveStudent(classIndex, toIndex, fromIndex) {
        const classes = [...this.currentData.classes];
        const currentClass = {...classes[classIndex]};
        const students = [...currentClass.students];
        console.log("students", students)
        const [movedStudent] = students.splice(fromIndex, 1);
        students.splice(toIndex, 0, movedStudent);

        currentClass.students = students;
        classes[classIndex] = currentClass;
        console.log(classes)
        this.currentData.classes = classes;
    },


    showMessage(message, isError = false) {
        Swal.fire({
            text: message,
            icon: isError ? 'error' : 'success',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });
    },

    showModal(title, content, onSave) {
        Swal.fire({
            title: title,
            html: content,
            showCancelButton: true,
            confirmButtonText: '저장',
            cancelButtonText: '취소',
            preConfirm: onSave
        });
    },

    isValidKindergartenData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!Array.isArray(data.classes)) return false;
        if (typeof data.kindergartenName !== 'string') return false;
        if (typeof data.year !== 'number') return false;

        for (let classData of data.classes) {
            if (typeof classData.className !== 'string') return false;
            if (typeof classData.ageGroup !== 'string') return false;
            if (typeof classData.teacher !== 'string') return false;
            if (!Array.isArray(classData.students)) return false;

            for (let student of classData.students) {
                if (typeof student.name !== 'string') return false;
                if (typeof student.note !== 'string') return false;
                if (typeof student.pickedUp !== 'boolean') return false;
            }
        }

        return true;
    },

    editStudentHandler(classIndex, studentIndex) {
        const student = this.currentData.classes[classIndex].students[studentIndex];
        const content = `
            <form id="editStudentForm">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="name">이름:</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" value="${student.name}">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="note">특이사항:</label>
                    <textarea class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="note">${student.note}</textarea>
                </div>
            </form>
        `;

        this.showModal('학생 정보 수정', content, () => {
            const form = document.getElementById('editStudentForm');
            const updatedStudent = {
                name: form.name.value,
                note: form.note.value
            };
            this.editStudent(classIndex, studentIndex, updatedStudent);
            this.showMessage('학생 정보가 수정되었습니다.');
        });
    },

    deleteStudentHandler(classIndex, studentIndex) {
        Swal.fire({
            title: '학생 삭제',
            text: '정말로 이 학생을 삭제하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                this.deleteStudent(classIndex, studentIndex);
                this.showMessage('학생이 삭제되었습니다.');
            }
        });
    },

    addClassHandler() {
        const content = `
            <form id="addClassForm">
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
            </form>
        `;

        this.showModal('새 반 추가', content, () => {
            const form = document.getElementById('addClassForm');
            const newClass = {
                className: form.className.value,
                ageGroup: form.ageGroup.value,
                teacher: form.teacher.value,
                students: []
            };
            this.addClass(newClass);
            this.showMessage('새 반이 추가되었습니다.');
        });
    },

    handleDeleteClass(classIndex) {
        Swal.fire({
            title: '반 삭제',
            text: '정말로 이 반을 삭제하시겠습니까? 모든 학생 정보가 함께 삭제됩니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                this.deleteClass(classIndex);
                this.showMessage('반이 삭제되었습니다.');
            }
        });
    },

    handleAddStudent(classIndex) {
        const content = `
            <form id="addStudentForm">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="name">이름:</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="note">특이사항:</label>
                    <textarea class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="note"></textarea>
                </div>
            </form>
        `;

        this.showModal('새 학생 추가', content, () => {
            const form = document.getElementById('addStudentForm');
            const newStudent = {
                name: form.name.value,
                note: form.note.value,
                vehicle: '보도',
                pickedUp: false
            };
            this.addStudent(classIndex, newStudent);
            this.showMessage('새 학생이 추가되었습니다.');
        });
    }
}));