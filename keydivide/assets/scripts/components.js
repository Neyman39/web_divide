// Загрузка компонентов

// import { checkAuthAndDisplayUser } from './check_authorization.js';

async function loadComponent(componentName, targetElementId) {
    try {
        const response = await fetch(`../../components/${componentName}.html`);
        const html = await response.text();
        document.getElementById(targetElementId).innerHTML = html;
        
        // Инициализация компонента после загрузки
        if (componentName === 'nav_header') {
            await checkAuthAndDisplayUser();
        }
        if (componentName === 'header-phone') {
            initMobileNavigation();
        }
    } catch (error) {
        console.error(`Error loading ${componentName}:`, error);
    }
}

// export { loadComponent };