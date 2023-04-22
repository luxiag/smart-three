import {
    createRouter,
    createWebHashHistory
} from 'vue-router'



export const router = createRouter({
    routes: [{
        path: '/',
        redirect: '/cityScene',
        component: () => import('@/layout/index.vue'),
        children: [{
            path: "cityScene",
            component: () => import('@/pages/cityScene/index.vue')
        }, {
            path: "cityRegion",
            component: () => import('@/pages/cityRegion/index.vue')
        }, {
            path: "cityTraffic",
            component: () => import('@/pages/cityTraffic/index.vue')
        }]
    }, ],
    history: createWebHashHistory()
})

export async function setupRouter(app) {
    app.use(router)
    await router.isReady()
}

export default router