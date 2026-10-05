/* =========================================
   PARENT PORTAL NOTIFICATIONS
========================================= */

const API_BASE_URL = "/api";


/* =========================================
   LOAD NOTIFICATIONS FROM DJANGO
========================================= */

async function loadNotifications() {

    const container =
        document.getElementById(
            "notificationsContainer"
        );

    const unreadCount =
        document.getElementById(
            "unreadCount"
        );

    if (!container) {
        return;
    }

    try {

    const response =
    await fetch(
        `${API_BASE_URL}/notifications/`,
        {
            credentials: "include"
        }
    );
        if (!response.ok) {
            throw new Error(
                "Unable to load notifications."
            );
        }

        const notifications =
            await response.json();


        container.innerHTML = "";

        let unread = 0;


        notifications.forEach(
            function(notification) {

                if (!notification.is_read) {
                    unread++;
                }


                const item =
                    document.createElement("div");


                item.className =
                    notification.is_read
                        ? "notification-item read"
                        : "notification-item unread";


                const date =
                    notification.created_at
                        ? new Date(
                            notification.created_at
                        ).toLocaleDateString(
                            "en-US",
                            {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                            }
                        )
                        : "";


                item.innerHTML = `

                    <div class="notification-icon">
                        ${getNotificationIcon(
                            notification.title
                        )}
                    </div>


                    <div class="notification-content">

                        <div class="notification-top">

                            <h3>
                                ${notification.title}
                            </h3>

                            ${
                                notification.is_read
                                    ? ""
                                    : `
                                        <span class="new-badge">
                                            NEW
                                        </span>
                                      `
                            }

                        </div>


                        <p>
                            ${notification.message}
                        </p>


                        <span class="notification-date">
                            ${date}
                        </span>


                        ${
                            notification.is_read
                                ? ""
                                : `
                                    <button
                                        class="mark-read-button"
                                        onclick="markAsRead(${notification.id})">

                                        Mark as read

                                    </button>
                                  `
                        }

                    </div>

                `;


                container.appendChild(item);

            }
        );


        unreadCount.textContent =
            unread;


    } catch (error) {

        console.error(
            "Unable to load notifications:",
            error
        );

        container.innerHTML = `
            <p>
                Unable to load notifications.
            </p>
        `;

    }

}


/* =========================================
   NOTIFICATION ICON
========================================= */

function getNotificationIcon(title) {

    const text =
        String(title || "").toLowerCase();


    if (
        text.includes("result") ||
        text.includes("academic")
    ) {
        return "📊";
    }


    if (text.includes("account")) {
        return "🔐";
    }


    return "🔔";
}


/* =========================================
   MARK ONE AS READ
========================================= */

function markAsRead(id) {

    /*
       Backend mark-as-read endpoint
       will be added later.

       For now, reload the notification
       list from Django.
    */

    console.log(
        "Mark notification as read:",
        id
    );

}


/* =========================================
   MARK ALL AS READ
========================================= */

function markAllAsRead() {

    /*
       Backend mark-all-as-read endpoint
       will be added later.
    */

    console.log(
        "Mark all notifications as read"
    );

}


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadNotifications();

    }
);