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
        //console.log(user_s)
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
            else
            {
                if (this.props.location.pathname === "/admin")
                    this.props.history.push("/");
            }
        });
    }

    async updateHandler(username, password)
    {
        Axios.post('/api/login', {
            username: username,
            password: password
        })
        .then(res => {
            if (res.data.error)
                console.error(res.data.message);
                
            this.setState({user: res.data.data}, () => sessionStorage.setItem('LoggedUser', JSON.stringify(res.data.data)));
            
        })
        .catch(err => console.log(err));
    }

    render()
    {
        return (
            <div className="App">
                {/* Header is here because it will always render in the website. It also gives login status to every other page */}
                <Header user={this.state.user} loginHandler={this.loginHandler}/>
                {/* <Menu active={this.props.location.pathname}/> */}
                <Switch>
                    <Route exact path='/' render={ () => <Home user={this.state.user}/> } />
                    <Route path='/search' component={SearchResults} />
                    <Route path='/auction/:id' render= { () => <AuctionPage user={this.state.user}/> } />
                    <Route path='/user/:username/:tab?/:action?' render={ (props) => {
                        return (
                            <UserPage user={this.state.user}
                                username={props.match.params.username}
                                tab={props.match.params.tab}
                                action={props.match.params.action}
                                updateHandler={this.updateHandler}
                            />
                        )
                    }}/>
                    <Route path='/admin' render={ () => <AdminPage user={this.state.user}/>} />
                    <Route path='*' component={NotFound} />
                </Switch>
            </div>
        );
    }

}

export default withRouter(App);
