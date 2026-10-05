/* =========================================
   UNIVERSITY PARENT PORTAL
   APPLICATION LOGIC
   ========================================= */


/* =========================================
   BACKEND API
   ========================================= */

const API_BASE_URL =
    "/api";
 async function loadAccountProfile() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/profile/`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load profile.");
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.message || "Unable to load profile."
            );
        }

        const fullName =
            document.getElementById("fullName");

        const email =
            document.getElementById("email");

        if (fullName) {
            fullName.value = data.full_name;
        }

        if (email) {
            email.value = data.email;
        }

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

    }

}

/* =========================================
   GRADE POINTS
   ========================================= */

const GRADE_POINTS = {
    A: 5,
    B: 4,
    C: 3,
    D: 2,
    E: 1,
    F: 0
};


/* =========================================
   HELPER: FETCH JSON
   ========================================= */

async function fetchJson(url) {

    const response =
        await fetch(url, {
            credentials: "include"
        });

    if (!response.ok) {
        throw new Error(
            `Request failed: ${response.status}`
        );
    }

    return await response.json();
}


/* =========================================
   HELPER: CALCULATE GPA
   ========================================= */

function calculateGpa(results) {

    if (!results || results.length === 0) {
        return 0;
    }

    let totalPoints = 0;

    results.forEach(function(result) {

        const grade =
            String(result.grade || "")
                .trim()
                .toUpperCase();

        const point =
            GRADE_POINTS[grade] ?? 0;

        /*
           The current Django Result model
           does not contain course units.

           For the current project data,
           each course is treated as 3 units.
        */

        const units = 3;

        totalPoints += point * units;

    });

    const totalUnits =
        results.length * 3;

    if (totalUnits === 0) {
        return 0;
    }

    return totalPoints / totalUnits;
}


/* =========================================
   HELPER: CALCULATE CGPA
   ========================================= */

function calculateBackendCgpa(
    allResults,
    studentId
) {

    if (!allResults || allResults.length === 0) {
        return 0;
    }

    const studentResults =
        allResults.filter(function(result) {

            return Number(result.student) ===
                Number(studentId);

        });

    if (studentResults.length === 0) {
        return 0;
    }

    return calculateGpa(
        studentResults
    );
}


/* =========================================
   HELPER: ACADEMIC STANDING
   ========================================= */

function getAcademicStanding(gpa) {

    if (gpa >= 4.50) {
        return "Excellent Standing";
    }

    if (gpa >= 3.50) {
        return "Very Good Standing";
    }

    if (gpa >= 2.50) {
        return "Good Standing";
    }

    if (gpa >= 1.50) {
        return "Satisfactory Standing";
    }

    return "Academic Warning";
}


/* =========================================
   LOAD RESULT
   ========================================= */

async function loadResult() {

    const studentSelect =
        document.getElementById(
            "studentSelect"
        );

    const sessionSelect =
        document.getElementById(
            "sessionSelect"
        );

    const semesterSelect =
        document.getElementById(
            "semesterSelect"
        );


    if (
        !studentSelect ||
        !sessionSelect ||
        !semesterSelect
    ) {
        return;
    }


    const studentId =
        studentSelect.value;

    const session =
        sessionSelect.value;

    const semester =
        semesterSelect.value;


    if (!studentId) {
        return;
    }


    try {

        /*
           Get students from Django.
        */

        const students =
            await fetchJson(
                `${API_BASE_URL}/students/`
            );


        /*
           Get all results from Django.
        */

        const allResults =
            await fetchJson(
                `${API_BASE_URL}/results/`
            );


        /*
           Find selected student.
        */

        const student =
            students.find(function(item) {

                return Number(item.id) ===
                    Number(studentId);

            });


        if (!student) {

            console.error(
                "Selected student was not found."
            );

            return;
        }


        /*
           Find results for the selected
           student, session and semester.
        */

        const selectedResults =
            allResults.filter(function(result) {

                return (
                    Number(result.student) ===
                        Number(student.id)

                    &&

                    result.session ===
                        session

                    &&

                    result.semester ===
                        semester
                );

            });


        /*
           If no result exists for the
           selected period, clear the table
           instead of using old demo data.
        */

        if (selectedResults.length === 0) {

            updateStudentInformation({

                name: student.name,

                studentId:
                    student.matric_number,

                faculty:
                    "Computing",

                department:
                    student.department,

                level:
                    student.level

            });


            updateResultSummary({

                gpa: 0,

                cgpa:
                    calculateBackendCgpa(
                        allResults,
                        student.id
                    ),

                units: 0,

                standing:
                    "No Result Available",

                semester:
                    semester

            });


            updateCourses([]);

            return;
        }


        /*
           Convert Django student data
           into the structure expected by
           the existing frontend functions.
        */

        const displayStudent = {

            name:
                student.name,

            studentId:
                student.matric_number,

            faculty:
                "Computing",

            department:
                student.department,

            level:
                student.level

        };


        /*
           Calculate current semester GPA.
        */

        const gpa =
            calculateGpa(
                selectedResults
            );


        /*
           Calculate overall CGPA.
        */

        const cgpa =
            calculateBackendCgpa(
                allResults,
                student.id
            );


        /*
           Convert backend results into
           the format expected by the
           existing course table.
        */

        const courses =
            selectedResults.map(
                function(result) {

                    const grade =
                        String(
                            result.grade || ""
                        )
                        .trim()
                        .toUpperCase();


                    return {

                        code:
                            result.course_code,

                        title:
                            result.course_title,

                        units: 3,

                        grade:
                            grade,

                        point:
                            GRADE_POINTS[grade] ?? 0

                    };

                }
            );


        /*
           Update student information.
        */

        updateStudentInformation(
            displayStudent
        );


        /*
           Update result summary.
        */

        updateResultSummary({

            gpa:
                gpa,

            cgpa:
                cgpa,

            units:
                courses.length * 3,

            standing:
                getAcademicStanding(gpa),

            semester:
                semester

        });


        /*
           Update course table.
        */

        updateCourses(
            courses
        );


    } catch (error) {

        console.error(
            "Unable to load academic result:",
            error
        );

        updateCourses([]);

    }

}


/* =========================================
   STUDENT INFORMATION
   ========================================= */

function updateStudentInformation(
    student
) {

    const studentName =
        document.querySelector(
            "[data-student-name]"
        );

    const studentId =
        document.querySelector(
            "[data-student-id]"
        );

    const studentInitials =
        document.querySelector(
            "[data-student-initials]"
        );

    const studentFaculty =
        document.querySelector(
            "[data-student-faculty]"
        );

    const studentDepartment =
        document.querySelector(
            "[data-student-department]"
        );

    const studentLevel =
        document.querySelector(
            "[data-student-level]"
        );


    if (studentName) {

        studentName.textContent =
            student.name;

    }


    if (studentId) {

        studentId.textContent =
            student.studentId;

    }


    if (studentInitials) {

        const nameParts =
            student.name.split(" ");

        const initials =
            nameParts
                .map(function(part) {

                    return part.charAt(0);

                })
                .slice(0, 2)
                .join("");

        studentInitials.textContent =
            initials;

    }


    if (studentFaculty) {

        studentFaculty.textContent =
            student.faculty;

    }


    if (studentDepartment) {

        studentDepartment.textContent =
            student.department;

    }


    if (studentLevel) {

        studentLevel.textContent =
            student.level;

    }

}


/* =========================================
   RESULT SUMMARY
   ========================================= */

function updateResultSummary(
    result
) {

    const gpa =
        document.querySelector(
            "[data-gpa]"
        );

    const cgpa =
        document.querySelector(
            "[data-cgpa]"
        );

    const units =
        document.querySelector(
            "[data-units]"
        );

    const standing =
        document.querySelector(
            "[data-standing]"
        );

    const semesterTitle =
        document.querySelector(
            "[data-semester]"
        );


    if (gpa) {

        gpa.textContent =
            Number(result.gpa).toFixed(2);

    }


    if (cgpa) {

        cgpa.textContent =
            Number(result.cgpa).toFixed(2);

    }


    if (units) {

        units.textContent =
            result.units;

    }


    if (standing) {

        standing.textContent =
            result.standing;

    }


    if (semesterTitle) {

        semesterTitle.textContent =
            `${result.semester} Results`;

    }

}


/* =========================================
   COURSE TABLE
   ========================================= */

function updateCourses(
    courses
) {

    const table =
        document.getElementById(
            "courseTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (
        !courses ||
        courses.length === 0
    ) {

        const row =
            document.createElement(
                "tr"
            );

        row.innerHTML = `
            <td
                colspan="5"
                style="text-align: center;"
            >
                No results available for
                the selected period.
            </td>
        `;

        table.appendChild(row);

        return;
    }


    courses.forEach(
        function(course) {

            const row =
                document.createElement(
                    "tr"
                );


            let gradeClass =
                "grade-b";


            if (course.grade === "A") {

                gradeClass =
                    "grade-a";

            } else if (
                course.grade === "C"
            ) {

                gradeClass =
                    "grade-c";

            } else if (
                course.grade === "D"
            ) {

                gradeClass =
                    "grade-d";

            } else if (
                course.grade === "E"
            ) {

                gradeClass =
                    "grade-e";

            } else if (
                course.grade === "F"
            ) {

                gradeClass =
                    "grade-f";

            }


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
                    ${Number(course.point).toFixed(2)}
                </td>
            `;


            table.appendChild(row);

        }
    );

}


