/* =========================================
   UNIVERSITY PARENT PORTAL DATA
========================================= */


const universityData = {


    /* =========================================
       PARENT ACCOUNTS
    ========================================= */

    parents: {

        PG2025001: {

            name: "Mr. Abimbola",

            wards: [
                "ayo"
            ]

        }

    },


    /* =========================================
       STUDENTS
    ========================================= */

    students: {


        ayo: {

            name: "Ayomiposi Abimbola",

            studentId: "2021/CSC/12345",

            faculty: "Computing",

            department: "Computer Science",

            level: "400",

            status: "Active",


            results: {


                "2025/2026": {


                    first: {

                        semester: "First Semester",

                        gpa: 4.45,

                        cgpa: 4.32,

                        units: 18,

                        standing: "Excellent",


                        courses: [

                            {
                                code: "CSC 401",
                                title: "Software Engineering",
                                units: 3,
                                grade: "A",
                                point: 5.00
                            },

                            {
                                code: "CSC 403",
                                title: "Database Management",
                                units: 3,
                                grade: "B",
                                point: 4.00
                            },

                            {
                                code: "CSC 405",
                                title: "Computer Networks",
                                units: 3,
                                grade: "A",
                                point: 5.00
                            },

                            {
                                code: "CSC 407",
                                title: "Artificial Intelligence",
                                units: 3,
                                grade: "B",
                                point: 4.00
                            },

                            {
                                code: "GST 411",
                                title: "Project Management",
                                units: 3,
                                grade: "A",
                                point: 5.00
                            }

                        ]

                    },


                    second: {

                        semester: "Second Semester",

                        gpa: 4.60,

                        cgpa: 4.45,

                        units: 18,

                        standing: "Excellent",


                        courses: [

                            {
                                code: "CSC 402",
                                title: "Software Testing",
                                units: 3,
                                grade: "A",
                                point: 5.00
                            },

                            {
                                code: "CSC 404",
                                title: "Web Application Development",
                                units: 3,
                                grade: "A",
                                point: 5.00
                            },

                            {
                                code: "CSC 406",
                                title: "Operating Systems",
                                units: 3,
                                grade: "B",
                                point: 4.00
                            },

                            {
                                code: "CSC 408",
                                title: "Information Security",
                                units: 3,
                                grade: "A",
                                point: 5.00
                            },

                            {
                                code: "CSC 410",
                                title: "Final Year Project",
                                units: 3,
                                grade: "A",
                                point: 5.00
                            }

                        ]

                    }

                }

            }

        }

    }

};