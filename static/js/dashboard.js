const DASHBOARD_API_BASE_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
});


// ===============================
// LOAD DASHBOARD
// ===============================

async function loadDashboard() {
    try {
        const studentsResponse = await fetch(
    `${DASHBOARD_API_BASE_URL}/students/`,
    {
        credentials: "include"
    }
    );

         
const resultsResponse = await fetch(
    `${DASHBOARD_API_BASE_URL}/results/`,
    {
        credentials: "include"
    }
);

const notificationsResponse = await fetch(
    `${DASHBOARD_API_BASE_URL}/notifications/`,
    {
        credentials: "include"
    }
);
 


        if (!studentsResponse.ok || !resultsResponse.ok) {
            throw new Error("Unable to load dashboard data.");
        }

        const students = await studentsResponse.json();
        const results = await resultsResponse.json();

        let notifications = [];

        if (notificationsResponse.ok) {
            notifications = await notificationsResponse.json();
        }

        const parent = {
            students: students,
            results: results,
            notifications: notifications
        };

        loadParentName();
        loadDashboardStats(parent);
        loadDashboardWards(parent);
        loadAcademicPerformance(parent);
        loadRecentActivity(parent);

    } catch (error) {
        console.error("Dashboard error:", error);
    }
}


// ===============================
// LOAD PARENT NAME
// ===============================

function loadParentName() {
    const parentNameElements = [
        document.getElementById("parentName"),
        document.getElementById("welcomeParentName"),
        document.getElementById("dashboardParentName")
    ];

    const username =
        localStorage.getItem("parentUsername") ||
        sessionStorage.getItem("parentUsername") ||
        "Parent";

    parentNameElements.forEach((element) => {
        if (element) {
            element.textContent = username;
        }
    });
}


// ===============================
// GRADE POINT
// ===============================

function getGradePoint(grade) {
    const gradePoints = {
        A: 5,
        B: 4,
        C: 3,
        D: 2,
        E: 1,
        F: 0
    };

    return gradePoints[String(grade).toUpperCase()] ?? 0;
}


// ===============================
// CALCULATE CGPA
// ===============================

function calculateCgpa(results) {
    if (!results || results.length === 0) {
        return 0;
    }

    let totalPoints = 0;

    results.forEach((result) => {
        totalPoints += getGradePoint(result.grade);
    });

    return totalPoints / results.length;
}


// ===============================
// DASHBOARD STATISTICS
// ===============================

function loadDashboardStats(parent) {
    const students = parent.students || [];
    const results = parent.results || [];
    const notifications = parent.notifications || [];

    // These IDs match parent-dashboard.html
    const linkedWardsElement =
        document.getElementById("dashboardWardCount");

    const latestCgpaElement =
        document.getElementById("dashboardCgpa");

    const unreadNotificationsElement =
        document.getElementById("dashboardNotifications");


    // Linked wards
    if (linkedWardsElement) {
        linkedWardsElement.textContent =
            students.length;
    }


    // Latest CGPA
    if (latestCgpaElement) {
        const cgpa = calculateCgpa(results);

        latestCgpaElement.textContent =
            cgpa > 0
                ? cgpa.toFixed(2)
                : "--";
    }


    // Unread notifications
    if (unreadNotificationsElement) {
        const unreadCount = notifications.filter(
            (notification) =>
                notification.is_read === false
        ).length;

        unreadNotificationsElement.textContent =
            unreadCount;
    }
}


// ===============================
// LOAD MY WARDS
// ===============================

function loadDashboardWards(parent) {
    const students = parent.students || [];
    const results = parent.results || [];

    const wardsContainer =
        document.getElementById("dashboardWards");

    if (!wardsContainer) {
        return;
    }

    wardsContainer.innerHTML = "";


    if (students.length === 0) {
        wardsContainer.innerHTML =
            "<p>No linked wards found.</p>";

        return;
    }


    students.forEach((student) => {
        const studentResults = results.filter(
            (result) =>
                String(result.student) ===
                String(student.id)
        );

        const cgpa =
            calculateCgpa(studentResults);

        const wardCard =
            document.createElement("div");

        wardCard.className = "ward-card";

        wardCard.innerHTML = `
            <div class="ward-info">
                <h3>${student.name}</h3>

                <p>
                    ${student.matric_number}
                </p>

                <p>
                    ${student.department}
                </p>

                <p>
                    Level ${student.level}
                </p>
            </div>

            <div class="ward-cgpa">
                <span>Current CGPA</span>

                <strong>
                    ${cgpa > 0
                        ? cgpa.toFixed(2)
                        : "--"}
                </strong>
            </div>
        `;

        wardsContainer.appendChild(
            wardCard
        );
    });
}


