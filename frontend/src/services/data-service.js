import api from "../api/api";

function getClasses() {
    return api.get('/data');
}

function getGPA() {
    return api.get('/data/gpa');
}

function addClass(classData) {
    return api.post('/data', classData);
}

function updateClass(id, classData) {
    return api.put(`/data/${id}`, classData);
}

function deleteClass(id) {
    return api.delete(`/data/${id}`);
}

function getClassesBySemester() {
    return api.get('/data/by-semester');
}

function getSemesterGPA(semester) {
    return api.get(`/data/gpa/${encodeURIComponent(semester)}`);
}

export const dataService = {
    getClasses,
    getGPA,
    addClass,
    updateClass,
    deleteClass,
    getClassesBySemester,
    getSemesterGPA
};

export default dataService;