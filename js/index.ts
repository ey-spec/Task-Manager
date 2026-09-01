declare const Swal: any;
// ========================== open and close form =================================
const addTask = document.getElementById("add-task") as HTMLButtonElement;
const modalOvarlay = document.getElementById("modal-ovarlay") as HTMLDivElement;
const closeModalBtn = document.getElementById(
  "close-modal-btn",
) as HTMLButtonElement;
const cancelBtm = document.getElementById("cancel-btn") as HTMLButtonElement;
const taskModal = document.getElementById("task-modal") as HTMLDivElement;

function openModal(): void {
  modalOvarlay.classList.replace("hidden", "flex");
  document.getElementById("modal-title")!.textContent = "Create New Task";
  document.getElementById("submit-btn")!.innerHTML = `
    <i class="fa-solid fa-plus"></i>
    <span id="submit-btn-text">Add Task</span>
  `;
  clearform();
}

function closeModal(): void {
  modalOvarlay.classList.replace("flex", "hidden");
  editingTaskId = null;
}

addTask.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelBtm.addEventListener("click", closeModal);

modalOvarlay.addEventListener("click", (e: MouseEvent) => {
  if (!taskModal.contains(e.target as Node)) {
    closeModal();
  }
});

// ==================== types =====================

type TaskStatus = "todo" | "in-progress" | "completed";
type TaskPriority = "low" | "medium" | "high";

interface Task {
  id: string;
  createdAt: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  description: string;
}

// ==================== render todo =====================

function renderTodoTasks(): void {
  const container = document.getElementById("task-todo") as HTMLDivElement;
  const todoTasks = tasks.filter((task) => task.status === "todo");

  container.innerHTML = todoTasks.length
    ? todoTasks
        .map((task) => {
          const globalIndex = tasks.findIndex((t) => t.id === task.id);
          return buildTaskCard(task, globalIndex);
        })
        .join("")
    : emptyState();
}

// ==================== render in progress =====================

function renderInProgressTasks(): void {
  const container = document.getElementById(
    "task-in-progress",
  ) as HTMLDivElement;
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress");

  container.innerHTML = inProgressTasks.length
    ? inProgressTasks
        .map((task) => {
          const globalIndex = tasks.findIndex((t) => t.id === task.id);
          return buildTaskCard(task, globalIndex);
        })
        .join("")
    : emptyState();
}

// ==================== render completed =====================

function renderCompletedTasks(): void {
  const container = document.getElementById("task-completed") as HTMLDivElement;
  const completedTasks = tasks.filter((task) => task.status === "completed");

  container.innerHTML = completedTasks.length
    ? completedTasks
        .map((task) => {
          const globalIndex = tasks.findIndex((t) => t.id === task.id);
          return buildTaskCard(task, globalIndex);
        })
        .join("")
    : emptyState();
}

// ====================== Add Task ===========================

const form = document.getElementById("task-form") as HTMLFormElement;
const taskTitleInput = document.getElementById(
  "task-title",
) as HTMLInputElement;
const taskPriorityInput = document.getElementById(
  "task-priority",
) as HTMLSelectElement;
const taskDueDateInput = document.getElementById(
  "task-due-date",
) as HTMLInputElement;
const taskDescriptionInput = document.getElementById(
  "task-description",
) as HTMLTextAreaElement;
let editingTaskId: string | null = null;

let tasks: Task[] = JSON.parse(localStorage.getItem("task") || "[]");

function addtask(): void {
  const task: Task = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    title: taskTitleInput.value,
    status: "todo",
    priority: taskPriorityInput.value as TaskPriority,
    dueDate: taskDueDateInput.value,
    description: taskDescriptionInput.value,
  };
  tasks.push(task);

  Swal.fire({
    title: "Task added successfully!",
    icon: "success",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    background: "#00c897",
    color: "#fff",
  });
}

function clearform(): void {
  taskTitleInput.value = "";
  taskDescriptionInput.value = "";
  taskPriorityInput.value = "medium";
  taskDueDateInput.value = "";
  document.getElementById("title-error")!.classList.add("hidden");

  taskTitleInput.classList.remove(...errorClasses);
  taskTitleInput.classList.add(...successClasses);
}

// ==================== Render Tasks =====================

