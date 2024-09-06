export const state = {
    currentFileName: '',
    currentData: null
};
export function addClass(newClass) {
    state.currentData.classes.push(newClass);
}

export function deleteClass(classIndex) {
    state.currentData.classes.splice(classIndex, 1);
}

export function addStudent(classIndex, newStudent) {
    state.currentData.classes[classIndex].students.push(newStudent);
}

export function deleteStudent(classIndex, studentIndex) {
    state.currentData.classes[classIndex].students.splice(studentIndex, 1);
}

export function editStudent(classIndex, studentIndex, updatedStudent) {
    state.currentData.classes[classIndex].students[studentIndex] = {
        ...state.currentData.classes[classIndex].students[studentIndex],
        ...updatedStudent
    };
}

export function updatePickupStatus(classIndex, studentIndex, isPickedUp) {
    state.currentData.classes[classIndex].students[studentIndex].pickedUp = isPickedUp;
}

export function moveClass(fromIndex, toIndex) {
    const [removedClass] = state.currentData.classes.splice(fromIndex, 1);
    state.currentData.classes.splice(toIndex, 0, removedClass);
}

export function moveStudent(fromClassIndex, fromStudentIndex, toClassIndex, toStudentIndex) {
    const fromClass = state.currentData.classes[fromClassIndex];
    const [movedStudent] = fromClass.students.splice(fromStudentIndex, 1);

    if (fromClassIndex === toClassIndex) {
        // 같은 반 내에서 이동
        fromClass.students.splice(toStudentIndex, 0, movedStudent);
    } else {
        // 다른 반으로 이동
        state.currentData.classes[toClassIndex].students.splice(toStudentIndex, 0, movedStudent);
    }
}