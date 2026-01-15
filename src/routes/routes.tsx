import { lazy, type JSX } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import type { RouteObject } from "react-router";
import {
    AlertOutlined,
    AuditOutlined,
    CloudOutlined,
    CompassOutlined,
    DashboardOutlined,
    HistoryOutlined,
    SlidersOutlined,
    VideoCameraOutlined,
} from "@ant-design/icons";

import Layout from "@/layout";
import { req } from "@/utils/reqeust";
import { useUserStore } from "@/store/user";
import { permanence } from "@/utils/permanence";

function ProtectedRoute({
    Component,
    roles,
}: {
    Component: React.ComponentType;
    roles: string[];
}): JSX.Element {
    const localUserStore = permanence.user.useUserStore()!;
    let userStore = localUserStore;
    if (!localUserStore) userStore = useUserStore();

    const role = userStore.role;
    if (!roles.includes(role)) {
        if (role === "expert") return <Navigate to="/expert" replace />;
        return <Navigate to="/403" replace />;
    }
    return <Component />;
}

export const ALL_ROUTES: RouteObject[] = [
    {
        index: true,
        element: (
            <ProtectedRoute
                roles={["guest", "user", "admin"]}
                Component={lazy(() => import("@/views/dashboard"))}
            />
        ),
        handle: {
            key: "/",
            name: "数字地图",
            Icon: CompassOutlined,
            roles: ["guest", "user", "admin"],
        },
    },
    {
        path: "operations",
        element: (
            <ProtectedRoute
                roles={["guest", "user", "admin"]}
                Component={lazy(() => import("@/views/operations"))}
            />
        ),
        handle: {
            key: "/operations",
            name: "操作指导",
            Icon: AlertOutlined,
            roles: ["guest", "user", "admin"],
        },
    },
    {
        path: "weather",
        element: (
            <ProtectedRoute
                roles={["guest", "user", "admin"]}
                Component={lazy(() => import("@/views/weather"))}
            />
        ),
        handle: {
            key: "/weather",
            name: "天气物候",
            Icon: CloudOutlined,
            roles: ["guest", "user", "admin"],
        },
    },
    {
        path: "call-model",
        element: (
            <ProtectedRoute
                roles={["user", "admin"]}
                Component={lazy(() => import("@/views/model"))}
            />
        ),
        handle: {
            key: "/call-model",
            name: "模型调用",
            Icon: SlidersOutlined,
            roles: ["user", "admin"],
        },
    },
    // {
    //   path: "statistic",
    //   Component: lazy(() => import("@/views/statistic")),
    //   handle: {
    //     key: "/statistic",
    //     name: "统计数据",
    //     Icon: SlidersOutlined,
    //     roles: ["guest", "user", "admin"],
    //   },
    // },
    {
        path: "monitor",
        element: (
            <ProtectedRoute roles={["admin"]} Component={lazy(() => import("@/views/monitor"))} />
        ),
        handle: {
            key: "/monitor",
            name: "监控操作",
            Icon: VideoCameraOutlined,
            roles: ["admin"],
        },
    },
    {
        path: "expert",
        element: (
            <ProtectedRoute
                roles={["expert", "admin"]}
                Component={lazy(() => import("@/views/expert"))}
            />
        ),
        handle: {
            key: "/expert",
            name: "专家打标",
            Icon: AuditOutlined,
            roles: ["expert", "admin"],
        },
    },
    {
        path: "/expert-history",
        element: (
            <ProtectedRoute
                roles={["expert", "admin"]}
                Component={lazy(() => import("@/views/expert/children/history"))}
            />
        ),
        handle: {
            key: "/expert-history",
            name: "修改历史",
            Icon: HistoryOutlined,
            roles: ["expert", "admin"],
        },
    },
    {
        path: "admin",
        element: (
            <ProtectedRoute roles={["admin"]} Component={lazy(() => import("@/views/admin"))} />
        ),
        handle: {
            key: "/admin",
            name: "用户管理",
            Icon: DashboardOutlined,
            roles: ["admin"],
        },
    },
];

const routes: RouteObject[] = [
    {
        path: "/",
        Component: Layout,
        children: ALL_ROUTES,
        loader: async () => {
            // Validate token
            const token = permanence.token.useToken();
            try {
                const resp = await req.get<{ data: { isExpired: boolean } }>(
                    "/user/validate-token",
                    {
                        Authorization: `Bearer ${token}`,
                    },
                );

                return resp.data;
            } catch {
                return {
                    isExpired: true,
                };
            }
        },
    },
    {
        path: "/login",
        Component: lazy(() => import("@/views/login")),
    },
    {
        path: "/403",
        Component: lazy(() => import("@/layout/Forbidden")),
    },
    {
        path: "/*",
        Component: lazy(() => import("@/layout/NotFound")),
    },
];

export default createBrowserRouter(routes);
