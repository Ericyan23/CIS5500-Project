import { createBrowserRouter } from 'react-router-dom';
import Main from '../pages/main';
import Home from '../pages/home';
import Player from '../pages/player';
import Team from '../pages/team';
import PageOne from '../pages/other/pageOne';
import PageTwo from '../pages/other/pageTwo';

const Router = createBrowserRouter([
    {
        path: '/',
        element: <Main />,
        children: [
            {
                path: 'home',
                element: <Home />
            },
            {
                path: 'player',
                element: <Player />
            },
            {
                path: 'team',
                element: <Team />
            },
            {
                path: 'other',
                children: [
                    {
                        path: 'pageOne',
                        element: <PageOne />
                    },
                    {
                        path: 'pageTwo',
                        element: <PageTwo />
                    }
                ]
            }
        ]
    }
]);

export default Router;