/* =========================================
   POPULATE STUDENT DROPDOWN
   ========================================= */

async function populateStudentDropdown() {

    const studentSelect =
        document.getElementById(
            "studentSelect"
        );


    if (!studentSelect) {
        return;
    }


    try {

        const students =
            await fetchJson(
                `${API_BASE_URL}/students/`
            );


        studentSelect.innerHTML = "";


        if (
            !students ||
            students.length === 0
        ) {

            const option =
                document.createElement(
                    "option"
                );

            option.value = "";

            option.textContent =
                "No linked students";

            studentSelect.appendChild(
                option
            );

            return;
        }


        students.forEach(
            function(student) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    student.id;


                option.textContent =
                    student.name;


                studentSelect.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Student dropdown error:",
            error
        );

        studentSelect.innerHTML = "";

        const option =
            document.createElement(
                "option"
            );

        option.value = "";

        option.textContent =
            "Unable to load students";

        studentSelect.appendChild(
            option
        );

    }

}


/* =========================================
   INITIALIZE RESULT PAGE
   ========================================= */
async function initializeResultPage() {

    const courseTable = document.getElementById("courseTable");

    // Make sure we are actually on the Academic Results page
    if (!courseTable) {
        return;
    }

    try {

        // Load students from the backend
        await populateStudentDropdown();

        const studentSelect = document.getElementById("studentSelect");
        const sessionSelect = document.getElementById("sessionSelect");
        const semesterSelect = document.getElementById("semesterSelect");

        if (!studentSelect || !sessionSelect || !semesterSelect) {
            console.error("Result page controls were not found.");
            return;
        }

        // Get results from the backend
        const allResults = await fetchJson(
            `${API_BASE_URL}/results/`
        );

        console.log("Backend results:", allResults);

        // If results exist, automatically select the latest
        // session and semester available in the backend.
        if (allResults.length > 0) {

            const latestResult = allResults[allResults.length - 1];

            const latestSession = latestResult.session;
            const latestSemester = latestResult.semester;

            // Select the backend session if it exists in the dropdown
            const sessionOption = Array.from(
                sessionSelect.options
            ).find(function(option) {
                return option.value === latestSession;
            });

            if (sessionOption) {
                sessionSelect.value = latestSession;
            }

            // Select the backend semester
            const semesterOption = Array.from(
                semesterSelect.options
            ).find(function(option) {
                return option.value === latestSemester;
            });

            if (semesterOption) {
                semesterSelect.value = latestSemester;
            }
        }

        // Load the result using the selected values
        await loadResult();

        // Reload result when student changes
        studentSelect.addEventListener(
            "change",
            function() {
                loadResult();
            }
        );

        // Reload result when session changes
        sessionSelect.addEventListener(
            "change",
            function() {
                loadResult();
            }
        );

        // Reload result when semester changes
        semesterSelect.addEventListener(
            "change",
            function() {
                loadResult();
            }
        );

    } catch (error) {

        console.error(
            "Failed to initialize Academic Results page:",
            error
        );

    }
}
/* =========================================
   MY WARDS
   ========================================= */

