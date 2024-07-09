const loginForm = document.getElementById("loginForm");
const notification = document.getElementById("notification");
const fetchTodosBtn = document.getElementById("fetchTodosBtn");
const todosList = document.getElementById("todosList");

const apiUrl = "https://json-with-auth.onrender.com";

// Event listener for login form submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    // Send POST request to login endpoint
    const response = await fetch(`${apiUrl}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const userData = await response.json();
    const { userAuthToken, userId } = userData;

    // Store token and userId in local storage
    localStorage.setItem("userAuthToken", userAuthToken);
    localStorage.setItem("userId", userId);

    // Show welcome notification
    showNotification(`Hey ${username}, welcome back!`, "success");
  } catch (error) {
    console.error("Login error:", error);
    showNotification("Login failed. Please check your credentials.", "error");
  }
});

// Event listener for fetch todos button
fetchTodosBtn.addEventListener("click", async () => {
  try {
    const userId = localStorage.getItem("userId");
    const userAuthToken = localStorage.getItem("userAuthToken");

    if (!userId || !userAuthToken) {
      throw new Error("User not authenticated");
    }

    // Fetch todos for the logged-in user
    const response = await fetch(`${apiUrl}/todos?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${userAuthToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch todos");
    }

    const todos = await response.json();
    displayTodos(todos);
  } catch (error) {
    console.error("Fetch todos error:", error);
    showNotification("Failed to fetch todos. Please try again.", "error");
  }
});

// Function to display todos in the UI
function displayTodos(todos) {
  todosList.innerHTML = "";
  todos.forEach((todo) => {
    const todoItem = document.createElement("div");
    todoItem.classList.add("todo-item");
    todoItem.innerHTML = `
      <input type="checkbox" id="todo-${todo.id}" ${
      todo.completed ? "checked" : ""
    }>
      <label for="todo-${todo.id}">${todo.title}</label>
    `;
    todoItem.querySelector("input").addEventListener("change", async (e) => {
      try {
        const checked = e.target.checked;
        const todoId = todo.id;
        const userAuthToken = localStorage.getItem("userAuthToken");

        // Send PATCH request to update todo completion status
        const response = await fetch(`${apiUrl}/todos/${todoId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userAuthToken}`,
          },
          body: JSON.stringify({ completed: checked }),
        });

        if (!response.ok) {
          throw new Error("Failed to update todo status");
        }

        showNotification("Todo status updated successfully", "success");
      } catch (error) {
        console.error("Update todo error:", error);
        showNotification(
          "Failed to update todo status. Please try again.",
          "error"
        );
      }
    });

    todosList.appendChild(todoItem);
  });
}

// Function to display notification
function showNotification(message, type) {
  notification.textContent = message;
  notification.className = `notification ${type}`;
}
