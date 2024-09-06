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