// ===============================
// ACADEMIC PERFORMANCE
// ===============================

function loadAcademicPerformance(parent) {
    const students = parent.students || [];
    const results = parent.results || [];

    const studentName =
        document.getElementById(
            "performanceStudentName"
        );

    const studentInfo =
        document.getElementById(
            "performanceStudentInfo"
        );

    const performanceCgpa =
        document.getElementById(
            "performanceCgpa"
        );

    const performanceStanding =
        document.getElementById(
            "performanceStanding"
        );

    const performanceSemester =
        document.getElementById(
            "performanceSemester"
        );


    if (students.length === 0) {
        if (studentName) {
            studentName.textContent = "--";
        }

        if (studentInfo) {
            studentInfo.textContent = "--";
        }

        if (performanceCgpa) {
            performanceCgpa.textContent = "--";
        }

        if (performanceStanding) {
            performanceStanding.textContent = "--";
        }

        if (performanceSemester) {
            performanceSemester.textContent = "--";
        }

        return;
    }


    // Display the first linked ward
    const student = students[0];


    // Student name
    if (studentName) {
        studentName.textContent =
            student.name;
    }


    // Student information
    if (studentInfo) {
        studentInfo.textContent =
            `${student.matric_number} · ${student.department}`;
    }


    // Get this student's results
    const studentResults = results.filter(
        (result) =>
            String(result.student) ===
            String(student.id)
    );


    // Calculate CGPA
    const cgpa =
        calculateCgpa(studentResults);


    if (performanceCgpa) {
        performanceCgpa.textContent =
            cgpa > 0
                ? cgpa.toFixed(2)
                : "--";
    }


    // Academic standing
    if (performanceStanding) {
        if (cgpa >= 3.5) {
            performanceStanding.textContent =
                "Excellent Standing";
        } else if (cgpa >= 2.5) {
            performanceStanding.textContent =
                "Good Standing";
        } else if (cgpa >= 2.0) {
            performanceStanding.textContent =
                "Satisfactory";
        } else if (cgpa > 0) {
            performanceStanding.textContent =
                "Academic Probation";
        } else {
            performanceStanding.textContent =
                "--";
        }
    }


    // Latest semester
    if (performanceSemester) {
        if (studentResults.length > 0) {
            const latestResult =
                studentResults[
                    studentResults.length - 1
                ];

            performanceSemester.textContent =
                latestResult.semester || "--";
        } else {
            performanceSemester.textContent =
                "--";
        }
    }
}


// ===============================
// RECENT ACTIVITY
// ===============================

function loadRecentActivity(parent) {
    const notifications =
        parent.notifications || [];

    const activityContainer =
        document.getElementById(
            "recentActivity"
        );

    if (!activityContainer) {
        return;
    }

    activityContainer.innerHTML = "";


    if (notifications.length === 0) {
        activityContainer.innerHTML =
            "<p>No recent activity.</p>";

        return;
    }


    // Show latest notifications first
    const recentNotifications =
        [...notifications]
            .sort(
                (a, b) =>
                    new Date(b.created_at) -
                    new Date(a.created_at)
            )
            .slice(0, 5);


    recentNotifications.forEach(
        (notification) => {
            const activityItem =
                document.createElement("div");

            activityItem.className =
                "activity-item";

            activityItem.innerHTML = `
                <div class="activity-content">
                    <strong>
                        ${notification.title}
                    </strong>

                    <p>
                        ${notification.message}
                    </p>
                </div>
            `;

            activityContainer.appendChild(
                activityItem
            );
        }
    );
}