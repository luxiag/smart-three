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
            meta:{
                name:"城市全景"
            },
            component: () => import('@/pages/cityScene/index.vue')
        }, {
            path: "cityRegion",
            meta:{
                name:"区域分析"
            },
            component: () => import('@/pages/cityRegion/index.vue')
        }, {
            path: "cityTraffic",
            meta:{
                name:"智慧交通"
            },
            component: () => import('@/pages/cityTraffic/index.vue')
        }
        , {
            path: "cityManage",
            meta:{
                name:"智慧管理"
            },
            component: () => import('@/pages/cityManage/index.vue')
        }  , {
            path: "cityPlan",
            meta:{
                name:"城市规划"
            },
            component: () => import('@/pages/cityPlan/index.vue')
        }
    ]
    }, ],
    history: createWebHashHistory()
})

export async function setupRouter(app) {
    app.use(router)
    await router.isReady()
}

export default router