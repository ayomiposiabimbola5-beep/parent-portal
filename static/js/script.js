/* =========================================
   UNIVERSITY PARENT ACCESS SYSTEM
   JAVASCRIPT
========================================= */


/* =========================================
   DEMO PARENT ACCOUNT
========================================= */

const demoParent = {
    id: "PG2025001",
    password: "123456",
    name: "Mr. Abimbola"
};


/* =========================================
   PARENT LOGIN
========================================= */

const loginForm =
    document.getElementById("parentLoginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const parentId =
                document
                    .getElementById("parentId")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value
                    .trim();


            const message =
                document.getElementById(
                    "loginMessage"
                );


            if (
                parentId === demoParent.id &&
                password === demoParent.password
            ) {

                /*
                 * DEMO ONLY
                 *
                 * In the real system this will
                 * be handled by the backend.
                 */

                sessionStorage.setItem(
                    "parentLoggedIn",
                    "true"
                );

                sessionStorage.setItem(
                    "parentName",
                    demoParent.name
                );


                message.textContent =
                    "Authentication successful.";

                message.style.color =
                    "#15803d";


                setTimeout(() => {

                    window.location.href =
                        "parent-dashboard.html";

                }, 700);


            } else {

                message.textContent =
                    "Invalid Parent / Guardian ID or password.";

                message.style.color =
                    "#dc2626";

            }

        }
    );

}


/* =========================================
   AUTHENTICATION GUARD
========================================= */

const page = document.body.dataset.page;


/*
 * Only dashboard and results require login.
 */

if (
    page === "dashboard" ||
    page === "results"
) {

    const loggedIn =
        sessionStorage.getItem("parentLoggedIn");

    if (loggedIn !== "true") {

        window.location.replace(
            "parent-login.html"
        );

    }

}


/* =========================================
   LOGOUT
========================================= */

function logout() {

    sessionStorage.removeItem(
        "parentLoggedIn"
    );

    sessionStorage.removeItem(
        "parentName"
    );

    window.location.href =
        "index.html";

}


/* =========================================
   MOBILE SIDEBAR
========================================= */

function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (sidebar) {

        sidebar.classList.toggle(
            "open"
        );

    }

}


/* =========================================
   UNIVERSITY RESULT DATA
========================================= */

const studentResults = {

    ayo: {

        name:
            "Ayomiposi Abimbola",

        studentId:
            "2021/CSC/12345",

        faculty:
            "Computing",

        department:
            "Computer Science",

        level:
            "400",

        sessions: {

            "2025/2026": {

                first: {

                    semesterGPA: 4.45,

                    cgpa: 4.32,

                    units: 18,

                    standing:
                        "Excellent",

                    courses: [

                        {
                            code: "CSC 401",
                            title:
                                "Software Engineering",
                            units: 3,
                            grade: "A",
                            point: 5.00
                        },

                        {
                            code: "CSC 403",
                            title:
                                "Database Management",
                            units: 3,
                            grade: "B",
                            point: 4.00
                        },

                        {
                            code: "CSC 405",
                            title:
                                "Computer Networks",
                            units: 3,
                            grade: "A",
                            point: 5.00
                        },

                        {
                            code: "CSC 407",
                            title:
                                "Artificial Intelligence",
                            units: 3,
                            grade: "B",
                            point: 4.00
                        },

                        {
                            code: "GST 411",
                            title:
                                "Project Management",
                            units: 3,
                            grade: "A",
                            point: 5.00
                        }

                    ]

                },


                second: {

                    semesterGPA: 4.60,

                    cgpa: 4.45,

                    units: 18,

                    standing:
                        "Excellent",

                    courses: [

                        {
                            code: "CSC 402",
                            title:
                                "Software Testing",
                            units: 3,
                            grade: "A",
                            point: 5.00
                        },

                        {
                            code: "CSC 404",
                            title:
                                "Web Application Development",
                            units: 3,
                            grade: "A",
                            point: 5.00
                        },

                        {
                            code: "CSC 406",
                            title:
                                "Operating Systems",
                            units: 3,
                            grade: "B",
                            point: 4.00
                        },

                        {
                            code: "CSC 408",
                            title:
                                "Information Security",
                            units: 3,
                            grade: "A",
                            point: 5.00
                        },

                        {
                            code: "CSC 410",
                            title:
                                "Final Year Project",
                            units: 3,
                            grade: "A",
                            point: 5.00
                        }

                    ]

                }

            }

        }

    }

};


/* =========================================
   LOAD UNIVERSITY RESULT
========================================= */

function loadUniversityResult() {

    const student =
        document.getElementById(
            "studentSelect"
        )?.value;


    const session =
        document.getElementById(
            "sessionSelect"
        )?.value;


    const semester =
        document.getElementById(
            "semesterSelect"
        )?.value;


    if (
        !student ||
        !session ||
        !semester
    ) {

        return;

    }


    const studentData =
        studentResults[student];


    if (!studentData) {

        alert(
            "Student record could not be found."
        );

        return;

    }


    const result =
        studentData.sessions
            [session]?.[semester];


    if (!result) {

        alert(
            "No result is currently available for the selected academic period."
        );

        return;

    }


    /* =====================================
       UPDATE GPA
    ===================================== */

    const semesterGPA =
        document.getElementById(
            "semesterGPA"
        );

    const cgpa =
        document.getElementById(
            "cgpa"
        );


    if (semesterGPA) {

        semesterGPA.textContent =
            result.semesterGPA.toFixed(2);

    }


    if (cgpa) {

        cgpa.textContent =
            result.cgpa.toFixed(2);

    }


    /* =====================================
       CREDIT UNITS
    ===================================== */

    const creditUnits =
        document.querySelector(
            ".gpa-card:nth-child(3) strong"
        );


    if (creditUnits) {

        creditUnits.textContent =
            result.units;

    }


    /* =====================================
       ACADEMIC STANDING
    ===================================== */

    const standing =
        document.querySelector(
            ".gpa-card .standing"
        );


    if (standing) {

        standing.textContent =
            result.standing;

    }


    /* =====================================
       SEMESTER TITLE
    ===================================== */

    const semesterTitle =
        document.querySelector(
            ".courses-header h2"
        );


    const semesterNames = {

        first:
            "First Semester Results",

        second:
            "Second Semester Results"

    };


    if (semesterTitle) {

        semesterTitle.textContent =
            semesterNames[semester];

    }


    /* =====================================
       COURSE TABLE
    ===================================== */

    const table =
        document.getElementById(
            "courseTable"
        );


    if (!table) return;


    table.innerHTML = "";


    result.courses.forEach(
        course => {


            const gradeClass =
                course.grade === "A"
                    ? "grade-a"
                    : "grade-b";


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${course.code}
                </td>

                <td>
                    ${course.title}
                </td>

                <td>
                    ${course.units}
                </td>

                <td>

                    <span
                        class="grade ${gradeClass}"
                    >
                        ${course.grade}
                    </span>

                </td>

                <td>
                    ${course.point.toFixed(2)}
                </td>

            `;


            table.appendChild(row);

        }
    );

}


/* =========================================
   INITIAL RESULT
========================================= */

if (
    document.getElementById(
        "courseTable"
    )
) {

    loadUniversityResult();

}