import React from 'react';
import { Switch, Route } from 'react-router-dom';
import autoBind from "auto-bind"


import Header from './Header';
import Home from './Home';
import NotFound from './NotFound';

import '../style/App.css';

class App extends React.Component {
    
    constructor(props)
    {
        super(props);

        this.state = {
            user: null
        }

        autoBind(this);
    }

    loginHandler(user)
    {
        this.setState({
            user: user
        })
    }

    render()
    {
        return (
            <div className="App">
                {/* Header is here because it will always render in the website. It also gives login status to every other page */}
                <Header user={this.state.user} loginHandler={this.loginHandler}/>
                <Switch>
                    <Route exact path='/' component={Home} />
                    <Route path='*' component={NotFound} />
                </Switch>
            </div>
        );
    }
    
}

export default App;
