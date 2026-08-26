import { Route, Switch } from 'wouter'
import { Dashboard } from './Dashboard'
import { CanvasPage } from '@/canvas/CanvasPage'
import { ProjectPage } from './ProjectPage'
import { Empty } from './Empty'
import { ShellSidebar } from './ShellSidebar'

export function App() {
  return (
    /* The rail owns the viewport height and the routed column scrolls inside it,
       so the canvas can be exactly as tall as the window while the dashboard and
       the project page still scroll. Scrolling the document instead would carry
       the rail off the top of the screen, which is the one thing it may not do. */
    <div className="flex h-dvh">
      <ShellSidebar />
      <div className="min-w-0 flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/p/:slug" component={ProjectPage} />
          <Route path="/p/:slug/canvas" component={CanvasPage} />
          <Route>
            <Empty title="Not found" detail="No route matches this URL." />
          </Route>
        </Switch>
      </div>
    </div>
  )
}
