// Router class for handling navigation
export class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.navigate(window.location.pathname, false);
        });

        // Handle navigation events
        window.addEventListener('navigate', (e) => {
            this.navigate(e.detail.path);
        });

        // Initial route
        this.navigate(window.location.pathname, false);
    }

    async navigate(path, pushState = true) {
        // Find matching route
        const route = this.routes.find(r => r.path === path) || this.routes.find(r => r.path === '/');
        
        if (pushState) {
            window.history.pushState({}, '', path);
        }

        // Update current route
        this.currentRoute = route;

        // Load and render component
        try {
            const module = await route.component();
            const component = module.default;
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = '';
            new component(mainContent);
        } catch (error) {
            console.error('Error loading route:', error);
            // Show error in debug info if available
            if (window.debugInfo) {
                window.debugInfo.addLog(`Error loading route: ${error.message}`);
            }
        }
    }
}

// Initialize router with routes
const routes = [
    {
        path: '/',
        component: () => import('../components/Home.js')
    },
    {
        path: '/tokens',
        component: () => import('../components/Tokens.js')
    },
    {
        path: '/transactions',
        component: () => import('../components/Transactions.js')
    },
    {
        path: '/settings',
        component: () => import('../components/Settings.js')
    }
];

export const router = new Router(routes);
