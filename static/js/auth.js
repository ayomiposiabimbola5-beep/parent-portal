 
/* =========================================
   PARENT / ADMIN AUTHENTICATION
========================================= */


/* =========================================
   LOGIN
========================================= */

const loginForm =
    document.getElementById("parentLoginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

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
                document.getElementById("loginMessage");


            try {

                const response = await fetch(
                    "/api/login/",
                    {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username: parentId,
                            password: password
                        })
                    }
                );


                const data =
                    await response.json();


                /* =========================================
                   SUCCESSFUL LOGIN
                ========================================= */

                if (
                    response.ok &&
                    data.success
                ) {

                    /* Store login state */

                    sessionStorage.setItem(
                        "parentLoggedIn",
                        "true"
                    );


                    /* Store username */

                    sessionStorage.setItem(
                        "parentName",
                        data.username || parentId
                    );


                    /* Store administrator status */

                    sessionStorage.setItem(
                        "isStaff",
                        data.is_staff
                            ? "true"
                            : "false"
                    );


                    message.textContent =
                        "Login successful. Redirecting...";


                    message.style.color =
                        "#15803d";


                    /*
                       ADMIN / STAFF ACCOUNT
                       goes to admin page
                    */

                    if (data.is_staff) {

                        window.location.href =
                            " /admin/";

                    }

                    /*
                       NORMAL PARENT ACCOUNT
                       goes to parent dashboard
                    */

                    else {

                        window.location.href =
                            " /parent-dashboard/";

                    }

                }


                /* =========================================
                   LOGIN FAILED
                ========================================= */

                else {

                    message.textContent =
                        data.message ||
                        "Invalid Parent / Guardian ID or password.";


                    message.style.color =
                        "#dc2626";

                }


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                message.textContent =
                    "Unable to connect to the server.";


                message.style.color =
                    "#dc2626";

            }

        }
    );

}


/* =========================================
   CURRENT PAGE
========================================= */

const currentPage =
    window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();


/* =========================================
   PROTECTED PARENT PAGES
========================================= */

const protectedParentPages = [

    " parent-dashboard.html",

    "results.html",

    "my-wards.html",

    "notifications.html",

    "account-settings.html"

];


/* =========================================
   PROTECTED ADMIN PAGES
========================================= */

const protectedAdminPages = [

    "admin.html"

];


/* =========================================
   CHECK PARENT LOGIN
========================================= */

if (
    protectedParentPages.includes(
        currentPage
    )
) {

    const loggedIn =
        sessionStorage.getItem(
            "parentLoggedIn"
        );


    const isStaff =
        sessionStorage.getItem(
            "isStaff"
        );


    /*
       Administrator accounts should not
       be treated as normal parent accounts
       on parent pages.
    */

    if (loggedIn !== "true") {

        window.location.replace(
            " /parent-login/"
        );

    }

    else if (isStaff === "true") {

        window.location.replace(
            " /admin/"
        );

    }

}


/* =========================================
   CHECK ADMIN LOGIN
========================================= */

if (
    protectedAdminPages.includes(
        currentPage
    )
) {

    const loggedIn =
        sessionStorage.getItem(
            "parentLoggedIn"
        );


    const isStaff =
        sessionStorage.getItem(
            "isStaff"
        );


    /*
       Not logged in
    */

    if (loggedIn !== "true") {

        window.location.replace(
            "parent-login.html"
        );

    }


    /*
       Logged in but NOT administrator
    */

    else if (isStaff !== "true") {

        window.location.replace(
            "parent-dashboard.html"
        );

    }

}


/* =========================================
   LOGOUT
========================================= */

async function logout() {

    try {

        /*
           Tell Django to destroy the
           server-side session.
        */

        await fetch(
            "/api/logout/",
            {
                method: "POST",

                credentials: "include"
            }
        );

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }


    /*
       Clear browser session data.
    */

    sessionStorage.removeItem(
        "parentLoggedIn"
    );


    sessionStorage.removeItem(
        "parentName"
    );


    sessionStorage.removeItem(
        "isStaff"
    );


    /*
       Return to login page.
    */

    window.location.replace(
        " /parent-login/"
    );

}
 