async function loadWards() {

    const container =
        document.getElementById(
            "wardsContainer"
        );

    const wardCount =
        document.getElementById(
            "wardCount"
        );


    /*
       Only run on My Wards page.
    */

    if (!container) {
        return;
    }


    try {

        const students =
            await fetchJson(
                `${API_BASE_URL}/students/`
            );


        /*
           Update ward count.
        */

        if (wardCount) {

            wardCount.textContent =
                `${students.length} ${
                    students.length === 1
                        ? "Ward"
                        : "Wards"
                }`;

        }


        /*
           No students.
        */

        if (
            !students ||
            students.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-state">

                    <h3>
                        No linked wards
                    </h3>

                    <p>
                        No students are currently
                        linked to this parent account.
                    </p>

                </div>
            `;

            return;
        }


        /*
           Clear old cards.
        */

        container.innerHTML = "";


        /*
           Create one card for every
           backend student.
        */

        students.forEach(
            function(student) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "ward-card";


                const initial =
                    student.name
                        ? student.name
                            .charAt(0)
                            .toUpperCase()
                        : "?";


                card.innerHTML = `

                    <div class="ward-card-header">

                        <div class="student-avatar">
                            ${initial}
                        </div>

                        <div>

                            <h3>
                                ${student.name}
                            </h3>

                            <p>
                                ${student.matric_number}
                            </p>

                        </div>

                    </div>


                    <div class="ward-details">

                        <div>

                            <span>
                                Faculty
                            </span>

                            <strong>
                                Computing
                            </strong>

                        </div>


                        <div>

                            <span>
                                Department
                            </span>

                            <strong>
                                ${student.department}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Level
                            </span>

                            <strong>
                                ${student.level}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Status
                            </span>

                            <strong
                                class="status-active"
                            >
                                Active
                            </strong>

                        </div>

                    </div>


                    <div class="ward-card-footer">

                        <a
                            href="results.html"
                            class="primary-button"
                        >
                            View Academic Results

                            <span>
                                →
                            </span>

                        </a>

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Unable to load wards:",
            error
        );


        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load wards
                </h3>

                <p>
                    Please make sure the
                    Django backend is running.
                </p>

            </div>

        `;

    }

}


/* =========================================
   INITIALIZE MY WARDS PAGE
   ========================================= */

function initializeWardsPage() {

    const container =
        document.getElementById(
            "wardsContainer"
        );


    if (!container) {
        return;
    }


    loadWards();

}


/* =========================================
   LINK WARD MODAL
   ========================================= */

function openLinkModal() {

    const modal =
        document.getElementById(
            "linkModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


function closeLinkModal() {

    const modal =
        document.getElementById(
            "linkModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


/* =========================================
   LINK WARD
   ========================================= */

async function linkWard() {

    const wardIdInput =
        document.getElementById("newWardId");

    const wardPinInput =
        document.getElementById("newWardPin");


    if (!wardIdInput || !wardPinInput) {

        return;

    }


    const wardId =
        wardIdInput.value.trim();

    const pin =
        wardPinInput.value.trim();


    if (!wardId) {

        alert("Please enter a valid Student ID.");

        return;

    }


    if (!pin) {

        alert("Please enter the student's Secret PIN.");

        return;

    }


    /*
       Make sure the parent is still logged in.
    */

    const username =
        sessionStorage.getItem("parentName");


    if (!username) {

        alert("Please log in again.");

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/link-ward/`,
                {

                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        student_id: wardId,

                        pin: pin

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "Unable to link ward."
            );

            return;

        }


        alert(
            "Ward linked successfully!"
        );


        wardIdInput.value = "";

        wardPinInput.value = "";


        closeLinkModal();


        /*
           Refresh the ward list.
        */

        await loadWards();


    } catch (error) {

        console.error(
            "Unable to link ward:",
            error
        );


        alert(
            "Unable to connect to the backend. Please make sure Django is running."
        );

    }

}
/* =========================================
   PAGE INITIALIZATION
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
           Academic Results page
        */

        initializeResultPage();


        /*
           My Wards page
        */

        initializeWardsPage();

        loadAccountProfile();

    }
);