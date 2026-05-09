const currentPage = window.location.pathname;

const menuItems = [
  { name: "Trang chủ", icon: "home", link: "../home/home.html" },
  {
    name: "Quản lý khách hàng",
    icon: "group",
    link: "../customer/customer.html",
  },
  {
    name: "Quản lý hướng dẫn viên",
    icon: "person_pin",
    link: "../tour-guide/guide.html",
  },
  {
    name: "Quản lý Tour du lịch",
    icon: "map",
    link: "../tour/tour_standard.html",
  },
  { name: "Chat", icon: "chat", link: "../chat/chat.html" },
  {
    name: "Trạng thái đơn hàng",
    icon: "receipt_long",
    link: "../book-tour/book_tour.html",
  },
  { name: "Cài đặt", icon: "settings", link: "../settings/settings.html" },
];

let navHtml = menuItems
  .map((item) => {
    const isActive =
      currentPage.includes(item.link.replace("..", "")) ||
      (item.name === "Quản lý khách hàng" &&
        currentPage.includes("/customer/")) ||
      (item.name === "Quản lý hướng dẫn viên" &&
        currentPage.includes("/tour-guide/")) ||
      (item.name === "Quản lý Tour du lịch" && currentPage.includes("/tour/")) ||
      (item.name === "Trạng thái đơn hàng" && currentPage.includes("/book-tour/"));
    const activeClass =
      "bg-slate-200 text-blue-700 rounded-lg transition-all duration-150 ease-in-out scale-95 shadow-sm";
    const inactiveClass =
      "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 transition-colors group";

    return `
        <a class="flex items-center gap-3 px-4 py-3 ${isActive ? activeClass : inactiveClass} font-['Manrope'] font-semibold text-sm rounded-lg" href="${item.link}">
            <span class="material-symbols-outlined ${!isActive ? "group-hover:scale-110" : ""} transition-transform" data-icon="${item.icon}">${item.icon}</span>
            <span>${item.name}</span>
        </a>
    `;
  })
  .join("");

document.getElementById("sidebar-container").innerHTML = `
    <nav class="h-screen w-72 fixed left-0 top-0 bg-slate-100 dark:bg-slate-900 flex flex-col p-6 gap-2 z-50">
        <div class="flex items-center gap-3 mb-8 px-2">
            <div class="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-md">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">explore</span>
            </div>
            <div>
                <h1 class="text-xl font-bold font-['Manrope'] text-blue-900 dark:text-blue-100 leading-tight">Admin Dashboard</h1>
                <p class="text-[10px] uppercase tracking-widest text-slate-500 font-bold opacity-80">Tour Mate</p>
            </div>
        </div>
        <div class="flex flex-col gap-1 flex-grow overflow-y-auto no-scrollbar">
            ${navHtml}
        </div>
        <div class="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">

            <button class="flex items-center justify-center gap-3 px-4 py-3 w-full text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-['Manrope'] font-semibold text-sm rounded-lg">
                <span class="material-symbols-outlined text-sm" data-icon="logout">logout</span>
                <span>Đăng xuất</span>
            </button>
        </div>
    </nav>
`;
