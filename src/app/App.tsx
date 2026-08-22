import { Route, Switch } from 'wouter'
import { Dashboard } from './Dashboard'
import { CanvasPage } from '@/canvas/CanvasPage'
import { Empty } from './Empty'

export function App() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/p/:slug" component={CanvasPage} />
      <Route>
        <Empty title="Not found" detail="No route matches this URL." />
      </Route>
    </Switch>
  )
}
