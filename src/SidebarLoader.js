async function loadSidebar() {
    try {
        const res = await fetch('../../GUI/Components/Sidebar.html');
        const html = await res.text();

        const container = document.getElementById('sidebar-container');
        container.innerHTML = html;

        // Marca el nav-link que coincide con la página actual
        const currentPage = window.location.pathname.split('/').pop();
        const links = container.querySelectorAll('.nav-link');
        links.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });

    } catch (error) {
        console.error('Error cargando sidebar:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadSidebar);
