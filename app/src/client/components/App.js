import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import autoBind from "auto-bind"

import Header, { Menu } from './Header';
import Home from './Home';
import SearchResults from './SearchResults';
import AdminPage from './Admin';
import AuctionPage from './Auction';
import UserPage from './User';
import NotFound from './NotFound';

import '../style/App.scss';
import Axios from 'axios';

class App extends React.Component {
    
    constructor(props)
    {
        super(props);

        const user_s = sessionStorage.getItem('LoggedUser');
        const user = user_s ? JSON.parse(user_s) : null;

        this.state = {
            user: user
        }

        autoBind(this);
    }

    loginHandler(user)
    {
        this.setState({
            user: user
        }, () => {
            if (user)
            {
                if (user.admin)
                {
                    this.props.history.push("/admin");
                }
            }
        });
    }

    updateHandler()
    {
        //Axios.post()
        //sessionStorage.setItem('LoggedUser', JSON.stringify(res.data.data));
    }

    render()
    {
        return (
            <div className="App">
                {/* Header is here because it will always render in the website. It also gives login status to every other page */}
                <Header user={this.state.user} loginHandler={this.loginHandler}/>
                <Menu active={this.props.location.pathname}/>
                <Switch>
                    <Route exact path='/' render={ () => <Home user={this.state.user}/> } />
                    <Route path='/search' component={SearchResults} />
                    <Route path='/auction/:id' component={AuctionPage} />
                    <Route path='/user/:username' render={(props) => <UserPage user={this.state.user}
                                                                               username={props.match.params.username}
                                                                               updateHandler={this.updateHandler()}
                                                                     />
                                                         }
                    />
                    <Route path='/admin' render={ () => <AdminPage user={this.state.user}/>} />
                    <Route path='*' component={NotFound} />
                </Switch>
            </div>
        );
    }
    
}

export default withRouter(App);
