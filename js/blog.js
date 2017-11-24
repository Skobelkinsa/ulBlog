function openCloseSideMenu() {
    var open_btn = document.getElementById('open-side-menu');
    var close_btn = document.getElementById('close-side-menu');
    var sidemenu = document.getElementById('side-menu');

    if (!open_btn || !close_btn || !sidemenu) {
        return false;
    }

    open_btn.addEventListener('click', function () {
        sidemenu.classList.add('is-side-menu-open');
        this.classList.add('is-state-close');
    });

    close_btn.addEventListener('click', function () {
        sidemenu.classList.remove('is-side-menu-open');
        open_btn.classList.remove('is-state-close');
    });
}
$(document).ready(function () {
    openCloseSideMenu();
    $('body').on('click', '.blog-head_search > .icon-search', function () {
        $(this).css('display', 'none');
        $(this).next('.blog-head_search-toggle').toggleClass('hidden');
    });
});