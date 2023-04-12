import {
    createRouter,
    createWebHashHistory
} from 'vue-router'



export const router = createRouter({
    routes: [{
            path: '/',
            redirect: '/cityScene',
            component: () => import('@/layout/index.vue'),
            children:[
                {
                    path:"cityScene",
                    component: () => import('@/pages/cityScene/index.vue')
                }
            ]
        },
    ],
    history: createWebHashHistory()
})

export async function setupRouter(app) {
    app.use(router)
    await router.isReady()
}

export default router