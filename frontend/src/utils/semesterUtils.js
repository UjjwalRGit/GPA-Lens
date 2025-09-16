export function getSemesters() {
    const currentYear = new Date().getFullYear();
    const semesters = [];

    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
        semesters.push(`Spring ${year}`);
        semesters.push(`Summer ${year}`);
        semesters.push(`Fall ${year}`);
    }

    return semesters;
}

export function getCurrentSemester() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    if (month >= 1 && month <= 5) {
        return `Spring ${year}`;
    } else if (month >= 6 && month <= 8) {
        return `Summer ${year}`;
    } else {
        return `Fall ${year}`;
    }
}

export function sortSemesters(semesters) {
    const seasonOrder = { 'Spring': 1, 'Summer': 2, 'Fall': 3};

    return semesters.sort((a, b) => {
        const [seasonA, yearA] = a.split(' ');
        const [seasonB, yearB] = b.split(' ');

        if (yearA !== yearB) {
            return parseInt(yearB) - parseInt(yearA);
        }

        return seasonOrder[seasonB] - seasonOrder[seasonA];
    });
}

export function sortChronologically(semesters) {
    const seasonOrder = { 'Spring': 1, 'Summer': 2, 'Fall': 3};

    return semesters.sort((a, b) => {
        const [seasonA, yearA] = a.split(' ');
        const [seasonB, yearB] = b.split(' ');

        if (yearA !== yearB) {
            return parseInt(yearA) - parseInt(yearB);
        }

        return seasonOrder[seasonA] - seasonOrder[seasonB];
    })
}