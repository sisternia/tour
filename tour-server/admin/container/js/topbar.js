document.getElementById("topbar-container").innerHTML = `
    <header class="fixed top-0 right-0 left-72 flex justify-between items-center px-10 py-4 z-40 bg-slate-50/90 backdrop-blur-xl border-b border-slate-200 transition-all duration-300">
        <div class="flex items-center gap-4 flex-1">
            <div class="relative w-full max-w-md">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
                <input class="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-lg focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none transition-all border-none text-sm" placeholder="Tìm kiếm..." type="text" />
            </div>
        </div>
        <div class="flex items-center gap-2">
            <button class="hover:bg-slate-200/50 rounded-full p-2 transition-all">
                <span class="material-symbols-outlined text-slate-500" data-icon="notifications">notifications</span>
            </button>
            <div class="h-8 w-[1px] bg-outline-variant/30 mx-2"></div>
            <div class="flex items-center gap-3 pl-2">
                <div class="text-right">
                    <p class="text-sm font-bold font-headline text-on-surface">Admin User</p>
                    <p class="text-[10px] font-medium text-on-surface-variant uppercase tracking-tighter">Super Admin</p>
                </div>
                <img alt="Admin User" class="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDtsarVA0nEhbcficew1W5DEvtKRnVVWEridQ-8MqczuiJERQfrcvZVu-Cve_vuIHvBeRf5LDXjaqiTYhYmRpB0tngToUTW0UPNHVdVqBbfJ4grp8-BrdnXwCPiyXa1yqXrZeveR84tHJDkPxweX3hzrf_Nuv2SO1UlA9K_9K42ZsHbzIvmWmMyN9jbLowfJT02kEXTaexBmTpr48yppnmSQPEpUyVzjZUSazD2pcW51szReteTBcl6JuFZH2HIgivzrfls61P-Rs" />
            </div>
        </div>
    </header>
    <div class="h-[72px]"></div>
`;