function getRelativeTime(timestamp: number): string {
  const secondsAgo = Math.floor((Date.now() - timestamp) / 1000);

  if (secondsAgo < 60) return "Just Now";

  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `${minutesAgo}m ago`;

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo}h ago`;

  const daysAgo = Math.floor(hoursAgo / 24);
  return `${daysAgo}d ago`;
}

function isDueSoon(dueDate: string): boolean {
  if (!dueDate) return false;

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilDue = (due.getTime() - today.getTime()) / msPerDay;

  return daysUntilDue >= 0 && daysUntilDue <= 2;
}

function formatDueDate(dueDate: string): string {
  if (!dueDate) return "";

  const date = new Date(dueDate);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface PriorityStyle {
  bg: string;
  text: string;
  dot: string;
  label: string;
}

const priorityStyles: Record<TaskPriority, PriorityStyle> = {
  low: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-500",
    label: "Low",
  },
  medium: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-500",
    label: "Medium",
  },
  high: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    label: "High",
  },
};

interface StatusButton {
  status: TaskStatus;
  label: string;
  icon: string;
  classes: string;
}

const statusButtons: Record<TaskStatus, StatusButton[]> = {
  todo: [
    {
      status: "in-progress",
      label: "Start",
      icon: "fa-play",
      classes: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    },
    {
      status: "completed",
      label: "Complete",
      icon: "fa-check",
      classes: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
    },
  ],
  "in-progress": [
    {
      status: "todo",
      label: "To Do",
      icon: "fa-arrow-rotate-left",
      classes:
        "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700",
    },
    {
      status: "completed",
      label: "Complete",
      icon: "fa-check",
      classes: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
    },
  ],
  completed: [
    {
      status: "todo",
      label: "To Do",
      icon: "fa-arrow-rotate-left",
      classes:
        "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700",
    },
    {
      status: "in-progress",
      label: "Start",
      icon: "fa-play",
      classes: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    },
  ],
};

const statusDot: Record<TaskStatus, string> = {
  todo: "bg-slate-300",
  "in-progress": "bg-amber-400",
  completed: "bg-emerald-500",
};

function emptyState(): string {
  return `
    <div class="flex flex-col items-center justify-center py-12 text-slate-400">
      <i class="fa-regular fa-folder-open text-4xl mb-3 opacity-50"></i>
      <p class="text-sm">No tasks yet</p>
      <p class="text-xs mt-1">Click + to add one</p>
    </div>
  `;
}

function buildTaskCard(task: Task, index: number): string {
  const priority = priorityStyles[task.priority];
  const buttons = statusButtons[task.status];
  const dot = statusDot[task.status];
  const dueSoon = isDueSoon(task.dueDate);

  const buttonsHTML = buttons
    .map((button) => {
      return `
        <button
          class="status-btn text-[11px] px-3 py-2 rounded-lg font-semibold
          transition-all duration-200 flex items-center gap-1.5
          hover:scale-105 active:scale-95 ${button.classes}"
          data-status="${button.status}" data-id="${task.id}"
        >
          <i class="fa-solid ${button.icon} pointer-events-none"></i>
          <span class="pointer-events-none">${button.label}</span>
        </button>
      `;
    })
    .join("");

  return `<div
              class="group bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200"
            >
              <!-- Top bar -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full ${dot}"></span>
                  <span
                    class="text-[10px] font-medium text-slate-400 uppercase tracking-wider"
                    >#${String(index + 1).padStart(3, "0")}</span
                  >
                </div>
                <div
                  class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    class="edit-btn text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    data-id="${task.id}"
                  >
                    <i class="fa-solid fa-pen text-xs pointer-events-none"></i>
                  </button>
                  <button
                    class="delete-btn text-slate-400 hover:text-red-500 hover:bg-red-50 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    data-id="${task.id}"
                  >
                    <i
                      class="fa-solid fa-trash-can text-xs pointer-events-none"
                    ></i>
                  </button>
                </div>
              </div>
              <h3 class="font-semibold text-slate-800 mb-2 leading-snug">
                ${task.title}
              </h3>
              <p
                class="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2"
              >
                ${task.description}
              </p>
              <!-- Tags row -->
              <div class="flex flex-wrap items-center gap-2 mb-4">
                <span
                  class="${priority.bg} ${priority.text} text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wide"
                >
                  <span class="w-1.5 h-1.5 rounded-full ${priority.dot}"> </span>
                  ${priority.label}
                </span>
                ${
                  dueSoon
                    ? `<span class="bg-orange-100 text-orange-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
                        Due Soon
                      </span>`
                    : ""
                }
  
                ${
                  task.status === "completed"
                    ? `<span
                  class="bg-emerald-100 text-emerald-600 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide inline-flex items-center gap-1"
                >
                  <i class="fa-solid fa-check"></i>
                  Done
                </span>`
                    : ""
                }
              </div>
              <!-- Meta info -->
              <div class="flex items-center gap-3 text-xs text-slate-400 pb-3 mb-3 border-b border-slate-100">
                <div class="flex items-center gap-1.5 ${dueSoon ? "text-orange-500" : ""}">
                  <i class="fa-regular fa-calendar"></i>
                  <span>${formatDueDate(task.dueDate)}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <i class="fa-regular fa-clock"></i>
                  <span>${getRelativeTime(task.createdAt)}</span>
                </div>
              </div>
              <!-- Action Buttons -->
              <div class="flex flex-wrap gap-2">
                ${buttonsHTML}
              </div>
            </div>`;
}

// ============================= buttons toggling ====================================

document
  .getElementById("columns-container")!
  .addEventListener("click", (e: MouseEvent) => {
    const button = (e.target as HTMLElement).closest(
      ".status-btn",
    ) as HTMLElement | null;
    if (!button) return;

    const taskId = button.dataset.id as string;
    const newStatus = button.dataset.status as TaskStatus;

    const selectedTask = tasks.find((task) => taskId === task.id);
    if (!selectedTask) return;

    selectedTask.status = newStatus;
    localStorage.setItem("task", JSON.stringify(tasks));
    renderCompletedTasks();
    renderInProgressTasks();
    renderTodoTasks();
  });

renderTodoTasks();
renderInProgressTasks();
renderCompletedTasks();

setInterval(() => {
  renderTodoTasks();
  renderInProgressTasks();
  renderCompletedTasks();
}, 60000);

// =============================== Edit Task ==========================================

document
  .getElementById("columns-container")!
  .addEventListener("click", (e: MouseEvent) => {
    const editBtn = (e.target as HTMLElement).closest(
      ".edit-btn",
    ) as HTMLElement | null;

    if (!editBtn) return;

    openModal();
    document.getElementById("modal-title")!.textContent = "Edit Task";
    document.getElementById("submit-btn")!.innerHTML = `
    <i class="fa-solid fa-save"></i>
    <span id="submit-btn-text">Save Changes</span>
  `;

    const taskId = editBtn.dataset.id as string;

    const selectedTask = tasks.find((task) => taskId === task.id);
    if (!selectedTask) return;

    editingTaskId = selectedTask.id;

    taskTitleInput.value = selectedTask.title;
    taskPriorityInput.value = selectedTask.priority;
    taskDescriptionInput.value = selectedTask.description;
    taskDueDateInput.value = selectedTask.dueDate;
  });

function updateTask(): void {
  const taskToUpdate = tasks.find((t) => t.id === editingTaskId);
  if (!taskToUpdate) return;

  taskToUpdate.title = taskTitleInput.value;
  taskToUpdate.priority = taskPriorityInput.value as TaskPriority;
  taskToUpdate.dueDate = taskDueDateInput.value;
  taskToUpdate.description = taskDescriptionInput.value;

  Swal.fire({
    title: "Task updated successfully!",
    icon: "success",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    background: "#00c897",
    color: "#fff",
  });
}

// ====================== Handles edit or add ==============================

form.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();

  if (!titleValidation()) {
    return;
  }

  if (editingTaskId !== null) {
    updateTask();
  } else {
    addtask();
  }

  editingTaskId = null;

  localStorage.setItem("task", JSON.stringify(tasks));
  closeModal();
  clearform();
  renderTodoTasks();
  renderInProgressTasks();
  renderCompletedTasks();
});

// ======================= Delete ========================

document
  .getElementById("columns-container")!
  .addEventListener("click", (e: MouseEvent) => {
    const deleteBtn = (e.target as HTMLElement).closest(
      ".delete-btn",
    ) as HTMLElement | null;

    if (!deleteBtn) return;

    const taskId = deleteBtn.dataset.id as string;

    const index = tasks.findIndex((task) => task.id === taskId);

    if (index !== -1) {
      tasks.splice(index, 1);
    }

    localStorage.setItem("task", JSON.stringify(tasks));
    renderTodoTasks();
    renderInProgressTasks();
    renderCompletedTasks();
  });

// ============================== Validation ========================================

const errorClasses: string[] = [
  "border-red-500",
  "focus:ring-red-500",
  "focus:border-red-500",
];
const successClasses: string[] = [
  "border-slate-300",
  "focus:ring-indigo-500",
  "focus:border-indigo-500",
];

function titleValidation(): boolean {
  const titleValue = taskTitleInput.value.trim();
  const titleError = document.getElementById(
    "title-error",
  ) as HTMLParagraphElement;

  titleError.classList.add("hidden");

  taskTitleInput.classList.remove(...errorClasses);
  taskTitleInput.classList.add(...successClasses);

  if (titleValue === "") {
    titleError.textContent = "Task title is required";
    titleError.classList.remove("hidden");

    taskTitleInput.classList.remove(...successClasses);
    taskTitleInput.classList.add(...errorClasses);

    return false;
  }

  if (titleValue.length < 3) {
    titleError.textContent = "Title must be at least 3 characters";
    titleError.classList.remove("hidden");

    taskTitleInput.classList.remove(...successClasses);
    taskTitleInput.classList.add(...errorClasses);

    return false;
  }

  return true;
}

taskTitleInput.addEventListener("input", () => {
  const titleValue = taskTitleInput.value.trim();

  if (titleValue === "") {
    document.getElementById("title-error")!.classList.add("hidden");

    taskTitleInput.classList.remove(...errorClasses);
    taskTitleInput.classList.add(...successClasses);

    return;
  }

  titleValidation();
});
