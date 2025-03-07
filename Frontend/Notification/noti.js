// Sample data for notifications
// Import Notyf for notifications


// Initialize Notyf
const notyf = new Notyf();

// Fetch notifications and pending requests from localStorage
const notiOne = JSON.parse(localStorage.getItem("notiOne")) || [];
const notiTwo = JSON.parse(localStorage.getItem("notiTwo")) || [];

// Function to render notifications dynamically
function renderNotifications() {
    const notificationsSection = document.getElementById("notifications-section");

    // Clear existing notifications
    notificationsSection.innerHTML = "";

    // Render each notification
    notiOne.forEach(notification => {
        const notificationDiv = document.createElement("div");
        notificationDiv.classList.add("notification");

        // Check if it's a skill-request type
        if (notification.description.startsWith("You have received a request")) {
          console.log("hi")
            notificationDiv.innerHTML = `
                <div class="notification-content">
                    <p><strong>${notification.description}</strong></p>
                </div>
                <div class="notification-actions">
                    <button class="accept-btn">Accept</button>
                    <button class="decline-btn">Decline</button>
                </div>
            `;
        } else {
            // Default to memory-reminder type
            notificationDiv.innerHTML = `
                <div class="notification-content">
                    <p>${notification.description}</p>
                </div>
            `;
        }

        notificationsSection.appendChild(notificationDiv);
    });
}

// Function to handle accept/decline actions
async function handleRequestAction(accept) {
    try {
        // Get the first pending request from notiTwo
        const pendingRequest = notiTwo[0];

        if (!pendingRequest) {
            throw new Error("No pending request found.");
        }

        // Prepare the request body
        const requestBody = {
            request_id: pendingRequest.request_id,
            skill_id: pendingRequest.skill_id,
            accept: accept ? 1 : 0, // 1 for accept, 0 for decline
        };

        // Send the POST request
        const response = await fetch("http://localhost/skillSwap/skill-swap/notification_page.php/?accept_request", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("JWT"),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error("Failed to update request status.");
        }

        const result = await response.json();

        // Show success message
        notyf.success(accept ? "Request accepted!" : "Request declined!");

        // Optionally, refresh the notifications
        renderNotifications();
    } catch (error) {
        console.error("Error handling request action:", error);
        notyf.error(error.message);
    }
}

// Add interactivity to buttons
document.addEventListener("DOMContentLoaded", () => {
    renderNotifications();

    // Attach event listeners to accept/decline buttons
    document.querySelectorAll('.accept-btn').forEach(button => {
        button.addEventListener('click', () => handleRequestAction(true));
    });

    document.querySelectorAll('.decline-btn').forEach(button => {
        button.addEventListener('click', () => handleRequestAction(false));
    });
});