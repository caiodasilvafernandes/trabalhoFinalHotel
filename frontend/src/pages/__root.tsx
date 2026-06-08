import { HeadContent, Outlet, createRootRouteWithContext } from '@tanstack/react-router'

interface RouterContext {
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
     <>
      <HeadContent />
      <Outlet />
    </>
  )
}
